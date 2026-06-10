import crypto from "crypto";
import mongoose from "mongoose";
import { User } from "../models/auth/user.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import { StudentEnrollment } from "../models/student/studentEnrollment.model.js";
import { ParentProfile } from "../models/parent/parentProfile.model.js";
import { AcademicFeeStructure } from "../models/fees/academicFeeStructure.model.js";
import { TransportFeeStructure } from "../models/fees/transportFeeStructure.model.js";
import { StudentFeePlan } from "../models/fees/studentFeePlan.model.js";
import { generateUsername } from "../utils/helper.js";
import { checkTransactionSupport } from "../utils/transactionHelper.js";
import { uploadBufferToCloud } from "../utils/cloudinary.js";
import {
  calculateAcademicTotal,
  calculateDiscountTotal,
  calculateAdditionalCharges,
} from "./studentFeePlan.service.js";

import {
  assertAdminOrStaff,
} from "../utils/auth.helper.js";
import {
  normalizeText as normalizeSearchText,
  normalizeDigits,
  normalizeEmail,
  escapeRegExp,
} from "../utils/format.helper.js";
import {
  isLikelyEmail,
  isLikelyPhone,
  isLikelyAdmissionNo,
} from "../utils/validation.helper.js";
import {
  buildGradeLabel,
} from "../utils/academic.helper.js";
import {
  uniqueByProperty,
} from "../utils/db.helper.js";

const validateAdmissionEmails = ({
  studentEmail,
  parentEmail,
  parentMode,
}) => {
  if (!isLikelyEmail(studentEmail)) {
    throw new Error("Invalid student email address");
  }

  // parentEmail is required for new parent flow, optional otherwise
  if (parentMode === "new" || parentEmail) {
    if (!isLikelyEmail(parentEmail)) {
      throw new Error("Invalid parent email address");
    }

    if (normalizeEmail(studentEmail) === normalizeEmail(parentEmail)) {
      throw new Error("Student email and parent email must be different");
    }
  }
};

// --------------------------------------------------
// MAIN SERVICE
// --------------------------------------------------

/**
 * createAdmissionService
 *
 * Atomically creates:
 *   1. Student User account
 *   2. Student Profile
 *   3. Parent User + Parent Profile (mode: "new")
 *      OR links to existing parent (mode: "existing")
 *   4. Student Fee Plan
 *
 * ID Linkage:
 *   StudentProfile.user_id     → User._id (student)
 *   ParentProfile.user_id      → User._id (parent)
 *   ParentProfile.children[]   → StudentProfile._id  (source of truth)
 *   StudentFeePlan.student_id  → StudentProfile._id
 *   StudentFeePlan.school_id   → adminUser.school_id
 */
