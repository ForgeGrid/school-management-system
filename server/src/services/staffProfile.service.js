import { StaffProfile } from "../models/staff/teacher.model.js";
import { User } from "../models/auth/user.model.js";
import { generateEmployeeId } from "../utils/helper.js";
import { normalizeComparableList } from "../utils/format.helper.js";

import {
  assertStaffRole,
  assertAdminOnly,
  assertOwnSchool,
} from "../utils/auth.helper.js";
import {
  getByIdOrThrow as getByIdOrThrowGeneric,
} from "../utils/db.helper.js";

// --------------------------------------
// Create Profile
// --------------------------------------

export const createStaffProfileService = async (user, data) => {
  assertStaffRole(user);

  // Prevent duplicate profile
  const existing = await StaffProfile.findOne({ user_id: user.id });

  if (existing) {
    throw new Error("Profile already exists. Use update instead.");
  }

  // Generate employee ID
  const employeeId = await generateEmployeeId(user.school_id);

  if (data.subjects) {
    data.subjects = normalizeComparableList(data.subjects);
  }

  // profile_highlight is included via ...data
  const profile = await StaffProfile.create({
    ...data,
    user_id: user.id,
    employeeId,
    school_id: user.school_id, // 🔒 always from user
    verificationStatus: user.role === "school_admin" ? "verified" : "pending",
  });

  return profile;
};

// --------------------------------------
// Update Profile
// --------------------------------------

export const updateStaffProfileService = async (user, data) => {
  const profile = await StaffProfile.findOne({ user_id: user.id });

  if (!profile) {
    throw new Error("Profile not found. Create profile first.");
  }

  // 🔒 Never allow changing these 
  delete data.user_id;
  delete data.school_id;
  delete data.verificationStatus;
  delete data.verifiedBy;
  delete data.verifiedAt;
  delete data.employeeStatus;
  delete data.employeeId;
  delete data.resignedAt;
  delete data.resignationReason;
  delete data.rehiredAt;

  if (data.subjects) {
    data.subjects = normalizeComparableList(data.subjects);
  }

  // Update fields dynamically
  Object.assign(profile, data);

  // Optional: reset approval if teacher edits profile
  if (user.role !== "school_admin") {
    profile.verificationStatus = "pending";
  }

  await profile.save();

  return profile;
};

// --------------------------------------
// Get My Profile
// --------------------------------------
export const getMyProfileService = async (userId) => {
  const profile = await StaffProfile.findOne({ user_id: userId })
    .populate("user_id", "name email role");

  if (!profile) {
    throw new Error("Staff profile not found for this account");
  }

  return profile;
};


// --------------------------------------
// Get All Teachers
// --------------------------------------
export const getAllTeachersService = async (schoolId) => {
  // Get all user IDs who are teachers in this school
  const teachers = await User.find({ school_id: schoolId, role: "teacher" }).select("_id");
  const teacherIds = teachers.map(t => t._id);

  // Return their profiles with populated user data
  return await StaffProfile.find({
    school_id: schoolId,
    user_id: { $in: teacherIds }
  })
    .populate("user_id", "name email role")
    .sort({ createdAt: -1 });
};

// --------------------------------------
// Get One Teacher
// --------------------------------------
export const getOneTeacherService = async (profileId, schoolId) => {
  const profile = await getByIdOrThrowGeneric(StaffProfile, schoolId, profileId, "Staff profile");
  return profile.populate("user_id", "name email role");
};


// --------------------------------------
// Approve Staff
// --------------------------------------
export const approveStaffService = async (profileId, adminUser) => {
  assertAdminOnly(adminUser);

  const profile = await StaffProfile.findOne({
    _id: profileId,
    school_id: adminUser.school_id,
    verificationStatus: "pending",
  });

  if (!profile) {
    throw new Error("Profile not found or already processed");
  }

  assertOwnSchool(profile, adminUser);

  // Employment transition
  if (!profile.employeeStatus || profile.employeeStatus === "resigned") {
    profile.employeeStatus = "employed";
    if (profile.employeeStatus === "resigned") {
      profile.rehiredAt = new Date();
    }
  }

  profile.verificationStatus = "verified";
  profile.rejection_reason = null;
  profile.verifiedBy = adminUser.id;
  profile.verifiedAt = new Date();

  await profile.save();

  return profile;
};


// --------------------------------------
// Reject Staff
// --------------------------------------
export const rejectStaffService = async (profileId, reason, adminUser) => {
  if (!reason) {
    throw new Error("Rejection reason is required");
  }

  assertAdminOnly(adminUser);

  const profile = await getByIdOrThrowGeneric(StaffProfile, adminUser.school_id, profileId, "Staff profile");

  profile.verificationStatus = "rejected";
  profile.rejection_reason = reason;
  profile.verifiedBy = adminUser.id;
  profile.verifiedAt = new Date();

  await profile.save();

  return profile;
};

// Resign staff
export const resignStaffService = async (profileId, reason, adminUser) => {
  assertAdminOnly(adminUser);

  const profile = await StaffProfile.findOne({
    _id: profileId,
    school_id: adminUser.school_id,
    employeeStatus: { $ne: "resigned" },
  });

  if (!profile) {
    throw new Error("Staff profile not found");
  }

  assertOwnSchool(profile, adminUser);

  profile.employeeStatus = "resigned";
  profile.resignedAt = new Date();
  profile.resignationReason = reason || null;

  await profile.save();
  return profile;
};

// Request rejoin
export const requestRejoinStaffService = async (profileId, user) => {
  const profile = await StaffProfile.findOne({
    _id: profileId,
    user_id: user.id,
    employeeStatus: "resigned",
    verificationStatus: { $ne: "pending" },
  });

  if (!profile) {
    throw new Error("Staff profile not found");
  }

  if (profile.school_id.toString() !== user.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

  if (!["resigned", "terminated"].includes(profile.employeeStatus)) {
    throw new Error("Only resigned or terminated staff can request rejoin");
  }

  profile.verificationStatus = "pending";
  await profile.save();

  return profile;
};
