import express from "express";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} from "../controller/notification.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireVerifiedStaff } from "../middleware/school_role.middleware.js";

const router = express.Router();

// All notification routes require authentication
router.use(authMiddleware, requireVerifiedStaff);

router.get("/all", getNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", markAsRead);
router.delete("/delete/:id", deleteNotification);

export default router;