export const createAdmissionService = async (adminUser, data, avatarFile) => {
  assertAdminOrStaff(adminUser);

  const {
    student_name,
    email,
    password,
    admission_no,
    gender,
    dob,
    address,
    transport_required,
    requestedGrade,
    parent,   // { mode: "new" | "existing", parentUserId?, name?, email?, primary_phone?, guardian_name?, guardian_relation? }
    feePlan,  // { academicYear, academicFeeStructure_id, transportFeeStructure_id?, currentRoute_id?, discounts?, additionalCharges? }
  } = data;

  // ── Required field validation ──────────────────────────────────────────────
  if (!student_name || !email || !password || !admission_no) {
    throw new Error("student_name, email, password, and admission_no are required");
  }

  if (!feePlan || !feePlan.academicYear || !feePlan.academicFeeStructure_id) {
    throw new Error("feePlan.academicYear and feePlan.academicFeeStructure_id are required");
  }

  if (!parent || !["new", "existing"].includes(parent.mode)) {
    throw new Error("parent.mode must be 'new' or 'existing'");
  }

  if (parent.mode === "existing" && !parent.parentUserId) {
    throw new Error("parent.parentUserId is required when mode is 'existing'");
  }

  if (parent.mode === "new" && (!parent.name || !parent.email || !parent.primary_phone)) {
    throw new Error("parent.name, parent.email, and parent.primary_phone are required for a new parent");
  }

  validateAdmissionEmails({
    studentEmail: email,
    parentEmail: parent.email,
    parentMode: parent.mode,
  });


  // ── Pre-flight uniqueness checks (outside transaction for early exit) ──────
  const existingStudentUser = await User.findOne({ email });
  if (existingStudentUser) {
    throw new Error(`A user with email "${email}" already exists`);
  }

  const existingAdmission = await StudentProfile.findOne({
    school_id: adminUser.school_id,
    admission_no,
  });
  if (existingAdmission) {
    throw new Error(`Admission number "${admission_no}" already exists in this school`);
  }

  // ── Transaction setup ──────────────────────────────────────────────────────
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

  const opts = session ? { session } : {};

  try {
    // ── 0. Pre-validate Fee & Transport (prevent orphaned records) ────────────
    const academicStructure = await AcademicFeeStructure.findById(
      feePlan.academicFeeStructure_id
    ).session(session);

    if (!academicStructure) {
      throw new Error("Academic fee structure not found");
    }

    if (requestedGrade && academicStructure.standard !== requestedGrade) {
      throw new Error(`Fee structure grade (${academicStructure.standard}) does not match student's requested grade (${requestedGrade})`);
    }

    let totalTransportFee = 0;
    let resolvedTransportId = null;
    let resolvedRouteId = null;

    if (transport_required) {
      if (!feePlan.transportFeeStructure_id || !feePlan.currentRoute_id) {
        throw new Error(
          "feePlan.transportFeeStructure_id and feePlan.currentRoute_id are required when transport_required is true"
        );
      }

      const transportStructure = await TransportFeeStructure.findById(
        feePlan.transportFeeStructure_id
      ).session(session);

      if (!transportStructure) {
        throw new Error("Transport fee structure not found");
      }

      if (
        transportStructure.route_id.toString() !==
        feePlan.currentRoute_id.toString()
      ) {
        throw new Error(
          "Selected transport fee does not belong to the selected route"
        );
      }

      totalTransportFee = transportStructure.amount * 12;
      resolvedTransportId = feePlan.transportFeeStructure_id;
      resolvedRouteId = feePlan.currentRoute_id;
    }

    const totalAcademicFee = calculateAcademicTotal(academicStructure.feeHeads);
    const totalDiscount = calculateDiscountTotal(feePlan.discounts || []);
    const totalAdditionalCharges = calculateAdditionalCharges(feePlan.additionalCharges || []);

    const finalPayableAmount =
      totalAcademicFee +
      totalTransportFee +
      totalAdditionalCharges -
      totalDiscount;

    // ── 1. Create Student User ───────────────────────────────────────────────
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

    const studentUser = new User({
      name: student_name,
      username,
      email,
      school_id: adminUser.school_id,
      role: "student",
      status: "active",
      emailVerified: false,
      profile_avatar: avatarData,
    });

    // Virtual setter triggers pre("validate") hash on save
    studentUser.password = password;
    await studentUser.save(opts);

    // ── 2. Create Student Profile ────────────────────────────────────────────
    const [studentProfile] = await StudentProfile.create(
      [
        {
          user_id: studentUser._id,
          school_id: adminUser.school_id,
          admission_no,
          student_name,
          gender: gender || "prefer_not_to_say",
          dob: dob || null,
          transport_required: !!transport_required,
          requestedGrade: requestedGrade || null,
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
      ],
      opts
    );

    // ── 3. Parent handling ───────────────────────────────────────────────────
    if (parent.mode === "existing") {
      // Resolve parent's User → ParentProfile → link child
      const parentUser = await User.findOne({
        _id: parent.parentUserId,
        role: "parent",
        school_id: adminUser.school_id,
      }).session(session);

      if (!parentUser) {
        throw new Error("Existing parent user not found in this school");
      }

      const existingParentProfile = await ParentProfile.findOne({
        user_id: parentUser._id,
      }).session(session);

      if (!existingParentProfile) {
        throw new Error("Parent profile not found for the given parentUserId");
      }

      // $addToSet prevents duplicate children entries on retry / double-submit
      const updateData = { $addToSet: { children: studentProfile._id } };
      if (address) {
        updateData.$set = { address };
      }

      await ParentProfile.updateOne(
        { _id: existingParentProfile._id },
        updateData,
        opts
      );
    } else {
      // mode = "new" — create parent User + ParentProfile
      const parentUsername = await generateUsername(parent.email);

      // Reuse the PROVIDED student password for the new parent (as per requirement)
      const parentPassword = password;

      const parentUser = new User({
        name: parent.name,
        username: parentUsername,
        email: parent.email,
        school_id: adminUser.school_id,
        role: "parent",
        status: "active",
        emailVerified: false,
      });

      // Virtual setter triggers pre("validate") hash on save
      parentUser.password = parentPassword;
      await parentUser.save(opts);

      await ParentProfile.create(
        [
          {
            user_id: parentUser._id,
            school_id: adminUser.school_id,
            primary_phone: parent.primary_phone,
            alternate_contact: parent.alternate_contact || "",
            guardian_name: parent.guardian_name || "",
            guardian_relation: parent.guardian_relation || "",
            address: address || {},
            children: [studentProfile._id],
          },
        ],
        opts
      );
    }

    // ── 4. Fee Plan creation ─────────────────────────────────────────────────
    const [studentFeePlan] = await StudentFeePlan.create(
      [
        {
          student_id: studentProfile._id,
          school_id: adminUser.school_id,
          academicYear: feePlan.academicYear,
          academicFeeStructure_id: feePlan.academicFeeStructure_id,
          transportFeeStructure_id: resolvedTransportId,
          currentRoute_id: resolvedRouteId,
          discounts: feePlan.discounts || [],
          additionalCharges: feePlan.additionalCharges || [],
          totalAcademicFee,
          totalTransportFee,
          totalDiscount,
          totalAdditionalCharges,
          finalPayableAmount,
          paymentSummary: {
            paidAmount: 0,
            pendingAmount: finalPayableAmount,
            paymentStatus: "unpaid",
            paymentUpdatedAt: new Date(),
          },
          createdBy: adminUser.id,
        },
      ],
      opts
    );

    // ── 5. Commit ────────────────────────────────────────────────────────────
    if (useTransaction && session) {
      await session.commitTransaction();
    }

    return {
      studentUser,
      studentProfile,
      studentFeePlan,
    };
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }

    if (err?.code === 11000) {
      throw new Error("A duplicate key error occurred during enrollment. Please check email or admission number.");
    }

    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


// --------------------------------------------------
// PARENT SEARCH SERVICE
// Used for "Link Existing Parent" during admission
// GET /api/parents/search?q=...
// --------------------------------------------------



/**
 * searchExistingParentService
 *
 * Search existing parent records for admission-time linking.
 * Scope: school-bound, read-only.
 *
 * Supports:
 * - parent phone
 * - parent email
 * - sibling admission number
 * - student name
 *
 * Returns compact inline-ready parent cards.
 */
export const searchExistingParentService = async (adminUser, q) => {
  assertAdminOrStaff(adminUser);

  const query = normalizeSearchText(q);

  if (!query) {
    throw new Error("Query parameter q is required");
  }

  const schoolId = adminUser.school_id;
  const queryLower = query.toLowerCase();
  const queryRegex = new RegExp(escapeRegExp(query), "i");
  const queryDigits = normalizeDigits(query);

  const searchType = isLikelyEmail(query)
    ? "email"
    : isLikelyPhone(query)
      ? "phone"
      : isLikelyAdmissionNo(query)
        ? "admission_or_name"
        : "broad";

  // 1) Parent direct matches
  const parentUserQuery = {
    school_id: schoolId,
    role: "parent",
    $or: [{ name: queryRegex }, { email: queryRegex }],
  };

  if (isLikelyEmail(query)) {
    parentUserQuery.$or.unshift({ email: queryLower });
  }

  const parentPhoneQuery = queryDigits
    ? {
      $or: [
        { primary_phone: new RegExp(escapeRegExp(queryDigits), "i") },
        { alternate_contact: new RegExp(escapeRegExp(queryDigits), "i") },
      ],
    }
    : null;

  const [parentUsers, phoneMatches, studentMatches] = await Promise.all([
    User.find(parentUserQuery).select("_id name email school_id"),

    parentPhoneQuery
      ? ParentProfile.find({
        school_id: schoolId,
        ...parentPhoneQuery,
      })
        .populate("user_id", "name email school_id role")
        .select("_id user_id primary_phone alternate_contact children")
      : Promise.resolve([]),

    StudentProfile.find({
      school_id: schoolId,
      $or: [
        { student_name: queryRegex },
        { admission_no: queryRegex },
        ...(isLikelyAdmissionNo(query) ? [{ admission_no: queryLower }] : []),
      ],
    }).select("_id student_name admission_no"),
  ]);

  // 2) Resolve parent profiles from direct parent matches
  const parentProfilesFromUsers = parentUsers.length
    ? await ParentProfile.find({
      user_id: { $in: parentUsers.map((u) => u._id) },
      school_id: schoolId,
    })
      .populate("user_id", "name email school_id role")
      .select("_id user_id primary_phone alternate_contact children")
    : [];

  // 3) Resolve parent profiles from student matches (sibling / child linkage)
  const matchedStudentIds = studentMatches.map((s) => s._id);

  const parentProfilesFromChildren = matchedStudentIds.length
    ? await ParentProfile.find({
      school_id: schoolId,
      children: { $in: matchedStudentIds },
    })
      .populate("user_id", "name email school_id role")
      .select("_id user_id primary_phone alternate_contact children")
    : [];

  // 4) Merge and score results
  const scoredResults = [];

  const addResult = (parentProfile, score, reason) => {
    if (!parentProfile?.user_id) return;

    scoredResults.push({
      parentUserId: parentProfile.user_id._id,
      name: parentProfile.user_id.name || null,
      phone: parentProfile.primary_phone || null,
      email: parentProfile.user_id.email || null,
      childrenIds: (parentProfile.children || []).map(String),
      _confidence: score,
      _reason: reason,
    });
  };

  // Direct parent email/name matches
  for (const profile of parentProfilesFromUsers) {
    const directEmailMatch = isLikelyEmail(query) &&
      normalizeSearchText(profile.user_id?.email).toLowerCase() === queryLower;

    const directPhoneMatch = queryDigits && (
      normalizeDigits(profile.primary_phone) === queryDigits ||
      normalizeDigits(profile.alternate_contact) === queryDigits
    );

    const nameMatch = profile.user_id?.name
      ? queryRegex.test(profile.user_id.name)
      : false;

    let score = 0;
    let reason = "direct_fallback";

    if (directEmailMatch) {
      score = 100;
      reason = "direct_email_exact";
    } else if (directPhoneMatch) {
      score = 98;
      reason = "direct_phone_exact";
    } else if (nameMatch) {
      score = 80;
      reason = "direct_name_match";
    } else if (isLikelyEmail(query) || isLikelyPhone(query)) {
      score = 65;
      reason = "direct_partial";
    } else {
      score = 60;
      reason = "direct_broad";
    }

    addResult(profile, score, reason);
  }

  // Parent direct phone matches (exact or partial)
  for (const profile of phoneMatches) {
    const directPhoneMatch = queryDigits && (
      normalizeDigits(profile.primary_phone) === queryDigits ||
      normalizeDigits(profile.alternate_contact) === queryDigits
    );

    let score = 0;
    let reason = "phone_fallback";

    if (directPhoneMatch) {
      score = 98;
      reason = "direct_phone_exact";
    } else {
      score = 68;
      reason = "direct_phone_partial";
    }

    addResult(profile, score, reason);
  }

  // Parent profiles linked through matching children
  for (const profile of parentProfilesFromChildren) {
    const childMatchCount = (profile.children || [])
      .map(String)
      .filter((id) => matchedStudentIds.some((sid) => String(sid) === id)).length;

    let score = 75;
    let reason = "child_match";

    if (searchType === "admission_or_name") {
      const exactAdmissionMatch = studentMatches.some(
        (s) => normalizeSearchText(s.admission_no).toLowerCase() === queryLower
      );

      const studentNameMatch = studentMatches.some(
        (s) => queryRegex.test(s.student_name || "")
      );

      if (exactAdmissionMatch) {
        score = 95;
        reason = "child_admission_exact";
      } else if (studentNameMatch) {
        score = 90;
        reason = "child_student_name_match";
      } else {
        score = 78;
        reason = "child_broad";
      }
    }

    // Slight bump if multiple linked children match the query
    score += Math.min(childMatchCount, 3);

    addResult(profile, score, reason);
  }

  const deduped = uniqueByProperty(scoredResults, "parentUserId")
    .sort((a, b) => {
      if ((b._confidence || 0) !== (a._confidence || 0)) {
        return (b._confidence || 0) - (a._confidence || 0);
      }
      return String(a.name || "").localeCompare(String(b.name || ""));
    });

  const parentUserIds = deduped.map((item) => item.parentUserId);
  const parentProfiles = parentUserIds.length
    ? await ParentProfile.find({
      user_id: { $in: parentUserIds },
      school_id: schoolId,
    }).select("_id user_id primary_phone alternate_contact children")
    : [];

  const parentProfileMap = new Map(
    parentProfiles.map((p) => [String(p.user_id), p])
  );

  const allChildIds = [
    ...new Set(
      parentProfiles.flatMap((p) => (p.children || []).map(String))
    ),
  ];


  const studentDocs = allChildIds.length
    ? await StudentProfile.find({
      _id: { $in: allChildIds },
      school_id: schoolId,
    }).select("_id student_name admission_no")
    : [];

  const enrollmentDocs = allChildIds.length
    ? await StudentEnrollment.find({
      school_id: schoolId,
      student_id: { $in: allChildIds },
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .populate("classSection_id", "standard section classCode academicYear")
    : [];

  const studentMap = new Map(
    studentDocs.map((s) => [String(s._id), s])
  );

  const enrollmentMap = new Map();
  for (const enrollment of enrollmentDocs) {
    const key = String(enrollment.student_id);
    if (!enrollmentMap.has(key)) {
      enrollmentMap.set(key, enrollment);
    }
  }

  const data = deduped.map((item) => {
    const profile = parentProfileMap.get(String(item.parentUserId));
    const childIds = (profile?.children || []).map(String);

    const childrenPreview = childIds
      .map((childId) => {
        const student = studentMap.get(childId);
        if (!student) return null;

        const enrollment = enrollmentMap.get(childId);
        const grade = enrollment?.classSection_id
          ? buildGradeLabel(enrollment.classSection_id)
          : null;

        return {
          studentName: student.student_name || null,
          admissionNo: student.admission_no || null,
          grade,
        };
      })
      .filter(Boolean);

    return {
      parentUserId: item.parentUserId,
      name: item.name,
      phone: profile?.primary_phone || item.phone || null,
      email: item.email,
      childrenCount: childIds.length,
      childrenPreview,
    };
  });

  return {
    success: true,
    message: "Parents found",
    data,
  };
};