// routes/academic/subject.routes.js
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    requireRole,
    requireVerifiedStaff
} from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import {
    createSubject,
    getSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
} from "../controller/subject.controller.js";

const router = express.Router();

// All subject routes require authentication, verified school, and verified staff status
router.use(authMiddleware, requireVerifiedSchool, requireVerifiedStaff);

/**
 * Subject Management
 */

// CREATE Subject (School Admin Only)
router.post(
    "/create",
    requireRole("school_admin"),
    createSubject
);

// LIST Subjects (Admin, Staff, Teacher)
router.get(
    "/all",
    requireRole("school_admin", "staff", "teacher"),
    getSubjects
);

// GET Subject Detail
router.get(
    "/:id",
    requireRole("school_admin", "staff", "teacher"),
    getSubjectById
);

// UPDATE Subject (School Admin Only)
router.patch(
    "/update/:id",
    requireRole("school_admin"),
    updateSubject
);

// DELETE/DEACTIVATE Subject (School Admin Only)
router.delete(
    "/delete/:id",
    requireRole("school_admin"),
    deleteSubject
);

export default router;
