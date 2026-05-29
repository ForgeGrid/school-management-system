import {
    createFeeReminderConfigService,
    updateFeeReminderConfigService,
    stopFeeReminderService,
    triggerFeeReminderService,
    getFeeReminderConfigsService,
    getSingleFeeReminderService,
} from "../services/feeReminder.service.js";
import logger from "../utils/logger.js";

const assertAdmin = (user) => {
    if (!user || user.role !== "school_admin") {
        throw new Error("Only school admin can manage fee reminders");
    }
    if (!user.school_id) {
        throw new Error("User is not associated with any school");
    }
};


const maybeTriggerReminder = async (req, configId) => {
    const sendNow = req.body?.sendNow === true || req.body?.sendNow === "true";
    if (!sendNow) {
        return { reminderTriggered: false, triggerResult: null, triggerError: null };
    }

    try {
        const triggerResult = await triggerFeeReminderService(req.user, configId);
        return { reminderTriggered: true, triggerResult, triggerError: null };
    } catch (err) {
        logger.error("Send-now trigger failed:", err);
        return {
            reminderTriggered: false,
            triggerResult: null,
            triggerError: err.message,
        };
    }
};

// --------------------------------------------------
// Create Reminder Config
// One UI action: Save Reminder
// If sendNow=true, controller triggers immediately
// --------------------------------------------------
export const createFeeReminderController = async (req, res) => {
    try {
        assertAdmin(req.user);

        const config = await createFeeReminderConfigService(req.user, req.body || {});
        const triggerMeta = await maybeTriggerReminder(req, config._id);

        return res.status(201).json({
            message: "Fee reminder config created successfully",
            config,
            ...triggerMeta,
        });
    } catch (err) {
        logger.error("Create fee reminder error:", err);
        return res.status(400).json({ message: err.message });
    }
};

// --------------------------------------------------
// Update Reminder Config
// If sendNow=true, controller triggers immediately after update
// --------------------------------------------------
export const updateFeeReminderController = async (req, res) => {
    try {
        assertAdmin(req.user);

        const config = await updateFeeReminderConfigService(
            req.user,
            req.params.configId,
            req.body || {}
        );

        const triggerMeta = await maybeTriggerReminder(req, config._id);

        return res.json({
            message: "Fee reminder config updated successfully",
            config,
            ...triggerMeta,
        });
    } catch (err) {
        logger.error("Update fee reminder error:", err);
        return res.status(400).json({ message: err.message });
    }
};

// --------------------------------------------------
// Manual quick trigger by configId
// --------------------------------------------------
export const triggerFeeReminderController = async (req, res) => {
    try {
        assertAdmin(req.user);

        const configId = req.params.configId || req.body?.configId;
        if (!configId) {
            return res.status(400).json({ message: "configId is required" });
        }

        const result = await triggerFeeReminderService(req.user, configId);

        return res.json({
            message: "Fee reminder triggered successfully",
            ...result,
        });
    } catch (err) {
        logger.error("Trigger fee reminder error:", err);
        return res.status(400).json({ message: err.message });
    }
};

// --------------------------------------------------
// Stop / Resume Reminder
// body.action = "stop" | "resume"
// --------------------------------------------------
export const stopFeeReminderController = async (req, res) => {
    try {
        assertAdmin(req.user);

        const result = await stopFeeReminderService(
            req.user,
            req.params.configId,
            req.body || {}
        );

        return res.json({
            message: "Fee reminder state updated successfully",
            config: result,
        });
    } catch (err) {
        logger.error("Stop fee reminder error:", err);
        return res.status(400).json({ message: err.message });
    }
};

// --------------------------------------------------
// List Reminder Configs
// --------------------------------------------------
export const getFeeReminderConfigsController = async (req, res) => {
    try {
        assertAdmin(req.user);

        const result = await getFeeReminderConfigsService(req.user, req.query || {});
        return res.json(result);
    } catch (err) {
        logger.error("Get fee reminder configs error:", err);
        return res.status(400).json({ message: err.message });
    }
};

// --------------------------------------------------
// Get Single Reminder Config
// --------------------------------------------------
export const getSingleFeeReminderController = async (req, res) => {
    try {
        assertAdmin(req.user);

        const config = await getSingleFeeReminderService(req.user, req.params.configId);
        return res.json({ config });
    } catch (err) {
        logger.error("Get single fee reminder error:", err);
        return res.status(400).json({ message: err.message });
    }
};