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

        age: {
            type: Number,
            default: null,
        },

        class_name: {
            type: String,
            required: true,
            trim: true,
        },

        section: {
            type: String,
            default: "",
            trim: true,
        },

        roll_no: {
            type: String,
            default: "",
            trim: true,
        },

        roll_history: [
            {
                roll_no: String,
                class_name: String,
                section: String,
                academic_year: String,
                updatedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                updatedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        parent_name: {
            type: String,
            default: "",
            trim: true,
        },

        parent_email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true,
        },

        parent_phone: {
            type: String,
            default: "",
            trim: true,
        },

        guardian_name: {
            type: String,
            default: "",
            trim: true,
        },

        guardian_relation: {
            type: String,
            default: "",
            trim: true,
        },

        address: {
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
        },

        transport_required: {
            type: Boolean,
            default: false,
        },

        bus_route: {
            type: String,
            default: "",
            trim: true,
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