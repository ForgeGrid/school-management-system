import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole, requireVerifiedStaff } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import {
    getEligibleStaff,
    upsertSlot,
    bulkUpsertSlots,
    getTimetableByClass,
    getTimetableByStaff,
    getSlotDetail,
    deleteSlot,
    getAllSlots
} from "../controller/timetable.controller.js";

const router = express.Router();

// All routes require authentication, a verified school, and verified staff status
router.use(authMiddleware, requireVerifiedSchool, requireVerifiedStaff);

// ─── ADMIN ONLY ROUTES ───────────────────────────────────────────────────

// GET /api/v0/timetable/eligible-staff/:classSectionId
router.get("/eligible-staff/:classSectionId", requireRole("school_admin"), getEligibleStaff);

// POST /api/v0/timetable/upsert
router.post("/upsert", requireRole("school_admin"), upsertSlot);

// POST /api/v0/timetable/bulk-upsert
router.post("/bulk-upsert", requireRole("school_admin"), bulkUpsertSlots);

// DELETE /api/v0/timetable/delete/:id
router.delete("/delete/:id", requireRole("school_admin"), deleteSlot);

// GET /api/v0/timetable/all (Admin list)
router.get("/all", requireRole("school_admin"), getAllSlots);


// ─── SHARED ROUTES ────────────────────────────────────────────────────────

// GET /api/v0/timetable/:id (Detail)
router.get("/detail/:id", requireRole("school_admin", "staff", "teacher"), getSlotDetail);

// GET /api/v0/timetable/class/:classSectionId
router.get("/class/:classSectionId", requireRole("school_admin", "staff", "teacher", "student", "parent"), getTimetableByClass);

// GET /api/v0/timetable/staff/
router.get("/staff", requireRole("school_admin", "staff", "teacher"), getTimetableByStaff);

// GET /api/v0/timetable/staff/:staffId
router.get("/staff/:staffId", requireRole("school_admin", "staff", "teacher"), getTimetableByStaff);

export default router;
