import mongoose from "mongoose";

const reminderTargetSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: [
        "all_students",
        "grades",
        "class_sections",
        "students"
      ],
      required: true
    },

    gradeLevels: {
      type: [String],
      default: []
    },

    classSection_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "ClassSection",
      default: []
    },

    student_ids: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "StudentProfile",
      default: []
    }
  },
  { _id: false }
);

const reminderMessageSchema = new mongoose.Schema(
  {
    templateType: {
      type: String,
      enum: [
        "fee_due",
        "fee_overdue",
        "transport_fee",
        "partial_pending",
        "custom"
      ],
      default: "fee_due"
    },

    customMessage: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },

    includePendingAmount: {
      type: Boolean,
      default: true
    },

    includeDueDate: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const feeReminderConfigSchema = new mongoose.Schema(
  {
    // -----------------------------------
    // Ownership
    // -----------------------------------

    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true
    },

    academicYear: {
      type: String,
      required: true,
      trim: true
    },

    // -----------------------------------
    // Reminder Configuration
    // -----------------------------------

    reminderName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    feeType: {
      type: String,
      enum: [
        "academic",
        "transport",
        "both"
      ],
      default: "both"
    },

    feeDueDate: {
      type: Date,
      required: true
    },

    reminderOffsets: {
      type: [Number],
      default: [7, 3, 1, 0]
    },

    reminderMode: {
      type: String,
      enum: [
        "cron",
        "manual",
        "both"
      ],
      default: "both"
    },

    reminderEnabled: {
      type: Boolean,
      default: true
    },

    autoStopOnFullPayment: {
      type: Boolean,
      default: true
    },

    // -----------------------------------
    // Target Audience
    // -----------------------------------

    targets: {
      type: reminderTargetSchema,
      required: true
    },

    // -----------------------------------
    // Reminder Message
    // -----------------------------------

    messageConfig: {
      type: reminderMessageSchema,
      required: true
    },

    // -----------------------------------
    // Trigger Tracking
    // -----------------------------------

    lastTriggeredAt: {
      type: Date,
      default: null
    },

    lastTriggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    triggerCount: {
      type: Number,
      default: 0
    },

    // -----------------------------------
    // Manual Override Controls
    // -----------------------------------

    manuallyStopped: {
      type: Boolean,
      default: false
    },

    stoppedAt: {
      type: Date,
      default: null
    },

    stoppedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    stopReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: null
    },

    // -----------------------------------
    // Status
    // -----------------------------------

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "archived"
      ],
      default: "active",
      index: true
    },

    // -----------------------------------
    // Audit Fields
    // -----------------------------------

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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

// -----------------------------------
// Indexes
// -----------------------------------

feeReminderConfigSchema.index({
  school_id: 1,
  academicYear: 1,
  status: 1
});

feeReminderConfigSchema.index({
  feeDueDate: 1,
  reminderEnabled: 1
});

// -----------------------------------
// Export
// -----------------------------------

export const FeeReminder = mongoose.model(
  "FeeReminder",
  feeReminderConfigSchema
);