import School from "../models/school_admin/school.model.js";
import logger from "../utils/logger.js";

/**
 * Middleware to ensure the school associated with the user is verified and active.
 * Used for routes that require a fully verified school (e.g., adding staff, making billing changes).
 */
export const requireVerifiedSchool = async (req, res, next) => {
  try {
    const school_id = req.user?.school_id;

    if (!school_id) {
      return res.status(403).json({ message: "No school associated with this user." });
    }

    const school = await School.findById(school_id);

    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    if (school.verificationStatus !== "verified") {
      return res.status(403).json({
        message: "Your school is not verified. You cannot perform this action until verification is complete.",
      });
    }

    if (!school.isActive) {
      return res.status(403).json({ message: "Your school is currently inactive." });
    }

    // Optionally attach the school object to the request so downstream controllers can use it
    req.school = school;
    next();
  } catch (err) {
    logger.error("requireVerifiedSchool middleware error:", err);
    return res.status(500).json({ message: "Internal server error during school authorization." });
  }
};

/**
 * Middleware to ensure the school associated with the user is simply active.
 * Used for routes where verification is not strictly required but the school must not be disabled.
 */
export const requireActiveSchool = async (req, res, next) => {
  try {
    const school_id = req.user?.school_id;

    if (!school_id) {
      return res.status(403).json({ message: "No school associated with this user." });
    }

    const school = await School.findById(school_id);

    if (!school) {
      return res.status(404).json({ message: "School not found." });
    }

    if (!school.isActive) {
      return res.status(403).json({ message: "Your school is currently inactive." });
    }

    req.school = school;
    next();
  } catch (err) {
    logger.error("requireActiveSchool middleware error:", err);
    return res.status(500).json({ message: "Internal server error during school authorization." });
  }
};
