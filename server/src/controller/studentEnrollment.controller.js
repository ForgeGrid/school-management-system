import logger from "../utils/logger.js";
import {
  getEnrollmentCandidatesService,
  allocateStudentsManuallyService,
  autoAllocateStudentsService,
  getClassEnrolledStudentsService,
} from "../services/studentEnrollment.service.js";

export const getEnrollmentCandidates = async (req, res) => {
  try {
    const result = await getEnrollmentCandidatesService(req.user, req.query || {});
    return res.json({
      message: "Enrollment candidates fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get enrollment candidates error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const allocateStudentsManually = async (req, res) => {
  try {
    const result = await allocateStudentsManuallyService(req.user, req.body || {});
    return res.status(201).json({
      message: "Students allocated successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Manual student allocation error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const autoAllocateStudents = async (req, res) => {
  try {
    const result = await autoAllocateStudentsService(req.user, req.body || {});
    return res.status(201).json({
      message: "Students auto allocated successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Auto student allocation error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const getClassEnrolledStudents = async (req, res) => {
  try {
    const result = await getClassEnrolledStudentsService(req.user, req.query || {});
    return res.json({
      message: "Class enrolled students fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get enrolled students error:", err);
    return res.status(400).json({ message: err.message });
  }
};