import mongoose from "mongoose";

const transportFeeStructureSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    academicYear: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    route_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusRoute",
      required: true,
      index: true,
    },


    dropPoint: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    dropPointKey: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    frequency: {
      type: String,
      enum: ["monthly", "quarterly", "term", "yearly", "one-time"],
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
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
  }
);

transportFeeStructureSchema.index(
  { school_id: 1, academicYear: 1, route_id: 1, dropPointKey: 1 },
  { unique: true }
);

transportFeeStructureSchema.pre("validate", function () {
  if (typeof this.academicYear === "string") this.academicYear = this.academicYear.trim();
  if (typeof this.dropPoint === "string") {
    this.dropPoint = this.dropPoint.trim();
    this.dropPointKey = this.dropPoint.toLowerCase();
  }
});

export const TransportFeeStructure = mongoose.model(
  "TransportFeeStructure",
  transportFeeStructureSchema
);