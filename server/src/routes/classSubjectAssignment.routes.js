// routes/academic/classSubjectAssignment.routes.js
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    requireRole,
    requireVerifiedStaff
} from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import {
    getEligibleStaff,
    createAssignment,
    listAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
} from "../controller/classSubjectAssignment.controller.js";

const router = express.Router();

// Common middlewares for all routes
router.use(authMiddleware, requireVerifiedSchool, requireVerifiedStaff);

/**
 * Class Subject Assignment Routes
 */

// 1. Get Eligible Staff for a Subject (Admin Only)
router.get(
    "/eligible-staff/:subjectId",
    requireRole("school_admin"),
    getEligibleStaff
);

// 2. Create Assignment (Admin Only)
router.post(
    "/create",
    requireRole("school_admin"),
    createAssignment
);

// 3. List Assignments (Admin see all, Teacher see own)
router.get(
    "/all",
    requireRole("school_admin", "teacher"),
    listAssignments
);

// 4. Get Assignment Detail (Admin or Owner Teacher)
router.get(
    "/:id",
    requireRole("school_admin", "teacher"),
    getAssignmentById
);

// 5. Update Assignment (Admin Only)
router.patch(
    "/update/:id",
    requireRole("school_admin"),
    updateAssignment
);

// 6. Deactivate Assignment (Admin Only)
router.delete(
    "/delete/:id",
    requireRole("school_admin"),
    deleteAssignment
);

export default router;
