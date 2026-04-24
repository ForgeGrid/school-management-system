// services/studentProfile.service.js
import { User } from "../models/auth/user.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import { generateUsername } from "../utils/helper.js";

export const createStudentService = async (adminUser, data) => {
  if (!["school_admin", "staff"].includes(adminUser.role)) {
    throw new Error("Only school admin or staff can create student records");
  }

  if (!adminUser.school_id) {
    throw new Error("User is not linked to any school");
  }

  const {
    student_name,
    email,
    password,
    admission_no,
    class_name,
    section,
    gender,
    dob,
    age,
    roll_no,
    parent_name,
    parent_email,
    parent_phone,
    guardian_name,
    guardian_relation,
    address,
    transport_required,
    bus_route,
  } = data;

  if (!student_name || !email || !password || !admission_no || !class_name) {
    throw new Error("student_name, email, password, admission_no and class_name are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  const existingAdmission = await StudentProfile.findOne({ 
    school_id: adminUser.school_id, 
    admission_no 
  });
  if (existingAdmission) {
    throw new Error(`Admission number ${admission_no} already exists in this school`);
  }

  const username = await generateUsername(email);

  const user = new User({
    name: student_name,
    username,
    email,
    school_id: adminUser.school_id,
    role: "student",
    status: "active",
    emailVerified: true, // admin created account; keep it active immediately
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
      age: age || null,
      class_name,
      section: section || "",
      roll_no: roll_no || "",
      parent_name: parent_name || "",
      parent_email: parent_email || "",
      parent_phone: parent_phone || "",
      guardian_name: guardian_name || "",
      guardian_relation: guardian_relation || "",
      address: address || {},
      transport_required: !!transport_required,
      bus_route: bus_route || "",
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
  if (!["school_admin", "staff"].includes(adminUser.role)) {
    throw new Error("Only school admin or staff can update student records");
  }

  const studentProfile = await StudentProfile.findById(studentId);
  if (!studentProfile) {
    throw new Error("Student profile not found");
  }

  if (studentProfile.school_id.toString() !== adminUser.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

  delete data.user_id;
  delete data.school_id;
  delete data.admission_no;

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
  const studentProfile = await StudentProfile.findById(studentId).populate(
    "user_id",
    "name email role profile_avatar status",
  );

  if (!studentProfile || studentProfile.school_id.toString() !== schoolId.toString()) {
    throw new Error("Student not found in your school");
  }

  return studentProfile;
};

export const deleteStudentService = async (adminUser, studentId) => {
  if (!["school_admin", "staff"].includes(adminUser.role)) {
    throw new Error("Only school admin or staff can delete student records");
  }

  const studentProfile = await StudentProfile.findById(studentId);
  if (!studentProfile) {
    throw new Error("Student profile not found");
  }

  if (studentProfile.school_id.toString() !== adminUser.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

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