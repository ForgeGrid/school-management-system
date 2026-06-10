import logger from "../utils/logger.js";
import { notify } from "../utils/notificationHelper.js";
import { formatINR } from "../utils/format.helper.js";
import {
    buildFeePaymentAudience,
    buildSenderId
} from "../utils/feeReminderHelper.js";

export const sendFeeReminderNotificationService = async ({
    config,
    feePlan,
    message,
    title,
    senderId,
    metadata = {},
}) => {
    return notify({
        school_id: config.school_id,
        audience: {
            student_ids: [feePlan.student_id._id || feePlan.student_id],
            roles: ["school_admin"],
        },
        sender_id: senderId,
        type: "fee_reminder",
        title,
        message,
        scope: "students",
        relatedModule: "fees",
        relatedRefId: feePlan._id,
        metadata,
    });
};


export const notifyFeePaymentSuccessService = async ({
    school_id,
    student_id,
    feePlan_id,
    receipt,
    amountPaid,
    academicYear,
}) => {
    try {
        const receiptNumber = receipt?.receiptNumber || "";
        const amountText = formatINR(amountPaid);

        return await notify({
            school_id,
            audience: buildFeePaymentAudience(student_id),
            sender_id: buildSenderId(receipt),
            type: "fee_payment_success",
            title: "Fee Payment Received",
            message: `₹${amountText} fee payment has been successfully received for the academic year ${academicYear}. Receipt No: ${receiptNumber}.`,
            scope: "students",
            relatedModule: "fees",
            relatedRefId: feePlan_id,
            metadata: {
                receiptNumber,
                paymentStatus: "success",
                paymentAmount: Number(amountPaid || 0),
                academicYear,
            },
        });
    } catch (err) {
        logger.error("notifyFeePaymentSuccessService failed:", err);
        return null;
    }
};

export const notifyFeePaymentReversedService = async ({
    school_id,
    student_id,
    feePlan_id,
    receipt,
    reversalReason,
}) => {
    try {
        const receiptNumber = receipt?.receiptNumber || "";
        const reason = String(reversalReason || receipt?.reversal?.reason || "").trim();

        return await notify({
            school_id,
            audience: buildFeePaymentAudience(student_id),
            sender_id: buildSenderId(receipt),
            type: "fee_payment_reversed",
            title: "Fee Receipt Reversed",
            message: `Your fee receipt ${receiptNumber} has been reversed by the school administration. Reason: ${reason}.`,
            scope: "students",
            relatedModule: "fees",
            relatedRefId: feePlan_id,
            metadata: {
                receiptNumber,
                paymentStatus: "reversed",
                reversalReason: reason,
                reversedAt: receipt?.reversal?.reversedAt || new Date(),
            },
        });
    } catch (err) {
        logger.error("notifyFeePaymentReversedService failed:", err);
        return null;
    }
};

/**
 * Ticket Notifications
 */

export const notifyAdminsNewTicketService = async ({ school_id, ticket, creator }) => {
    try {
        return await notify({
            school_id,
            audience: { roles: ["school_admin"] },
            sender_id: creator.user_id,
            type: "ticket_created_admin",
            title: "New Support Ticket",
            message: `A new ${ticket.priority} priority ticket (${ticket.ticket_no}) has been raised by ${creator.name} under the category "${ticket.category}".`,
            scope: "admins",
            relatedModule: "helpdesk",
            relatedRefId: ticket._id,
            metadata: {
                ticket_no: ticket.ticket_no,
                category: ticket.category,
                priority: ticket.priority,
            },
        });
    } catch (err) {
        logger.error("notifyAdminsNewTicketService failed:", err);
        return null;
    }
};

export const notifyTicketCreatedService = async ({ school_id, ticket, creator }) => {
    try {
        return await notify({
            school_id,
            audience: { user_ids: [creator.user_id] },
            sender_id: creator.user_id,
            type: "ticket_created_user",
            title: "Support Ticket Raised",
            message: `Your ticket (${ticket.ticket_no}) regarding "${ticket.subject}" has been successfully created. We will get back to you shortly.`,
            scope: "users",
            relatedModule: "helpdesk",
            relatedRefId: ticket._id,
        });
    } catch (err) {
        logger.error("notifyTicketCreatedService failed:", err);
        return null;
    }
};

export const notifyTicketAssignedService = async ({ school_id, ticket, assignee, assignedBy }) => {
    try {
        return await notify({
            school_id,
            audience: { user_ids: [assignee._id || assignee.user_id] },
            sender_id: assignedBy.user_id,
            type: "ticket_assigned",
            title: "Ticket Assigned to You",
            message: `Ticket (${ticket.ticket_no}) has been assigned to you by ${assignedBy.name}. Priority: ${ticket.priority}.`,
            scope: "users",
            relatedModule: "helpdesk",
            relatedRefId: ticket._id,
        });
    } catch (err) {
        logger.error("notifyTicketAssignedService failed:", err);
        return null;
    }
};

export const notifyTicketInProgressService = async ({ school_id, ticket, creatorUserId, adminMessage }) => {
    try {
        return await notify({
            school_id,
            audience: { user_ids: [creatorUserId] },
            sender_id: null,
            type: "ticket_in_progress",
            title: "Ticket Update: In Progress",
            message: `Work has started on your ticket (${ticket.ticket_no}). ${adminMessage ? `Update: ${adminMessage}` : "An agent is looking into your issue."}`,
            scope: "users",
            relatedModule: "helpdesk",
            relatedRefId: ticket._id,
        });
    } catch (err) {
        logger.error("notifyTicketInProgressService failed:", err);
        return null;
    }
};

export const notifyTicketResolvedService = async ({ school_id, ticket, creatorUserId, resolutionMessage }) => {
    try {
        return await notify({
            school_id,
            audience: { user_ids: [creatorUserId] },
            sender_id: null,
            type: "ticket_resolved",
            title: "Ticket Resolved",
            message: `Your ticket (${ticket.ticket_no}) has been marked as resolved. ${resolutionMessage ? `Resolution: ${resolutionMessage}` : "We hope your issue was addressed."}`,
            scope: "users",
            relatedModule: "helpdesk",
            relatedRefId: ticket._id,
        });
    } catch (err) {
        logger.error("notifyTicketResolvedService failed:", err);
        return null;
    }
};