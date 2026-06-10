// controller/classSubjectAssignment.controller.js
import { sendSuccess, sendError } from "../utils/response.helper.js";
import {
    getEligibleStaffForAssignmentService,
    createClassSubjectAssignmentService,
    getOneAssignmentService,
    listClassSubjectAssignmentsService,
    updateClassSubjectAssignmentService,
    deactivateClassSubjectAssignmentService,
} from "../services/classSubjectAssignment.service.js";

export const getEligibleStaff = async (req, res) => {
    try {
        const data = await getEligibleStaffForAssignmentService(req.user, req.params.subjectId);
        return sendSuccess(res, {
            message: "Eligible staff fetched successfully",
            data,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Get eligible staff error" });
    }
};

export const createAssignment = async (req, res) => {
    try {
        const assignment = await createClassSubjectAssignmentService(req.user, req.body);
        return sendSuccess(res, {
            status: 201,
            message: "Assignment created successfully",
            data: assignment,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Create assignment error" });
    }
};

export const listAssignments = async (req, res) => {
    try {
        const result = await listClassSubjectAssignmentsService(req.user, req.query);
        return sendSuccess(res, {
            message: "Assignments fetched successfully",
            ...result,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "List assignments error" });
    }
};

export const getAssignmentById = async (req, res) => {
    try {
        const assignment = await getOneAssignmentService(req.user, req.params.id);
        return sendSuccess(res, {
            message: "Assignment detail fetched successfully",
            data: assignment,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Get assignment error" });
    }
};

export const updateAssignment = async (req, res) => {
    try {
        const assignment = await updateClassSubjectAssignmentService(req.user, req.params.id, req.body);
        return sendSuccess(res, {
            message: "Assignment updated successfully",
            data: assignment,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Update assignment error" });
    }
};

export const deleteAssignment = async (req, res) => {
    try {
        const assignment = await deactivateClassSubjectAssignmentService(req.user, req.params.id);
        return sendSuccess(res, {
            message: "Assignment deactivated successfully",
            data: assignment,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Delete assignment error" });
    }
};
