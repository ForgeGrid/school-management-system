import { StaffProfile } from "../models/staff/teacher.model.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "forbidden: insufficient permissions",
      });
    }

    next();
  };
};

/**
 * Middleware to check if a teacher/staff member has been verified by the school admin.
 * Admins are exempt from this check as they are the verifiers.
 */
export const requireVerifiedStaff = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "unauthorized" });
    }

    // Admins and non-staff roles (like student/parent) are not subject to staff verification
    if (!["teacher", "staff"].includes(req.user.role)) {
      return next();
    }

    const staffProfile = await StaffProfile.findOne({
      user_id: req.user.id,
      school_id: req.user.school_id,
    });

    if (!staffProfile) {
      return res.status(403).json({
        message: "Staff profile not found. Please contact your admin.",
      });
    }

    if (staffProfile.verificationStatus !== "verified") {
      return res.status(403).json({
        message: `Your account is ${staffProfile.verificationStatus}. You cannot access school features until an admin verifies your profile.`,
      });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Internal server error during staff verification check." });
  }
};
