import mongoose from "mongoose";

const classSectionSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    standard: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    section: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      index: true,
    },

    classCode: {
      type: String,
      required: true,
      trim: true,
    },

    classTeacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StaffProfile",
      default: null
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    currentStrength: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    }
  },
  {
    timestamps: true
  }
);

classSectionSchema.index(
  {
    school_id: 1,
    academicYear: 1,
    standard: 1,
    section: 1
  },
  {
    unique: true
  }
);

classSectionSchema.pre("validate", function () {
  if (typeof this.academicYear === "string") this.academicYear = this.academicYear.trim();
  if (typeof this.standard === "string") this.standard = this.standard.trim();
  if (typeof this.section === "string") this.section = this.section.trim().toUpperCase();
  if (typeof this.classCode === "string") this.classCode = this.classCode.trim();
});

export const ClassSection = mongoose.model(
  "ClassSection",
  classSectionSchema
);