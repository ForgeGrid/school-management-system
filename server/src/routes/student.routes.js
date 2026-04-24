import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  createStudent,
  updateStudent,
  getMyStudentProfile,
  getAllStudents,
  getOneStudent,
  deleteStudent,
} from "../controller/student.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Student profile management
router.post("/create", requireRole("school_admin", "staff"), createStudent);
router.patch("/update/:studentId", requireRole("school_admin", "staff"), updateStudent);
router.get("/me", requireRole("student"), getMyStudentProfile);
router.get("/all", requireRole("school_admin", "staff"), getAllStudents);
router.get("/:studentId", requireRole("school_admin", "staff"), getOneStudent);
router.delete("/:studentId", requireRole("school_admin", "staff"), deleteStudent);

// Security and Avatar management moved to profile.routes.js

export default router;
