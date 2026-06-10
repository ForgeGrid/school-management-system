// routes/helpdesk.routes.js
import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    requireRole,
    requireVerifiedStaff
} from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import { uploadFiles } from "../middleware/upload.middleware.js";
import {
    createTicket,
    listMyTickets,
    listAdminTickets,
    getTicketDetail,
    addTicketReply,
    updateTicketStatus,
    assignTicket,
} from "../controller/helpdesk.controller.js";

const router = express.Router();

// All helpdesk routes require authentication, verified school, and verified staff (for staff/teachers)
router.use(authMiddleware, requireVerifiedSchool, requireVerifiedStaff);

// ─── TICKET CREATION & LISTING ──────────────────────────────────────────────

// RAISE TICKET (Parent, Teacher, Staff) - Supports up to 10 attachments
router.post(
    "/tickets/create",
    requireRole("parent", "teacher", "staff"),
    uploadFiles.array("attachments", 10),
    createTicket
);

// MY TICKETS (Parent, Teacher, Staff)
router.get(
    "/tickets/me",
    requireRole("parent", "teacher", "staff"),
    listMyTickets
);

// ADMIN DASHBOARD (School Admin)
router.get(
    "/tickets/all",
    requireRole("school_admin"),
    listAdminTickets
);

// ─── TICKET DETAILS & INTERACTION ───────────────────────────────────────────

// GET TICKET DETAIL (Creator or Admin)
router.get(
    "/tickets/:id",
    requireRole("parent", "teacher", "staff", "school_admin"),
    getTicketDetail
);

// REPLY TO TICKET (Creator or Admin) - Supports up to 10 attachments
router.post(
    "/tickets/:id/reply",
    requireRole("parent", "teacher", "staff", "school_admin"),
    uploadFiles.array("attachments", 10),
    addTicketReply
);

// ─── ADMIN MANAGEMENT ───────────────────────────────────────────────────────

// UPDATE STATUS (Admin ONLY) - Pure status update, no attachments supported
router.patch(
    "/tickets/:id/status",
    requireRole("school_admin"),
    updateTicketStatus
);

// ASSIGN TICKET (Admin ONLY)
router.patch(
    "/tickets/:id/assign",
    requireRole("school_admin"),
    assignTicket
);

export default router;
