// models/student/studentProfile.model.js
import mongoose from "mongoose";

const studentProfileSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        admission_no: {
            type: String,
            required: true,
            trim: true,
        },

        student_name: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other", "prefer_not_to_say"],
            default: "prefer_not_to_say",
        },

        dob: {
            type: Date,
            default: null,
        },

        requestedGrade: {
            type: String,
            trim: true,
            default: null,
            index: true,
        },

        transport_required: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["active", "withdrawn", "transferred", "suspended"],
            default: "active",
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
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

studentProfileSchema.index({ school_id: 1, admission_no: 1 }, { unique: true });

export const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema);