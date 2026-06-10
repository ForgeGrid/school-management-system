import { sendSuccess, sendError } from "../utils/response.helper.js";
import {
    getEligibleTimetableStaffService,
    upsertTimetableSlotService,
    bulkUpsertTimetableSlotsService,
    getTimetableByClassSectionService,
    getTimetableByStaffService,
    getTimetableByIdService,
    deleteTimetableSlotService,
    getAllTimetableSlotsService
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
        const result = await deleteTimetableSlotService(req.user, req.params.id);
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
