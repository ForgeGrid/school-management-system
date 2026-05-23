import mongoose from "mongoose";

const discountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const additionalChargeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: false }
);

const studentFeePlanSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true
    },

    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true
    },

    academicYear: {
      type: String,
      required: true
    },

    academicFeeStructure_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicFeeStructure",
      required: true
    },

    transportFeeStructure_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransportFeeStructure",
      default: null
    },

    currentRoute_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusRoute",
      default: null
    },

    discounts: {
      type: [discountSchema],
      default: []
    },

    additionalCharges: {
      type: [additionalChargeSchema],
      default: []
    },

    totalAcademicFee: {
      type: Number,
      required: true
    },

    totalTransportFee: {
      type: Number,
      default: 0
    },

    totalDiscount: {
      type: Number,
      default: 0
    },

    totalAdditionalCharges: {
      type: Number,
      default: 0
    },

    finalPayableAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "cancelled", "completed"],
      default: "active"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    feeReminder: {
      feeDueDate: {
        type: Date,
        default: null
      },
      paymentStatus: {
        type: String,
        enum: ["unpaid", "partial", "paid", "overdue"],
        default: "unpaid"
      },
      feePaidAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      feePendingAmount: {
        type: Number,
        default: 0,
        min: 0
      },
      reminderEnabled: {
        type: Boolean,
        default: true
      },
      reminderOffsets: {
        type: [Number],
        default: [7, 3, 1, 0]
      },
      lastReminderAt: {
        type: Date,
        default: null
      },
      nextReminderAt: {
        type: Date,
        default: null
      },
      reminderStage: {
        type: String,
        enum: ["upcoming", "due_soon", "due_today", "overdue", "none"],
        default: "none"
      },
      reminderCount: {
        type: Number,
        default: 0
      },
      reminderLocked: {
        type: Boolean,
        default: false
      },
      reminderMetadata: {
        type: Object,
        default: {}
      },
      paymentUpdatedAt: {
        type: Date,
        default: Date.now
      }
    }
  },
  {
    timestamps: true
  }
);

studentFeePlanSchema.index(
  {
    student_id: 1,
    academicYear: 1
  },
  { unique: true }
);

export const StudentFeePlan = mongoose.model(
  "StudentFeePlan",
  studentFeePlanSchema
);
