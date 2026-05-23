import cron from "node-cron";
import mongoose from "mongoose";
import logger from "../utils/logger.js";

import { StudentFeePlan } from "../models/fees/studentFeePlan.model.js";
import { Notification } from "../models/notification/notification.model.js";
import { User } from "../models/auth/user.model.js";
import { notify } from "../utils/notificationHelper.js";

/**
 * Scans all active StudentFeePlans and sends reminders based on offsets.
 * @param {String} triggeredBy - Optional User ID who triggered the scan
 */
export const scanAndSendFeeReminders = async (triggeredBy = null) => {
    try {
        // node-cron passes the current date as the first argument to the scheduled task.
        // We only want to use it if it's a valid User ID string from a manual trigger.
        let actualSenderId = null;
        if (triggeredBy && typeof triggeredBy === "string" && mongoose.Types.ObjectId.isValid(triggeredBy)) {
            actualSenderId = triggeredBy;
        }

        logger.info("Starting Fee Reminder Scan...");

        // 1. Get current date (starting of the day for calculation)
        const today = new Date();
        today.setHours(today.getHours() + 5); // Add 5 hours to match IST potentially if server is UTC
        today.setMinutes(today.getMinutes() + 30);
        today.setHours(0, 0, 0, 0);

        // 2. Query StudentFeePlans that need scanning
        // - status is active
        // - paymentStatus is not paid
        // - reminderEnabled is true
        const feePlans = await StudentFeePlan.find({
            status: "active",
            "feeReminder.reminderEnabled": true,
            "feeReminder.paymentStatus": { $ne: "paid" },
            "feeReminder.feeDueDate": { $ne: null }
        }).populate("student_id", "student_name");

        logger.info(`Found ${feePlans.length} active fee plans to check.`);

        let remindersSent = 0;

        for (const plan of feePlans) {
            const dueDate = new Date(plan.feeReminder.feeDueDate);
            dueDate.setHours(0, 0, 0, 0);

            // Calculate daysLeft = dueDate - today
            // Difference in milliseconds
            const diffTime = dueDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));

            // 3. Check if daysLeft matches any reminderOffsets
            const offsets = plan.feeReminder.reminderOffsets || [7, 3, 1, 0];

            if (offsets.includes(daysLeft)) {
                // Determine stage
                let stage = "upcoming";
                if (daysLeft === 0) stage = "due_today";
                else if (daysLeft < 0) stage = "overdue";
                else if (daysLeft <= 3) stage = "due_soon";

                // Prevent sending the same reminder twice on the same day
                const lastReminder = plan.feeReminder.lastReminderAt ? new Date(plan.feeReminder.lastReminderAt) : null;
                if (lastReminder) {
                    lastReminder.setHours(0, 0, 0, 0);
                    if (lastReminder.getTime() === today.getTime()) {
                        logger.debug(`Skipping already sent reminder for plan ${plan._id} today.`);
                        continue;
                    }
                }

                // 4. Create Notification
                const studentName = plan.student_id?.student_name || "Student";
                const amount = plan.feeReminder.feePendingAmount || plan.finalPayableAmount;

                const title = stage === "overdue" ? "🚨 Fee Overdue Alert" : "📅 Fee Payment Reminder";
                const message = stage === "overdue"
                    ? `Fee payment for ${studentName} is overdue. Pending amount: ₹${amount}. Please clear the dues immediately.`
                    : `Fee payment for ${studentName} is due by ${dueDate.toLocaleDateString()}. Pending amount: ₹${amount}.`;

                const audience = {
                    student_ids: [plan.student_id._id],
                    roles: ["school_admin"] // Admins also get a copy
                };

                let sender_id = actualSenderId;

                // Fallback: If automated run, find the first active admin of this school
                if (!sender_id) {
                    const fallbackAdmin = await User.findOne({
                        school_id: plan.school_id,
                        role: "school_admin",
                        status: "active"
                    }).select("_id");
                    if (fallbackAdmin) sender_id = fallbackAdmin._id;
                }

                await notify({
                    school_id: plan.school_id,
                    audience,
                    sender_id,
                    type: "fee_reminder",
                    title,
                    message,
                    message,
                    scope: "students",
                    relatedModule: "fees",
                    relatedRefId: plan._id
                });

                // 5. Update plan state
                plan.feeReminder.lastReminderAt = new Date();
                plan.feeReminder.reminderCount += 1;
                plan.feeReminder.reminderStage = stage;
                await plan.save();

                remindersSent++;
            }
        }

        logger.info(`Fee Reminder Scan Completed. Sent ${remindersSent} notifications.`);
    } catch (err) {
        logger.error("Error in scanAndSendFeeReminders:", err);
    }
};


export const initCron = () => {
    // Fee Reminder Scan at 9:00 AM IST daily
    cron.schedule("0 9 * * *", scanAndSendFeeReminders, {
        timezone: "Asia/Kolkata"
    });

    logger.info("Cron services initialized.");
};

