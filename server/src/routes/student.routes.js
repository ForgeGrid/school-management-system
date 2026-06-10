import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  createStudent,
  updateStudent,
  getMyStudentProfile,
  getAllStudents,
  getOneStudent,
  deleteStudent,
  requestLinkedPasswordResetOtp,
  verifyLinkedPasswordResetOtp
} from "../controller/student.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware, requireVerifiedSchool);

// Student profile management
router.post("/create", requireRole("school_admin", "staff"), upload.single("profile-avatar"), createStudent);
router.patch("/update/:studentId", requireRole("school_admin", "staff"), updateStudent);
router.get("/me", requireRole("student"), getMyStudentProfile);
router.get("/all", requireRole("school_admin", "staff"), getAllStudents);
router.get("/:studentId", requireRole("school_admin", "staff"), getOneStudent);
router.delete("/:studentId", requireRole("school_admin", "staff"), deleteStudent);

// Password for student + parent by Admin
router.post(
  "/admin/students/:studentId/password/request-otp",
  requireRole("school_admin"),
  requestLinkedPasswordResetOtp
);

router.post(
  "/admin/students/:studentId/password/verify-otp",
  requireRole("school_admin"),
  verifyLinkedPasswordResetOtp
);

export default router;
