// services/helpdesk.service.js
import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { HelpdeskTicket } from "../models/common/helpdesk.model.js";
import { User } from "../models/auth/user.model.js";

import {
    notifyAdminsNewTicketService,
    notifyTicketCreatedService,
    notifyTicketAssignedService,
    notifyTicketInProgressService,
    notifyTicketResolvedService,
} from "./notification.service.js";

import {
    assertCreatorRole,
    assertAdminOnly as assertAdminRole,
    assertCreatorOrAdmin,
    assertSchoolBoundUser,
} from "../utils/auth.helper.js";
import {
    buildPagination,
} from "../utils/pagination.helper.js";
import {
    normalizeText,
} from "../utils/format.helper.js";
import {
    applySearchFilter as applySearchFilterGeneric,
} from "../utils/db.helper.js";

const CREATOR_ROLES = new Set(["parent", "teacher", "staff"]);
const ADMIN_ROLES = new Set(["school_admin"]);
const ASSIGNEE_ROLES = new Set(["school_admin", "staff"]);

const CATEGORIES = new Set([
    "academic",
    "fees",
    "transport",
    "attendance",
    "technical",
    "complaint",
    "facility",
    "general",
]);

const PRIORITIES = new Set(["low", "medium", "high", "urgent"]);
const STATUSES = new Set(["open", "in_progress", "resolved", "closed"]);
const VISIBILITIES = new Set(["private", "department", "public"]);




const normalizeAttachments = (attachments = [], userId = null, type = "issue") => {
    if (!Array.isArray(attachments)) return [];

    return attachments
        .filter(Boolean)
        .map((item) => {
            const public_id = normalizeText(item.public_id);
            const secure_url = normalizeText(item.secure_url || item.url);

            if (!public_id || !secure_url) {
                throw new Error("Attachment must include public_id and secure_url");
            }

            return {
                public_id,
                secure_url,
                uploaded_by: item.uploaded_by || userId || null,
                type: ["issue", "resolution", "reply"].includes(item.type) ? item.type : type,
                uploaded_at: item.uploaded_at ? new Date(item.uploaded_at) : new Date(),
            };
        });
};

const generateTicketNo = async () => {
    const year = new Date().getFullYear();
    const prefix = `HD-${year}`;
    const regex = new RegExp(`^${prefix}-\\d{4}$`);

    const count = await HelpdeskTicket.countDocuments({
        ticket_no: regex,
    });

    return `${prefix}-${String(count + 1).padStart(4, "0")}`;
};

const buildTicketQueryBase = (user) => ({
    school_id: user.school_id,
});

const applySearchFilter = (query, search) => {
    applySearchFilterGeneric(query, search, ["ticket_no", "subject", "raised_by.name"]);
};

const populateTicketDetail = async (ticket) => {
    if (!ticket) return ticket;

    await ticket.populate([
        { path: "assigned_to", select: "name email role status" },
        { path: "responses.user_id", select: "name email role status" },
        { path: "responses.attachments.uploaded_by", select: "name email role status" },
        { path: "initial_attachments.uploaded_by", select: "name email role status" },
    ]);

    return ticket;
};

const canUserViewTicket = (user, ticket) => {
    if (ADMIN_ROLES.has(user.role)) return true;
    return String(ticket.raised_by?.user_id) === String(user.id);
};

const canUserReplyToTicket = (user, ticket) => {
    if (ticket.status === "closed") return false;
    if (ADMIN_ROLES.has(user.role)) return true;
    return String(ticket.raised_by?.user_id) === String(user.id);
};

const safeNotify = async (fn) => {
    try {
        if (typeof fn === "function") {
            await fn();
        }
    } catch (err) {
        logger.error("Helpdesk notification failed:", err);
    }
};

