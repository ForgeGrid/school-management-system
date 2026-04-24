import {
  createSchoolService,
  fetchPendingSchools,
  approveSchoolService,
  rejectSchoolService,
  reAppealTenantService,
  fetchAllSchoolsService,
  fetchSchoolByIdService,
} from "../services/school.service.js";
import { User } from "../models/auth/user.model.js";

import { generateToken } from "../utils/jwt.js";
import { uploadBufferToCloud } from "../utils/cloudinary.js";
import sendEmail from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

export const createSchool = async (req, res) => {
  try {
    let logoData = {
      public_id: "",
      secure_url: "",
    };

    if (req.file) {
      const upload = await uploadBufferToCloud(req.file.buffer, "schools");

      if (!upload.success) {
        return res.status(500).json({
          message: "Image upload failed",
          error: upload.error,
        });
      }

      logoData = {
        public_id: upload.public_id,
        secure_url: upload.secure_url,
      };
    }

    const { school, user } = await createSchoolService({
      ...req.body,
      logoUrl: logoData.secure_url,
    });

    // Send Notification Email to Super Admin
    try {
      await sendEmail({
        from: `"FGrow System" <${process.env.EMAIL_USER}>`,
        to: "sukesh.official.2006@gmail.com",
        subject: `🚀 New School Alert: ${school.name}`,
        html: `
          <div style="font-family: sans-serif; color: #333; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <!-- Circular Image -->
            <div style="text-align: center; margin-bottom: 20px;">
              <img 
                src="https://res.cloudinary.com/dbaeuihz7/image/upload/v1775310579/tenants/a7tvcuo0moqztzeoevaz.png" 
                alt="Profile"
                style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid #e0e0e0;"
              />
            </div>
            <h2 style="color: #4f46e5;">New School Registration</h2>
            <p>A new school has just signed up on FGrow ERP.</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p><strong>School Name:</strong> ${school.name}</p>
            <p><strong>Admin Name:</strong> ${user.name}</p>
            <p><strong>Admin Email:</strong> ${user.email}</p>
            <p><strong>School Email:</strong> ${school.schoolEmail}</p>
            <p><strong>Submitted On:</strong> ${new Date(school.createdAt).toLocaleString()}</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 0.9em; color: #666;">
              Log in to the <a href="https://fg-crm-super-admin.vercel.app/admin" style="color: #4f46e5;">Super Admin Dashboard</a> to review and approve this school.
            </p>
          </div>
        `
      });
      logger.info("Creation notification email sent to admin");
    } catch (emailErr) {
      logger.error("Failed to send admin notification email:", emailErr);
    }

    // Generate JWT
    const token = generateToken({
      id: user._id,
      school_id: school._id,
      role: user.role,
    });

    res.status(201).json({
      message: "School created successfully",
      token,
      user,
      school,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || "Something went wrong",
    });
  }
};

