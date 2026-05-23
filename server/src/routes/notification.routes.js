import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    triggerFeeReminderScan,
} from "../controller/notification.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get("/", getNotifications);
router.post("/trigger-fee-reminders", requireRole("school_admin"), triggerFeeReminderScan);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/:id", deleteNotification);

export default router;
