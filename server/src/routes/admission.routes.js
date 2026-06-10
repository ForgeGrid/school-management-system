import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole, requireVerifiedStaff } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import { enrollStudent, searchExistingParent } from "../controller/admission.controller.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// All routes require authentication, a verified school, and verified staff status (for teachers/staff)
router.use(authMiddleware, requireVerifiedSchool, requireVerifiedStaff);

// POST /api/v0/admission/create
router.post("/create", requireRole("school_admin", "staff"), upload.single("profile-avatar"), enrollStudent);

// GET /api/v0/admission/search-parent?q=...
router.get("/search-parent", requireRole("school_admin", "staff"), searchExistingParent);

export default router;
