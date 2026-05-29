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

    /**
     * @property {Object} paymentSummary
     * System-managed financial state. 
     * DO NOT edit manually via creation or update APIs.
     * Managed exclusively by the ledger/receipt and recalculation services.
     */
    paymentSummary: {
      paidAmount: {
        type: Number,
        default: 0,
        min: 0
      },

      pendingAmount: {
        type: Number,
        required: true,
        min: 0
      },

      paymentStatus: {
        type: String,
        enum: [
          "unpaid",
          "partial",
          "paid",
          "overdue"
        ],
        default: "unpaid",
        index: true
      },

      lastPaymentAt: {
        type: Date,
        default: null
      },

      lastReceipt_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FeePayment",
        default: null
      },

      paymentUpdatedAt: {
        type: Date,
        default: Date.now
      }
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
