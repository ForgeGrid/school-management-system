// models/staff/staffProfile.model.js

import mongoose from "mongoose";

const staffProfileSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        school_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },

        // 🧑‍🏫 Professional Info
        designation: String, // Principal, Math Teacher, Clerk
        department: String,  // Science, Admin, Transport

        qualification: String,
        experienceYears: Number,

        subjects: [String], // Only for teachers

        // 🆔 Internal School Info
        employeeId: {
            type: String,
            unique: true,
            sparse: true,
        },

        joiningDate: {
            type: Date,
            default:null
        },

        // 📞 Contact
        phone: String,
        alternatePhone: String,

        // 🟢 Approval Flow
        verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
        },

        verifiedAt: {
            type: Date,
            default: null,
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export const StaffProfile = mongoose.model("StaffProfile", staffProfileSchema);