// --------------------------------------------------
// 1) CREATE TICKET
// --------------------------------------------------
export const createTicketService = async (user, data = {}) => {
    assertCreatorRole(user);

    const subject = normalizeText(data.subject);
    const description = normalizeText(data.description);
    const category = normalizeText(data.category || "general");
    const priority = normalizeText(data.priority || "medium");
    const visibility = normalizeText(data.visibility || "private");
    const attachments = normalizeAttachments(data.initial_attachments || [], user.id, "issue");

    if (!subject) throw new Error("subject is required");
    if (!description) throw new Error("description is required");
    if (!CATEGORIES.has(category)) throw new Error("Invalid category");
    if (!PRIORITIES.has(priority)) throw new Error("Invalid priority");
    if (!VISIBILITIES.has(visibility)) throw new Error("Invalid visibility");

    let ticket = null;
    let lastErr = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
        const ticket_no = await generateTicketNo();

        try {
            ticket = await HelpdeskTicket.create({
                school_id: user.school_id,
                ticket_no,
                raised_by: {
                    user_id: user.id,
                    role: user.role,
                    name: normalizeText(user.name || user.full_name || user.username || "User"),
                },
                category,
                subject,
                description,
                priority,
                status: "open",
                visibility,
                assigned_to: null,
                initial_attachments: attachments,
                responses: [],
                resolved_at: null,
                closed_at: null,
            });
            break;
        } catch (err) {
            lastErr = err;
            if (err?.code === 11000 && String(err?.message || "").includes("ticket_no")) {
                continue;
            }
            throw err;
        }
    }

    if (!ticket) {
        throw lastErr || new Error("Unable to create ticket");
    }

    // notifications must never affect the ticket write
    await safeNotify(async () => {
        await Promise.allSettled([
            notifyAdminsNewTicketService({
                school_id: user.school_id,
                ticket,
                creator: {
                    user_id: user.id,
                    role: user.role,
                    name: ticket.raised_by.name,
                },
            }),
            notifyTicketCreatedService({
                school_id: user.school_id,
                ticket,
                creator: {
                    user_id: user.id,
                    role: user.role,
                    name: ticket.raised_by.name,
                },
            }),
        ]);
    });

    return {
        ticket: await populateTicketDetail(ticket),
    };
};