// --------------------------------------------------
// 1️⃣ Get All Pending Schools
// --------------------------------------------------
export const getPendingSchools = async (req, res) => {
  try {
    const schools = await fetchPendingSchools();

    return res.status(200).json({
      message: "Pending schools fetched",
      count: schools.length,
      schools,
    });
  } catch (err) {
    logger.error("Get Pending Schools Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

// --------------------------------------------------
// 2️⃣ Approve School
// --------------------------------------------------
export const approveSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    logger.info(`Approve school request reached for ID: ${schoolId} by admin: ${req.user?.id}`);
    const result = await approveSchoolService(schoolId, req.user?.id);

    if (result.error) {
      logger.info(`Approve school service returned error: ${result.error}`);
      return res.status(result.status).json({
        message: result.error,
      });
    }

    logger.info(`School approved successfully: ${schoolId}`);
    return res.status(200).json({
      message: "School approved successfully",
      schoolId: result.school._id,
    });
  } catch (err) {
    logger.error("Approve School Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

// --------------------------------------------------
// 3️⃣ Reject School
// --------------------------------------------------
export const rejectSchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { reason } = req.body;

    const result = await rejectSchoolService(schoolId, reason, req.user.id);

    if (result.error) {
      return res.status(result.status).json({
        message: result.error,
      });
    }

    return res.status(200).json({
      message: "School rejected",
      schoolId: result.school._id,
    });
  } catch (err) {
    logger.error("Reject School Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

// --------------------------------------------------
// 4️⃣ Re-appeal School/Tenant
// --------------------------------------------------
export const reAppealSchool = async (req, res) => {
  try {
    const user = req.user;

    if (!user.school_id) {
      return res.status(400).json({
        message: "User does not belong to any school",
      });
    }

    const { name, schoolEmail, schoolPhone, board, medium, timezone, currency, address } = req.body;

    const school = await reAppealTenantService(user.school_id, user.id, {
      name,
      schoolEmail,
      schoolPhone,
      board,
      medium,
      timezone,
      currency,
      address,
    });

    return res.status(200).json({
      message: "Re-appeal submitted successfully",
      verificationStatus: school.verificationStatus,
      appealCount: school.appealCount,
    });
  } catch (err) {
    return res.status(400).json({
      message: err.message,
    });
  }
};

// --------------------------------------------------
// 5️⃣ Get School Staff
// --------------------------------------------------
export const getSchoolStaff = async (req, res) => {
  try {
    const users = await User.find({ school_id: req.user.school_id })
      .sort({ joined_at: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    logger.error("Get School Staff Error:", err);
    return res.status(500).json({
      message: err.message || "internal server error",
    });
  }
};

// --------------------------------------------------
// 6️⃣ Get All Schools (Pending, Approved, etc.)
// --------------------------------------------------
export const getAllSchools = async (req, res) => {
  try {
    const { status } = req.query; // optional filter
    const schools = await fetchAllSchoolsService(status);

    return res.status(200).json({
      success: true,
      data: schools,
    });
  } catch (err) {
    logger.error("Get All Schools Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

// --------------------------------------------------
// 7️⃣ Get School By ID
// --------------------------------------------------
export const getSchoolById = async (req, res) => {
  try {
    const { schoolId } = req.params;

    // Authorization: Super Admin can see any; Owner/Staff only their own.
    const isSuperAdmin = req.user.platformRole === "super_admin";
    const isAuthorized = req.user.school_id?.toString() === schoolId;

    if (!isSuperAdmin && !isAuthorized) {
      return res.status(403).json({
        message: "forbidden: you can only access your own school details",
      });
    }

    const school = await fetchSchoolByIdService(schoolId);

    if (!school) {
      return res.status(404).json({ message: "School not found" });
    }

    return res.status(200).json({
      success: true,
      data: school,
    });
  } catch (err) {
    logger.error("Get School By ID Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};

// --------------------------------------------------
// 8️⃣ Admin: Get Targeted School Staff
// --------------------------------------------------
export const getSchoolStaffAdmin = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const users = await User.find({ school_id: schoolId })
      .select("name email username role status joined_at profile_avatar")
      .sort({ joined_at: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    logger.error("Get School Staff Admin Error:", err);
    return res.status(500).json({
      message: "internal server error",
    });
  }
};


// --------------------------------------------------
// 10️ Remove User From School (Owner/Admin Only)
// --------------------------------------------------
export const removeUserFromSchool = async (req, res) => {
  try {
    const { userId } = req.params;
    const { id: ownerId, school_id: ownerSchoolId } = req.user;

    if (!ownerSchoolId) {
      return res.status(403).json({ message: "You are not associated with any school" });
    }

    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== "school_admin" || owner.school_id?.toString() !== ownerSchoolId.toString()) {
      return res.status(403).json({ message: "Only school admins can remove members" });
    }

    const userToRemove = await User.findById(userId);
    if (!userToRemove || userToRemove.school_id?.toString() !== ownerSchoolId.toString()) {
      return res.status(404).json({ message: "User not found in your school" });
    }

    if (userToRemove.role === "school_admin" && userToRemove._id.toString() === ownerId.toString()) {
      return res.status(400).json({ message: "Cannot remove the main school admin" });
    }

    userToRemove.school_id = null;
    userToRemove.role = "none";
    await userToRemove.save();

    res.json({ message: "User removed from school successfully" });
  } catch (err) {
    logger.error("Remove User From School Error:", err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
