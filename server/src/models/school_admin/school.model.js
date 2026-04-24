import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    // Basic School Info
    name: { type: String, required: true, trim: true },
    schoolEmail: { type: String, trim: true, lowercase: true },
    schoolPhone: { type: String, trim: true },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    domain: { type: String, unique: true, sparse: true },
    logoUrl: String,

    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },

    // Academic Info
    board: {
      type: String, // CBSE / ICSE / State Board / etc
      default: "",
    },

    medium: {
      type: String, // English / Tamil / etc
      default: "",
    },

    // Address
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    // Verification (YOUR approval as super admin)
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    rejection_reason: {
      type: String,
      default: null,
    },

    // Trial & Plan
    trialUsed: {
      type: Boolean,
      default: false,
    },

    trialEndDate: {
      type: Date,
    },

    plan: {
      type: String,
      enum: ["free_trial", "basic", "pro", "enterprise"],
      default: "free_trial",
    },

    // Ownership
    ownerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // Appeal for Rejected Schools
    appealCount: {
      type: Number,
      default: 0,
    },

    lastAppealedAt: {
      type: Date,
      default: null,
    },

  },
  { timestamps: true },
);

export default mongoose.model("School", schoolSchema);
