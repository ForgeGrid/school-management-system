import mongoose from "mongoose";

const feeHeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ["monthly", "term", "yearly", "one-time"],
      required: true,
    },
    mandatory: {
      type: Boolean,
      default: true,
    },
    taxable: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const academicFeeStructureSchema = new mongoose.Schema(
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

    standard: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },

    feeHeads: {
      type: [feeHeadSchema],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length > 0;
        },
        message: "At least one fee head is required",
      },
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

// One structure per school + academic year + standard
academicFeeStructureSchema.index(
  { school_id: 1, academicYear: 1, standard: 1 },
  { unique: true }
);


academicFeeStructureSchema.pre("validate", function () {
  if (typeof this.standard === "string") {
    this.standard = this.standard.trim();
  }

  if (typeof this.academicYear === "string") {
    this.academicYear = this.academicYear.trim();
  }
});

export const AcademicFeeStructure = mongoose.model(
  "AcademicFeeStructure",
  academicFeeStructureSchema
);