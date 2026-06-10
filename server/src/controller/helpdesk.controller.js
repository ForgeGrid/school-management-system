// controllers/helpdesk.controller.js
import { sendSuccess, sendError } from "../utils/response.helper.js";
import {
    uploadBufferToCloud,
    uploadFileBufferToCloud
} from "../utils/cloudinary.js";
import {
    createTicketService,
    listMyTicketsService,
    listAdminTicketsService,
    getTicketDetailService,
    addTicketReplyService,
    updateTicketStatusService,
    assignTicketService,
} from "../services/helpdesk.service.js";

/**
 * uploadHelpdeskAttachments
 * Private helper to handle file uploads to Cloudinary for Helpdesk.
 */
const uploadHelpdeskAttachments = async (files = [], user, attachmentType = "issue") => {
    if (!files || files.length === 0) return [];

    const uploadPromises = files.map(async (file) => {
        const isImage = file.mimetype.startsWith("image/");
        let result;

        if (isImage) {
            result = await uploadBufferToCloud(file.buffer, "helpdesk");
        } else {
            result = await uploadFileBufferToCloud(file.buffer, "helpdesk", file.originalname);
        }

        if (!result.success && !result.secure_url && !result.url) {
            throw new Error(`Failed to upload file: ${file.originalname}`);
        }

        return {
            public_id: result.public_id,
            secure_url: result.secure_url || result.url,
            uploaded_by: user.id,
            type: attachmentType,
            uploaded_at: new Date(),
        };
    });

    return Promise.all(uploadPromises);
};

// 1) Create Ticket
export const createTicket = async (req, res) => {
    try {
        const attachments = await uploadHelpdeskAttachments(req.files, req.user, "issue");
        req.body.initial_attachments = attachments;

        const result = await createTicketService(req.user, req.body);
        return sendSuccess(res, {
            message: "Ticket created successfully",
            status: 201,
            ...result,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Create ticket error" });
    }
};

// 2) List My Tickets (Parent/Teacher/Staff)
export const listMyTickets = async (req, res) => {
    try {
        const result = await listMyTicketsService(req.user, req.query);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "List my tickets error" });
    }
};

// 3) List Admin Tickets (School Admin)
export const listAdminTickets = async (req, res) => {
    try {
        const result = await listAdminTicketsService(req.user, req.query);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "List admin tickets error" });
    }
};

// 4) Get Ticket Detail
export const getTicketDetail = async (req, res) => {
    try {
        const result = await getTicketDetailService(req.user, req.params.id);
        return sendSuccess(res, result);
    } catch (err) {
        return sendError(res, { error: err, context: "Get ticket detail error" });
    }
};

// 5) Add Ticket Reply
export const addTicketReply = async (req, res) => {
    try {
        const attachments = await uploadHelpdeskAttachments(req.files, req.user, "reply");
        req.body.attachments = attachments;

        const result = await addTicketReplyService(req.user, req.params.id, req.body);
        return sendSuccess(res, {
            message: "Reply added successfully",
            ...result,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Add ticket reply error" });
    }
};

// 6) Update Ticket Status (Admin)
export const updateTicketStatus = async (req, res) => {
    try {
        const result = await updateTicketStatusService(req.user, req.params.id, req.body);
        return sendSuccess(res, {
            message: `Ticket status updated to ${req.body.status}`,
            ...result,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Update ticket status error" });
    }
};

// 7) Assign Ticket (Admin)
export const assignTicket = async (req, res) => {
    try {
        const result = await assignTicketService(req.user, req.params.id, req.body);
        return sendSuccess(res, {
            message: "Ticket assigned successfully",
            ...result,
        });
    } catch (err) {
        return sendError(res, { error: err, context: "Assign ticket error" });
    }
};
