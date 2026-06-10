import { sendSuccess, sendError } from "../utils/response.helper.js";
import {
    createAdmissionService,
    searchExistingParentService,
} from "../services/admission.service.js";

export const enrollStudent = async (req, res) => {
    try {
        const result = await createAdmissionService(req.user, req.body, req.file);

        return sendSuccess(res, {
            message: "Student enrolled successfully",
            status: 201,
            ...result,
        });
    } catch (err) {
        return sendError(res, {
            error: err,
            context: "Enroll student error",
        });
    }
};

export const searchExistingParent = async (req, res) => {
    try {
        const result = await searchExistingParentService(req.user, req.query.q);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, {
            error: err,
            context: "Search existing parent error",
        });
    }
};
