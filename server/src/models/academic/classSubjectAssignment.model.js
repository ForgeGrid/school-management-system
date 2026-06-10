// models/academic/classSubjectAssignment.model.js

import mongoose from "mongoose";

const classSubjectAssignmentSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        subject_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Subject",
            required: true,
            index: true,
        },

        staff_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "StaffProfile",
            required: true,
            index: true,
        },

        class_section_ids: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "ClassSection",
                },
            ],
            required: true,
            validate: {
                validator: function (value) {
                    return Array.isArray(value) && value.length > 0;
                },
                message: "At least one class section must be assigned",
            },
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
    },
);

// Prevent duplicate subject-teacher mappings in the same school
classSubjectAssignmentSchema.index(
    { school_id: 1, subject_id: 1, staff_id: 1 },
    { unique: true },
);

// Fast lookup for teacher-to-subject mapping
classSubjectAssignmentSchema.index({
    school_id: 1,
    staff_id: 1,
});

classSubjectAssignmentSchema.index({
    school_id: 1,
    subject_id: 1,
});

export const ClassSubjectAssignment = mongoose.model(
    "ClassSubjectAssignment",
    classSubjectAssignmentSchema,
);