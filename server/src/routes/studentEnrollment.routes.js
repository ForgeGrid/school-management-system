import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import {
  getEnrollmentCandidates,
  allocateStudentsManually,
  autoAllocateStudents,
  getClassEnrolledStudents,
} from "../controller/studentEnrollment.controller.js";

const router = express.Router();

// All routes require authenticated user and verified active school
router.use(authMiddleware, requireVerifiedSchool);

router.get("/candidates", requireRole("school_admin"), getEnrollmentCandidates);
router.post("/allocate-manual", requireRole("school_admin"), allocateStudentsManually);
router.post("/allocate-auto", requireRole("school_admin"), autoAllocateStudents);
router.get("/enrolled", requireRole("school_admin"), getClassEnrolledStudents);

export default router;
