// services/studentProfile.service.js
import { User } from "../models/auth/user.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import { generateUsername } from "../utils/helper.js";
import { uploadBufferToCloud } from "../utils/cloudinary.js";

import { ParentProfile } from "../models/parent/parentProfile.model.js";
import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";
import { checkTransactionSupport } from "../utils/transactionHelper.js";

import {
  assertAdminOrStaff,
  assertOwnSchool,
} from "../utils/auth.helper.js";
import {
  getByIdOrThrow as getByIdOrThrowGeneric,
} from "../utils/db.helper.js";

export const createStudentService = async (adminUser, data, avatarFile) => {
  assertAdminOrStaff(adminUser);

  const {
    student_name,
    email,
    password,
    admission_no,
    gender,
    dob,
    transport_required,
    requestedGrade,
  } = data;

  if (!student_name || !email || !password || !admission_no) {
    throw new Error("student_name, email, password and admission_no are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error(`A user with the email "${email}" already exists`);
  }

  const existingAdmission = await StudentProfile.findOne({
    school_id: adminUser.school_id,
    admission_no
  });
  if (existingAdmission) {
    throw new Error(`Admission number ${admission_no} already exists in this school`);
  }

  const username = await generateUsername(email);

  let avatarData = {
    public_id: "",
    secure_url: "",
  };

  if (avatarFile) {
    const upload = await uploadBufferToCloud(avatarFile.buffer, "student_avatars");
    if (upload.success) {
      avatarData = {
        public_id: upload.public_id,
        secure_url: upload.secure_url,
      };
    }
  }

  const user = new User({
    name: student_name,
    username,
    email,
    school_id: adminUser.school_id,
    role: "student",
    status: "active",
    emailVerified: true, // admin created account; keep it active immediately
    profile_avatar: avatarData,
  });

  user.password = password;

  await user.save();

  try {
    const studentProfile = await StudentProfile.create({
      user_id: user._id,
      school_id: adminUser.school_id,
      admission_no,
      student_name,
      gender,
      dob: dob || null,
      transport_required: !!transport_required,
      requestedGrade: requestedGrade || null,
      createdBy: adminUser.id,
      updatedBy: adminUser.id,
    });

    return { user, studentProfile };
  } catch (err) {
    await User.findByIdAndDelete(user._id);
    throw err;
  }
};

export const updateStudentService = async (adminUser, studentId, data) => {
  assertAdminOrStaff(adminUser);

  const studentProfile = await getByIdOrThrowGeneric(StudentProfile, adminUser.school_id, studentId, "Student profile");

  delete data.user_id;
  delete data.school_id;
  delete data.admission_no;
  delete data.address;

  const user = await User.findById(studentProfile.user_id);
  if (!user) {
    throw new Error("Linked user not found");
  }

  if (data.student_name) {
    user.name = data.student_name;
  }

  Object.assign(studentProfile, data);
  studentProfile.updatedBy = adminUser.id;

  await user.save();
  await studentProfile.save();

  return { user, studentProfile };
};

export const getMyStudentProfileService = async (userId) => {
  const profile = await StudentProfile.findOne({ user_id: userId }).populate(
    "user_id",
    "name email role profile_avatar status",
  );

  if (!profile) {
    throw new Error("Student profile not found for this account");
  }

  return profile;
};

export const getAllStudentsService = async (schoolId) => {
  return StudentProfile.find({ school_id: schoolId })
    .populate("user_id", "name email role profile_avatar status")
    .sort({ createdAt: -1 });
};

export const getOneStudentService = async (studentId, schoolId) => {
  const studentProfile = await getByIdOrThrowGeneric(StudentProfile, schoolId, studentId, "Student profile");
  return studentProfile.populate(
    "user_id",
    "name email role profile_avatar status",
  );
};

export const deleteStudentService = async (adminUser, studentId) => {
  assertAdminOrStaff(adminUser);

  const studentProfile = await getByIdOrThrowGeneric(StudentProfile, adminUser.school_id, studentId, "Student profile");

  const user = await User.findById(studentProfile.user_id);
  if (user) {
    user.status = "inactive";
    await user.save();
  }

  studentProfile.status = "withdrawn";
  studentProfile.updatedBy = adminUser.id;
  await studentProfile.save();

  return studentProfile;
};

// ---------------------------------------------------
// ADMIN Password reset for (Parent+Student)
// ---------------------------------------------------
const generateSixDigitOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const assertSchoolAdmin = (user) => {
  if (!user || user.role !== "school_admin") {
    throw new Error("Only school admin can perform this action");
  }
  if (!user.school_id) {
    throw new Error("User is not linked to any school");
  }
};

const getLinkedParentProfileOrThrow = async (schoolId, studentProfileId, session = null) => {
  const query = ParentProfile.findOne({
    school_id: schoolId,
    children: studentProfileId,
  })
    .populate("user_id", "name email role status")
    .select("_id user_id children");

  if (session) query.session(session);

  const parentProfile = await query;

  if (!parentProfile || !parentProfile.user_id) {
    throw new Error("Linked parent account not found for this student");
  }

  return parentProfile;
};

export const requestLinkedPasswordResetOtpService = async (adminUser, studentId) => {
  assertSchoolAdmin(adminUser);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student id");
  }

  const studentProfile = await StudentProfile.findOne({
    _id: studentId,
    school_id: adminUser.school_id,
  }).select("_id user_id student_name school_id");

  if (!studentProfile) {
    throw new Error("Student profile not found in your school");
  }

  const studentUser = await User.findOne({
    _id: studentProfile.user_id,
    school_id: adminUser.school_id,
    role: "student",
  }).select("name email role status otp_code otp_expiry");

  if (!studentUser) {
    throw new Error("Linked student user not found");
  }

  if (!studentUser.email) {
    throw new Error("Student email is missing. Cannot send OTP");
  }

  const parentProfile = await getLinkedParentProfileOrThrow(
    adminUser.school_id,
    studentProfile._id
  );

  const otp = generateSixDigitOtp();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

  studentUser.otp_code = otp;
  studentUser.otp_expiry = otpExpiry;
  await studentUser.save();

  try {
    await sendEmail({
      from: `"S-Cool" <${process.env.EMAIL_USER}>`,
      to: studentUser.email,
      subject: "Password Reset Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #2563eb; text-align: center;">Password Reset Verification</h2>
          <p>Hello ${studentUser.name || studentProfile.student_name || "Student"},</p>
          <p>An administrator requested a password reset for your linked student account and parent account.</p>
          <p>Use the following 6-digit code to verify the request. This code is valid for <strong>10 minutes</strong>.</p>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px;">If this was not expected, please contact your school administration.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">S-Cool Security Team</p>
        </div>
      `,
    });
  } catch (emailErr) {
    logger.error("Failed to send linked password OTP email:", emailErr);

    studentUser.otp_code = undefined;
    studentUser.otp_expiry = undefined;
    await studentUser.save();

    throw new Error("Failed to send OTP email");
  }

  return {
    message: "OTP sent to student email",
    student: {
      studentId: studentProfile._id,
      name: studentProfile.student_name,
      email: studentUser.email,
    },
    parent: {
      parentUserId: parentProfile.user_id._id,
      name: parentProfile.user_id.name || null,
      email: parentProfile.user_id.email || null,
    },
    otpSentTo: studentUser.email,
    expiresInMinutes: 10,
  };
};

export const verifyLinkedPasswordResetOtpService = async (
  adminUser,
  studentId,
  otp,
  newPassword
) => {
  assertSchoolAdmin(adminUser);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student id");
  }

  if (!otp || !newPassword) {
    throw new Error("otp and newPassword are required");
  }

  const useTransaction = await checkTransactionSupport();
  let session = null;

  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      session = null;
    }
  }

  try {
    const studentProfileQuery = StudentProfile.findOne({
      _id: studentId,
      school_id: adminUser.school_id,
    }).select("_id user_id student_name school_id");

    if (session) studentProfileQuery.session(session);

    const studentProfile = await studentProfileQuery;

    if (!studentProfile) {
      throw new Error("Student profile not found in your school");
    }

    const studentUserQuery = User.findOne({
      _id: studentProfile.user_id,
      school_id: adminUser.school_id,
      role: "student",
    }).select("+otp_code +otp_expiry +password name email role status");

    if (session) studentUserQuery.session(session);

    const studentUser = await studentUserQuery;

    if (
      !studentUser ||
      studentUser.otp_code !== String(otp).trim() ||
      !studentUser.otp_expiry ||
      new Date() > new Date(studentUser.otp_expiry)
    ) {
      throw new Error("Invalid or expired OTP");
    }

    const parentProfileQuery = ParentProfile.findOne({
      school_id: adminUser.school_id,
      children: studentProfile._id,
    }).populate("user_id", "name email role status");

    if (session) parentProfileQuery.session(session);

    const parentProfile = await parentProfileQuery;

    if (!parentProfile || !parentProfile.user_id) {
      throw new Error("Linked parent account not found for this student");
    }

    const parentUserQuery = User.findOne({
      _id: parentProfile.user_id._id,
      school_id: adminUser.school_id,
      role: "parent",
    }).select("+password name email role status");

    if (session) parentUserQuery.session(session);

    const parentUser = await parentUserQuery;

    if (!parentUser) {
      throw new Error("Linked parent user not found");
    }

    studentUser.password = newPassword;
    parentUser.password = newPassword;

    studentUser.otp_code = undefined;
    studentUser.otp_expiry = undefined;

    await studentUser.save(session ? { session } : {});
    await parentUser.save(session ? { session } : {});

    if (session) {
      await session.commitTransaction();
    }

    return {
      message: "Linked student and parent passwords updated successfully",
      student: {
        studentId: studentProfile._id,
        name: studentProfile.student_name,
        email: studentUser.email,
      },
      parent: {
        parentUserId: parentUser._id,
        name: parentUser.name,
        email: parentUser.email,
      },
    };
  } catch (err) {
    if (session) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};