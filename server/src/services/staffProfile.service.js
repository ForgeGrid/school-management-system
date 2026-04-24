import { StaffProfile } from "../models/staff/teacher.model.js";
import { User } from "../models/auth/user.model.js";


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

  const profile = await StaffProfile.create({
    ...data,
    user_id: user.id,
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
  return await User.find({ school_id: schoolId, role: "teacher" })
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

  const profile = await StaffProfile.findById(profileId);

  if (!profile) {
    throw new Error("Profile not found");
  }

  if (profile.school_id.toString() !== adminUser.school_id.toString()) {
    throw new Error("Unauthorized access");
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