// --------------------------------------------------
// 2) LIST MY TICKETS
// --------------------------------------------------
export const listMyTicketsService = async (user, query = {}) => {
    assertCreatorRole(user);

    const { page, limit, skip } = buildPagination(query);

    const filter = {
        ...buildTicketQueryBase(user),
        "raised_by.user_id": user.id,
    };

    if (query.status && STATUSES.has(String(query.status))) {
        filter.status = String(query.status);
    }

    if (query.category && CATEGORIES.has(String(query.category))) {
        filter.category = String(query.category);
    }

    if (query.priority && PRIORITIES.has(String(query.priority))) {
        filter.priority = String(query.priority);
    }

    applySearchFilter(filter, query.search);

    const [tickets, total] = await Promise.all([
        HelpdeskTicket.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(
                "ticket_no category subject priority status visibility assigned_to raised_by initial_attachments responses resolved_at closed_at createdAt updatedAt"
            )
            .populate("assigned_to", "name email role status"),
        HelpdeskTicket.countDocuments(filter),
    ]);

    return {
        data: tickets,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// --------------------------------------------------
// 3) LIST ADMIN TICKETS
// --------------------------------------------------
export const listAdminTicketsService = async (user, query = {}) => {
    assertAdminRole(user);

    const { page, limit, skip } = buildPagination(query);

    const filter = {
        ...buildTicketQueryBase(user),
    };

    if (query.status && STATUSES.has(String(query.status))) {
        filter.status = String(query.status);
    }

    if (query.category && CATEGORIES.has(String(query.category))) {
        filter.category = String(query.category);
    }

    if (query.priority && PRIORITIES.has(String(query.priority))) {
        filter.priority = String(query.priority);
    }

    if (query.creator_role && CREATOR_ROLES.has(String(query.creator_role))) {
        filter["raised_by.role"] = String(query.creator_role);
    }

    applySearchFilter(filter, query.search);

    const [tickets, total] = await Promise.all([
        HelpdeskTicket.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select(
                "ticket_no category subject priority status visibility assigned_to raised_by initial_attachments responses resolved_at closed_at createdAt updatedAt"
            )
            .populate("assigned_to", "name email role status"),
        HelpdeskTicket.countDocuments(filter),
    ]);

    return {
        data: tickets,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

// --------------------------------------------------
// 4) GET TICKET DETAIL
// --------------------------------------------------
export const getTicketDetailService = async (user, ticketId) => {
    assertCreatorOrAdmin(user);

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticket id");
    }

    const ticket = await HelpdeskTicket.findOne({
        _id: ticketId,
        school_id: user.school_id,
    });

    if (!ticket) {
        throw new Error("Ticket not found");
    }

    if (!canUserViewTicket(user, ticket)) {
        throw new Error("Unauthorized access");
    }

    return {
        ticket: await populateTicketDetail(ticket),
    };
};

// --------------------------------------------------
// 5) ADD TICKET REPLY
// --------------------------------------------------
export const addTicketReplyService = async (user, ticketId, data = {}) => {
    assertCreatorOrAdmin(user);

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticket id");
    }

    const message = normalizeText(data.message);
    const attachments = normalizeAttachments(data.attachments || [], user.id, "reply");

    if (!message) {
        throw new Error("message is required");
    }

    const ticket = await HelpdeskTicket.findOne({
        _id: ticketId,
        school_id: user.school_id,
    });

    if (!ticket) {
        throw new Error("Ticket not found");
    }

    if (!canUserReplyToTicket(user, ticket)) {
        if (ticket.status === "closed") {
            throw new Error("Replies are not allowed on closed tickets");
        }
        throw new Error("Unauthorized to reply to this ticket");
    }

    ticket.responses.push({
        user_id: user.id,
        message,
        attachments,
    });

    await ticket.save();

    return {
        ticket: await populateTicketDetail(ticket),
    };
};

// --------------------------------------------------
// 6) UPDATE TICKET STATUS
// --------------------------------------------------
export const updateTicketStatusService = async (user, ticketId, data = {}) => {
    assertAdminRole(user);

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticket id");
    }

    const nextStatus = normalizeText(data.status);
    if (!STATUSES.has(nextStatus)) {
        throw new Error("Invalid status");
    }

    const adminMessage = normalizeText(data.message);
    const attachments = normalizeAttachments(data.attachments || [], user.id, "reply");

    const ticket = await HelpdeskTicket.findOne({
        _id: ticketId,
        school_id: user.school_id,
    });

    if (!ticket) {
        throw new Error("Ticket not found");
    }

    const previousStatus = ticket.status;
    ticket.status = nextStatus;

    if (nextStatus === "resolved") {
        ticket.resolved_at = ticket.resolved_at || new Date();
        ticket.closed_at = ticket.closed_at || null;
    }

    if (nextStatus === "closed") {
        ticket.closed_at = ticket.closed_at || new Date();
        ticket.resolved_at = ticket.resolved_at || null;
    }

    if (adminMessage || attachments.length > 0) {
        ticket.responses.push({
            user_id: user.id,
            message: adminMessage || `Ticket status updated to ${nextStatus}`,
            attachments,
        });
    }

    await ticket.save();

    await safeNotify(async () => {
        if (nextStatus === "in_progress") {
            await notifyTicketInProgressService({
                school_id: user.school_id,
                ticket,
                creatorUserId: ticket.raised_by?.user_id,
                adminMessage: null,
            });
        }

        if (nextStatus === "resolved") {
            await notifyTicketResolvedService({
                school_id: user.school_id,
                ticket,
                creatorUserId: ticket.raised_by?.user_id,
                resolutionMessage: null,
            });
        }
    });

    return {
        ticket: await populateTicketDetail(ticket),
        previousStatus,
    };
};

// --------------------------------------------------
// 7) ASSIGN TICKET
// --------------------------------------------------
export const assignTicketService = async (user, ticketId, data = {}) => {
    assertAdminRole(user);

    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        throw new Error("Invalid ticket id");
    }

    const assignedToId = data.assigned_to || data.assignedTo || data.user_id;
    if (!assignedToId || !mongoose.Types.ObjectId.isValid(assignedToId)) {
        throw new Error("assigned_to is required");
    }

    const assignee = await User.findOne({
        _id: assignedToId,
        school_id: user.school_id,
        role: { $in: [...ASSIGNEE_ROLES] },
    }).select("_id name email role status");

    if (!assignee) {
        throw new Error("Assignee must be a staff or admin user in the same school");
    }

    const ticket = await HelpdeskTicket.findOne({
        _id: ticketId,
        school_id: user.school_id,
    });

    if (!ticket) {
        throw new Error("Ticket not found");
    }

    ticket.assigned_to = assignee._id;
    await ticket.save();

    await safeNotify(async () => {
        await notifyTicketAssignedService({
            school_id: user.school_id,
            ticket,
            assignee,
            assignedBy: {
                user_id: user.id,
                name: normalizeText(user.name || user.full_name || user.username || "Admin"),
            },
        });
    });

    return {
        ticket: await populateTicketDetail(ticket),
    };
};