import logger from "../utils/logger.js";
import {
  getEnrollmentCandidatesService,
  previewStudentAllocationService,
  confirmStudentAllocationService,
  // updateStudentEnrollmentTypeService,
  promoteStudentEnrollmentService,
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

export const previewStudentAllocation = async (req, res) => {
  try {
    const result = await previewStudentAllocationService(req.user, req.body || {});
    return res.json({
      message: "Enrollment preview generated successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Preview student allocation error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const confirmStudentAllocation = async (req, res) => {
  try {
    const result = await confirmStudentAllocationService(req.user, req.body || {});
    return res.status(201).json({
      message: "Students enrolled successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Confirm student allocation error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// export const updateStudentEnrollmentType = async (req, res) => {
//   try {
//     const { enrollmentId } = req.params;
//     const result = await updateStudentEnrollmentTypeService(req.user, enrollmentId, req.body || {});
//     return res.json({
//       message: "Enrollment type updated successfully",
//       enrollment: result,
//     });
//   } catch (err) {
//     logger.error("Update enrollment type error:", err);
//     return res.status(400).json({ message: err.message });
//   }
// };

export const promoteStudentEnrollment = async (req, res) => {
  try {
    const result = await promoteStudentEnrollmentService(req.user, req.body || {});
    return res.status(201).json({
      message: "Student promoted successfully",
      data: result.toObject(),
    });
  } catch (err) {
    logger.error("Promote student error:", err);
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