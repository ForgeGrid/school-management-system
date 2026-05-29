import mongoose from "mongoose";

const reversalSchema = new mongoose.Schema(
  {
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },

    reversedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const feePaymentSchema = new mongoose.Schema(
  {
    // -----------------------------------
    // Ownership & Linking
    // -----------------------------------

    school_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true
    },

    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true
    },

    feePlan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFeePlan",
      required: true,
      index: true
    },

    // -----------------------------------
    // Receipt Information
    // -----------------------------------

    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },

    academicYear: {
      type: String,
      required: true,
      trim: true
    },

    // -----------------------------------
    // Payment Information
    // -----------------------------------

    amountPaid: {
      type: Number,
      required: true,
      min: 0
    },

    balanceBeforePayment: {
      type: Number,
      required: true,
      min: 0
    },

    balanceAfterPayment: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "INR",
      uppercase: true
    },

    // -----------------------------------
    // Payment Mode
    // -----------------------------------

    paymentMode: {
      type: String,
      enum: [
        "cash",
        "upi",
        "card",
        "bank_transfer",
        "cheque",
        "online_gateway"
      ],
      required: true,
      index: true
    },

    // -----------------------------------
    // Gateway / Bank References
    // -----------------------------------

    transactionReference: {
      type: String,
      trim: true,
      default: null,
      index: true
    },

    // ## USed while online payment integration!
    // gatewayProvider: {
    //   type: String,
    //   enum: [
    //     "razorpay",
    //     "stripe",
    //     "cash",
    //     "manual_bank",
    //     "none"
    //   ],
    //   default: "none"
    // },

    // gatewayOrderId: {
    //   type: String,
    //   default: null
    // },

    // gatewayPaymentId: {
    //   type: String,
    //   default: null
    // },

    // gatewaySignature: {
    //   type: String,
    //   default: null
    // },

    // -----------------------------------
    // Payment Status
    // -----------------------------------

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "success",
        "failed",
        "cancelled",
        "reversed",
        "refunded"
      ],
      default: "success",
      index: true
    },

    // -----------------------------------
    // Manual Collection Details
    // -----------------------------------

    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    receivedAt: {
      type: Date,
      default: Date.now
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: null
    },

    // -----------------------------------
    // Reversal / Audit Trail
    // -----------------------------------

    reversal: {
      type: reversalSchema,
      default: null
    },

    // -----------------------------------
    // Security & Verification
    // -----------------------------------

    verificationStatus: {
      type: String,
      enum: [
        "unverified",
        "verified",
        "flagged"
      ],
      default: "verified"
    },

    source: {
      type: String,
      enum: [
        "manual_entry",
        "gateway_webhook",
        "bank_verification",
        "admin_adjustment"
      ],
      required: true
    },

    isLocked: {
      type: Boolean,
      default: false
    },

    // -----------------------------------
    // Metadata
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
// Compound Indexes
// -----------------------------------

feePaymentSchema.index({
  school_id: 1,
  student_id: 1,
  academicYear: 1
});

feePaymentSchema.index({
  feePlan_id: 1,
  paymentStatus: 1
});

feePaymentSchema.index({
  transactionReference: 1,
  gatewayPaymentId: 1
});

// -----------------------------------
// Export Model
// -----------------------------------

export const FeePayment = mongoose.model(
  "FeePayment",
  feePaymentSchema
);