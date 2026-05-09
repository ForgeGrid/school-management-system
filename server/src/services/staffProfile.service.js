import { StaffProfile } from "../models/staff/teacher.model.js";
import { User } from "../models/auth/user.model.js";
import { generateEmployeeId } from "../utils/helper.js";

// --------------------------------------
// Create Profile
// --------------------------------------

export const createStaffProfileService = async (user, data) => {
  if (!["school_admin", "teacher", "staff"].includes(user.role)) {
    throw new Error("Invalid role for profile creation");
  }

  if (!user.school_id) {
    throw new Error("User not associated with any school");
  }

  // Prevent duplicate profile
  const existing = await StaffProfile.findOne({ user_id: user.id });

  if (existing) {
    throw new Error("Profile already exists. Use update instead.");
  }

  // Generate employee ID
  const employeeId = await generateEmployeeId(user.school_id);

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
  const profile = await StaffProfile.findById(profileId)
    .populate("user_id", "name email role");

  if (!profile || profile.school_id.toString() !== schoolId.toString()) {
    throw new Error("Profile not found in your school");
  }

  return profile;
};


// --------------------------------------
// Approve Staff
// --------------------------------------
export const approveStaffService = async (profileId, adminUser) => {
  if (adminUser.role !== "school_admin") {
    throw new Error("Only school admin can approve staff");
  }

  const profile = await StaffProfile.findOne({
    _id: profileId,
    school_id: adminUser.school_id,
    verificationStatus: "pending",
  });

  if (!profile) {
    throw new Error("Profile not found or already processed");
  }

  if (profile.school_id.toString() !== adminUser.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

  // Rehire flow
  if (
    profile.employeeStatus === "resigned" &&
    profile.verificationStatus === "pending"
  ) {
    profile.employeeStatus = "employed";
    profile.rehiredAt = new Date();
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

  if (adminUser.role !== "school_admin") {
    throw new Error("Only school admin can reject staff");
  }

  const profile = await StaffProfile.findById(profileId);

  if (!profile) {
    throw new Error("Profile not found");
  }

  if (profile.school_id.toString() !== adminUser.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

  profile.verificationStatus = "rejected";
  profile.rejection_reason = reason;
  profile.verifiedBy = adminUser.id;
  profile.verifiedAt = new Date();

  await profile.save();

  return profile;
};

// Resign staff
export const resignStaffService = async (profileId, reason, adminUser) => {
  if (adminUser.role !== "school_admin") {
    throw new Error("Only school admin can resign staff");
  }

  const profile = await StaffProfile.findOne({
    _id: profileId,
    school_id: adminUser.school_id,
    employeeStatus: { $ne: "resigned" },
  });

  if (!profile) {
    throw new Error("Staff profile not found");
  }

  if (profile.school_id.toString() !== adminUser.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

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
  }``

  profile.verificationStatus = "pending";
  await profile.save();

  return profile;
};
