import cron from "node-cron";
import logger from "../utils/logger.js";

import { cronFeeReminderService } from "../services/feeReminder.service.js";

/**
 * Initializes all cron jobs for the application.
 */
export const initCron = () => {
    // Fee Reminder Scan - Daily 9:00 AM IST
    cron.schedule(
        "05 20 * * *",
        async () => {
            try {
                const result = await cronFeeReminderService();
                logger.info("Fee reminder cron executed", {
                    scannedConfigs: result.scannedConfigs,
                });
            } catch (err) {
                logger.error("Fee reminder cron failed:", err);
            }
        },
        {
            timezone: "Asia/Kolkata",
        }
    );

    logger.info("Cron services initialized.");
};