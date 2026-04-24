import School from "../models/school_admin/school.model.js";
import { User } from "../models/auth/user.model.js";
import slugify from "slugify";

export const createSchoolService = async (data) => {
  const {
    schoolName,
    schoolEmail,
    schoolPhone,
    email,
    logoUrl,
    schoolBoard,
    officialAddress,
    schoolMedium,
  } = data;

  // 1️⃣ Find user
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User with this email does not exist");
  }

  // 2️⃣ Check if tenant already exists with same name/email/phone
  const existingSchool = await School.findOne({
    $or: [
      { name: schoolName },
      { schoolEmail: schoolEmail },
      { schoolPhone: schoolPhone }
    ]
  });

  if (existingSchool) {
    if (existingSchool.name === schoolName) {
      throw new Error("Admin with this school name already exists");
    }
    if (existingSchool.schoolEmail === schoolEmail) {
      throw new Error("Admin with this school email already exists");
    }
    if (existingSchool.schoolPhone === schoolPhone) {
      throw new Error("Admin with this school phone already exists");
    }
  }

  // 3️⃣ Check if user already belongs to a tenant
  if (user.tenant_id) {
    throw new Error(`User already belongs to a school`);
  }

  // 4️⃣ Create tenant
  const school = new School({
    name: schoolName,
    schoolEmail,
    schoolPhone,
    schoolBoard,
    schoolMedium,
    domain: slugify(schoolName, { lower: true }),
    logoUrl,
    officialAddress,
  });

  // 5️⃣ Attach user to tenant
  user.school_id = school._id;
  user.role = "school_admin";
  user.status = "active";
  await user.save();

  // 6️⃣ Attach owner
  school.ownerUserId = user._id;

  // 7️⃣ Save tenant
  await school.save();

  return { school, user };
};

// --------------------------------------------------
// 1️⃣ Get All Pending Schools
// --------------------------------------------------
export const fetchPendingSchools = async () => {
  return await School.find({
    verificationStatus: "pending",
  }).populate("ownerUserId", "name email");
};

// --------------------------------------------------
// 2️⃣ Approve School
// --------------------------------------------------
export const approveSchoolService = async (schoolId, adminId) => {
  const school = await School.findById(schoolId);

  if (!school) {
    return { error: "School not found", status: 404 };
  }

  if (school.verificationStatus === "verified") {
    return { error: "School already approved", status: 400 };
  }

  school.verificationStatus = "verified";
  school.verifiedBy = adminId;
  school.verifiedAt = new Date();
  school.rejection_reason = null;

  await school.save();

  return { school };
};

// --------------------------------------------------
// 3️⃣ Reject Tenant
// --------------------------------------------------
export const rejectSchoolService = async (schoolId, reason, adminId) => {
  if (!reason) {
    return { error: "Rejection reason is required", status: 400 };
  }

  const school = await School.findById(schoolId);

  if (!school) {
    return { error: "School not found", status: 404 };
  }

  school.verificationStatus = "rejected";
  school.rejection_reason = reason;
  school.verifiedBy = adminId;
  school.verifiedAt = new Date();

  await school.save();

  return { school };
};

// --------------------------------------------------
// 4️⃣ Re-appeal Tenant
// --------------------------------------------------
export const reAppealTenantService = async (schoolId, userId, updates = {}) => {
  const school = await School.findById(schoolId);

  if (!school) {
    throw new Error("Tenant not found");
  }

  if (school.verificationStatus !== "rejected") {
    throw new Error("School is not rejected");
  }

  // Optional: limit appeals
  if (school.appealCount >= 3) {
    throw new Error("Maximum appeal attempts reached");
  }

  // Apply updated school details if provided
  if (updates.name) {
    school.name = updates.name;
    school.domain = slugify(updates.name, { lower: true });
  }
  if (updates.schoolEmail) school.schoolEmail = updates.schoolEmail;
  if (updates.schoolPhone) school.schoolPhone = updates.schoolPhone;
  if (updates.board) school.board = updates.board;
  if (updates.medium) school.medium = updates.medium;
  if (updates.timezone) school.timezone = updates.timezone;
  if (updates.currency) school.currency = updates.currency;
  if (updates.address) school.address = updates.address;
  
  school.verificationStatus = "pending";
  school.rejection_reason = null;
  school.appealCount += 1;
  school.lastAppealedAt = new Date();
  school.verifiedBy = null;
  school.verifiedAt = null;

  await school.save();

  return school;
};

// --------------------------------------------------
// 5️⃣ Fetch All Tenants (with status filter)
// --------------------------------------------------
export const fetchAllSchoolsService = async (status) => {
  const query = {};
  if (status) {
    query.verificationStatus = status;
  }

  return await School.find(query)
    .populate("ownerUserId", "name email username")
    .sort({ createdAt: -1 });
};

// --------------------------------------------------
// 6️⃣ Fetch Tenant By ID
// --------------------------------------------------
export const fetchSchoolByIdService = async (schoolId) => {
  return await School.findById(schoolId)
    .populate("ownerUserId", "name email username")
    .populate("verifiedBy", "name email");
};
