import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool, requireActiveSchool } from "../middleware/school_auth.middleware.js";
import {
    createFeeReminderController,
    updateFeeReminderController,
    triggerFeeReminderController,
    stopFeeReminderController,
    getFeeReminderConfigsController,
    getSingleFeeReminderController,
} from "../controller/feeReminder.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("school_admin"));
router.use(requireActiveSchool);
router.use(requireVerifiedSchool);

// Dashboard / listing
router.get("/all", getFeeReminderConfigsController);
router.get("/detail/:configId", getSingleFeeReminderController);

// Create & update
router.post("/create", createFeeReminderController);
router.patch("/update/:configId", updateFeeReminderController);

// Quick trigger
router.post("/trigger/:configId", triggerFeeReminderController);

// Stop / resume
router.patch("/stop/:configId", stopFeeReminderController);

export default router;