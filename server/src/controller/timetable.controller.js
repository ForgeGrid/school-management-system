import { sendSuccess, sendError } from "../utils/response.helper.js";
import {
    getEligibleTimetableStaffService,
    upsertTimetableSlotService,
    bulkUpsertTimetableSlotsService,
    getTimetableByClassSectionService,
    getTimetableByStaffService,
    getTimetableByIdService,
    deactivateTimetableSlotService,
    getAllTimetableSlotsService,
    publishTimetableService,
    getMyTimetableService,
    createPeriodTemplateService,
    updatePeriodTemplateService,
    getPeriodTemplateBootstrapService
} from "../services/timetable.service.js";

export const getEligibleStaff = async (req, res) => {
    try {
        const result = await getEligibleTimetableStaffService(req.user, {
            classSectionId: req.params.classSectionId,
            subjectId: req.query.subjectId
        });
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get eligible staff error" });
    }
};

export const upsertSlot = async (req, res) => {
    try {
        if (req.body.slots && Array.isArray(req.body.slots)) {
            const result = await bulkUpsertTimetableSlotsService(req.user, req.body);
            return sendSuccess(res, result);
        }
        const result = await upsertTimetableSlotService(req.user, req.body);
        return sendSuccess(res, { message: "Slot updated successfully", data: result });
    } catch (err) {
        return sendError(res, { error: err, context: "Upsert slot error" });
    }
};

export const bulkUpsertSlots = async (req, res) => {
    try {
        const result = await bulkUpsertTimetableSlotsService(req.user, req.body);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Bulk upsert slots error" });
    }
};

export const getTimetableByClass = async (req, res) => {
    try {
        const result = await getTimetableByClassSectionService(req.user, {
            classSectionId: req.params.classSectionId,
            dayOfWeek: req.query.dayOfWeek
        });
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get timetable by class error" });
    }
};

export const getTimetableByStaff = async (req, res) => {
    try {
        const result = await getTimetableByStaffService(req.user, {
            staffId: req.params.staffId || req.query.staffId,
            dayOfWeek: req.query.dayOfWeek
        });
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get timetable by staff error" });
    }
};

export const getSlotDetail = async (req, res) => {
    try {
        const result = await getTimetableByIdService(req.user, req.params.id);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get slot detail error" });
    }
};

export const deleteSlot = async (req, res) => {
    try {
        const result = await deactivateTimetableSlotService(req.user, req.params.id);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Delete slot error" });
    }
};

export const getAllSlots = async (req, res) => {
    try {
        const result = await getAllTimetableSlotsService(req.user, req.query);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get all slots error" });
    }
};

export const publishTimetable = async (req, res) => {
    try {
        const result = await publishTimetableService(req.user, req.body || {});
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Publish timetable error" });
    }
};

export const getMyTimetable = async (req, res) => {
    try {
        const result = await getMyTimetableService(req.user, {
            dayOfWeek: req.query.dayOfWeek,
            childId: req.query.childId
        });
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get my timetable error" });
    }
};

// ─── Period Template handlers ─────────────────────────────────────────────────

export const getPeriodTemplateBootstrap = async (req, res) => {
    try {
        const result = await getPeriodTemplateBootstrapService(req.user, req.query);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get period template bootstrap error" });
    }
};

export const createPeriodTemplate = async (req, res) => {
    try {
        const result = await createPeriodTemplateService(req.user, req.body);
        return sendSuccess(res, result, 201);
    } catch (err) {
        return sendError(res, { error: err, context: "Create period template error" });
    }
};

export const updatePeriodTemplate = async (req, res) => {
    try {
        const result = await updatePeriodTemplateService(req.user, req.params.templateId, req.body);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Update period template error" });
    }
};
