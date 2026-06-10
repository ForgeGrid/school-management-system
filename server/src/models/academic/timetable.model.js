// models/academic/timetable.model.js

import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
    {
        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        class_section_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClassSection",
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
            required: false,
            default: null,
            index: true,
        },

        assignment_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ClassSubjectAssignment",
            required: false,
            default: null,
            index: true,
        },

        day_of_week: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
            ],
            index: true,
        },

        period_no: {
            type: Number,
            required: true,
            min: 1,
            index: true,
        },

        period_label: {
            type: String,
            default: "",
            trim: true,
        },

        start_time: {
            type: String,
            required: true,
            trim: true,
        },

        end_time: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["draft", "published", "inactive"],
            default: "draft",
            index: true,
        },

        publishedAt: {
            type: Date,
            default: null,
        },

        publishedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
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

// One class section can only have one slot per day + period
timetableSchema.index(
    { school_id: 1, class_section_id: 1, day_of_week: 1, period_no: 1 },
    { unique: true }
);

// One staff member can only teach one slot per day + period
timetableSchema.index(
    { school_id: 1, staff_id: 1, day_of_week: 1, period_no: 1 },
    { unique: false }
);

// Fast lookup for class timetable
timetableSchema.index({
    school_id: 1,
    class_section_id: 1,
    day_of_week: 1,
    status: 1,
});

// Fast lookup for staff timetable
timetableSchema.index({
    school_id: 1,
    staff_id: 1,
    day_of_week: 1,
    status: 1,
});

export const Timetable = mongoose.model("Timetable", timetableSchema);