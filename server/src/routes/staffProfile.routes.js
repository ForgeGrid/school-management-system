import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import {
  createProfile,
  updateProfile,
  getMyProfile,
  getAllTeachers,
  getOneTeacher,
  approveStaff,
  rejectStaff,
  resignStaff,
  requestRejoinStaff,
} from "../controller/staffProfile.controller.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Profile management
router.post("/create", createProfile);
router.patch("/update", updateProfile);
router.get("/me", requireRole("school_admin", "teacher", "staff"), getMyProfile);

// Security and Avatar management moved to profile.routes.js

// Staff lookup (School Admin only)
router.get("/all-teachers", requireRole("school_admin"), getAllTeachers);
router.get("/teacher/:profileId", requireRole("school_admin"), getOneTeacher);

// Staff approval (School Admin only)
router.patch("/approve/:profileId", requireRole("school_admin"), approveStaff);
router.patch("/reject/:profileId", requireRole("school_admin"), rejectStaff);

router.patch("/staff/:profileId/resign", requireRole("school_admin"), resignStaff);

router.patch("/staff/:profileId/request-rejoin", requireRole("teacher", "staff"), requestRejoinStaff);


export default router;