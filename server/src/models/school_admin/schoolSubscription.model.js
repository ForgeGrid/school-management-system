import mongoose from "mongoose";

const schoolSubscriptionSchema = new mongoose.Schema(
  {
    school_admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    status: {
      type: String,
      enum: ["trial", "active", "expired", "cancelled", "suspended"],
      default: "trial",
    },

    startDate: Date,
    trialEndDate: Date,
    renewalDate: Date,
    expiryDate: Date,
    cancelledAt: Date,

    paymentProvider: {
      type: String,
      enum: ["razorpay", "stripe", "manual"],
    },

    externalSubscriptionId: String,
  },
  { timestamps: true }
);

export default mongoose.model(
  "SchoolSubscription",
  schoolSubscriptionSchema
);