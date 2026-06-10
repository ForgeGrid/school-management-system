// models/academic/subject.model.js

import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        code: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: "",
            trim: true,
        },

        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active",
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Prevent duplicate subject codes inside the same school
subjectSchema.index(
    { school_id: 1, code: 1 },
    { unique: true }
);

// Useful for listing/filtering
subjectSchema.index({
    school_id: 1,
    status: 1,
});

export const Subject = mongoose.model("Subject", subjectSchema);