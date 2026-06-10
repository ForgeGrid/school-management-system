// models/common/helpdesk.model.js

import mongoose from "mongoose";

const ticketAttachmentSchema = new mongoose.Schema(
    {
        public_id: {
            type: String,
            required: true,
            trim: true,
        },

        secure_url: {
            type: String,
            required: true,
            trim: true,
        },

        uploaded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        type: {
            type: String,
            enum: ["issue", "resolution", "reply"],
            default: "issue",
        },

        uploaded_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: false,
    }
);

const ticketReplySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        attachments: {
            type: [ticketAttachmentSchema],
            default: [],
        },
    },
    {
        timestamps: true,
        _id: false,
    }
);

const helpdeskTicketSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        ticket_no: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        raised_by: {
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            role: {
                type: String,
                enum: ["parent", "teacher", "staff"],
                required: true,
            },

            name: {
                type: String,
                required: true,
                trim: true,
            },
        },

        category: {
            type: String,
            enum: [
                "academic",
                "fees",
                "transport",
                "attendance",
                "technical",
                "complaint",
                "facility",
                "general",
            ],
            default: "general",
            index: true,
        },

        subject: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "urgent"],
            default: "medium",
            index: true,
        },

        status: {
            type: String,
            enum: ["open", "in_progress", "resolved", "closed"],
            default: "open",
            index: true,
        },

        visibility: {
            type: String,
            enum: ["private", "department", "public"],
            default: "private",
        },

        assigned_to: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        initial_attachments: {
            type: [ticketAttachmentSchema],
            default: [],
        },

        responses: {
            type: [ticketReplySchema],
            default: [],
        },

        resolved_at: {
            type: Date,
            default: null,
        },

        closed_at: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Helpful indexes
helpdeskTicketSchema.index({
    school_id: 1,
    status: 1,
});

helpdeskTicketSchema.index({
    school_id: 1,
    category: 1,
});

helpdeskTicketSchema.index({
    "raised_by.user_id": 1,
});

export const HelpdeskTicket = mongoose.model(
    "HelpdeskTicket",
    helpdeskTicketSchema,
);