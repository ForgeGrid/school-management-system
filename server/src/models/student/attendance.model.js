import mongoose from "mongoose";

const absentReasonSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      trim: true
    },

    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "absentReason.submittedByModel"
    },

    submittedByModel: {
      type: String,
      enum: ["User", "Parent"]
    },

    submittedAt: {
      type: Date
    }
  },
  { _id: false }
);

const attendanceSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true
    },

    academicYear: {
      type: String,
      required: true
    },

    classSection_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ClassSection",
      required: true
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true
    },

    attendanceDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "late",
        "half_day",
        "excused"
      ],
      required: true
    },

    absentReason: {
      type: absentReasonSchema,
      default: null
    },

    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    markedRole: {
      type: String,
      enum: [
        "school_admin",
        "teacher"
      ]
    },

    markedAt: {
      type: Date,
      default: Date.now
    },

    editableUntil: {
      type: Date,
      required: true
    },

    isLocked: {
      type: Boolean,
      default: false
    },

    source: {
      type: String,
      enum: [
        "manual",
        "bulk_upload",
        "biometric"
      ],
      default: "manual"
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

attendanceSchema.index(
  {
    school_id: 1,
    student_id: 1,
    attendanceDate: 1
  },
  {
    unique: true
  }
);

export const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);