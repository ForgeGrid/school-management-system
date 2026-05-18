import mongoose from "mongoose";

const studentEnrollmentSchema = new mongoose.Schema(
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

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },

    classSection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSection",
      required: true,
      index: true,
    },

    roll_no: {
      type: Number,
      required: true,
      min: 1,
    },

    previousEnrollment_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentEnrollment",
      default: null,
    },

    enrollmentType: {
      type: String,
      enum: ["new_admission", "promotion", "transfer"],
      default: "new_admission",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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
  }
);

studentEnrollmentSchema.index(
  {
    school_id: 1,
    academicYear: 1,
    classSection_id: 1,
    roll_no: 1,
  },
  { unique: true }
);

studentEnrollmentSchema.index(
  {
    school_id: 1,
    academicYear: 1,
    student_id: 1,
  },
  { unique: true }
);

studentEnrollmentSchema.pre("validate", function () {
  if (typeof this.academicYear === "string") this.academicYear = this.academicYear.trim();
});

export const StudentEnrollment = mongoose.model(
  "StudentEnrollment",
  studentEnrollmentSchema
);