import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import {
  getEnrollmentCandidates,
  previewStudentAllocation,
  confirmStudentAllocation,
  // updateStudentEnrollmentType,
  promoteStudentEnrollment,
  getClassEnrolledStudents,
} from "../controller/studentEnrollment.controller.js";

const router = express.Router();

// All routes require authenticated user and verified active school
router.use(authMiddleware, requireVerifiedSchool);

router.get("/candidates", requireRole("school_admin"), getEnrollmentCandidates);
router.post("/preview-allocation", requireRole("school_admin"), previewStudentAllocation);
router.post("/confirm-allocation", requireRole("school_admin"), confirmStudentAllocation);
// router.patch("/update-type/:enrollmentId", requireRole("school_admin"), updateStudentEnrollmentType);
router.patch("/promote", requireRole("school_admin"), promoteStudentEnrollment);
router.get("/enrolled", requireRole("school_admin"), getClassEnrolledStudents);

export default router;
