// models/parent/parentProfile.model.js

import mongoose from "mongoose";

const parentProfileSchema = new mongoose.Schema(
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

        children: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "StudentProfile",
            },
        ],

        primary_phone: {
            type: String,
            required: true,
            trim: true,
        },

        alternate_contact: {
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
    },
    {
        timestamps: true,
        versionKey: false,
    },
);

export const ParentProfile = mongoose.model(
    "ParentProfile",
    parentProfileSchema,
);