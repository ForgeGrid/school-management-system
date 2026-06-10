import mongoose from "mongoose";
import { FeePayment } from "../models/fees/feeReceipt.model.js";
import { StudentFeePlan } from "../models/fees/studentFeePlan.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import { normalizeAcademicYear } from "../utils/feeReminderHelper.js";
import { checkTransactionSupport } from "../utils/transactionHelper.js";
import {
  notifyFeePaymentSuccessService,
  notifyFeePaymentReversedService,
} from "./notification.service.js";

import {
  assertAdminOrStaff,
  assertParentOrStudent,
} from "../utils/auth.helper.js";
import {
  normalizeText,
} from "../utils/format.helper.js";
import {
  MANUAL_PAYMENT_MODES,
  VALID_RECEIPT_STATUSES,
  normalizePaymentStatus,
  generateReceiptNumber,
  resolveBalanceBeforePayment,
  validateReceiptUniqueness,
} from "../utils/fee.helper.js";
import {
  buildPagination,
} from "../utils/pagination.helper.js";
import {
  getByIdOrThrow as getByIdOrThrowGeneric,
} from "../utils/db.helper.js";


// --------------------------------------------------
// CONSTANTS
// --------------------------------------------------


// --------------------------------------------------
// SERVICES
// --------------------------------------------------

// --------------------------------------------------
// Create Fee Receipt / Manual Fee Payment
// --------------------------------------------------
export const createFeePaymentService = async (user, data = {}) => {
  assertAdminOrStaff(user);

  const studentId = data.student_id;
  const feePlanId = data.feePlan_id;
  const amountPaid = Number(data.amountPaid);
  const paymentMode = normalizeText(data.paymentMode).toLowerCase();
  const transactionReference = data.transactionReference
    ? normalizeText(data.transactionReference)
    : null;
  const remarks = data.remarks ? normalizeText(data.remarks) : null;
  const receiptNumberInput = data.receiptNumber ? normalizeText(data.receiptNumber) : null;

  if (!studentId) throw new Error("student_id is required");
  if (!feePlanId) throw new Error("feePlan_id is required");
  if (!Number.isFinite(amountPaid) || amountPaid <= 0) {
    throw new Error("amountPaid must be a positive number");
  }
  if (!paymentMode) throw new Error("paymentMode is required");
  if (!MANUAL_PAYMENT_MODES.has(paymentMode)) {
    throw new Error("Only manual payment modes are allowed in this phase");
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student_id");
  }
  if (!mongoose.Types.ObjectId.isValid(feePlanId)) {
    throw new Error("Invalid feePlan_id");
  }

  const useTransaction = await checkTransactionSupport();
  let session = null;

  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (error) {
      session = null;
    }
  }

  try {
    const student = await getByIdOrThrowGeneric(StudentProfile, user.school_id, studentId, "Student");

    const feePlan = await StudentFeePlan.findOne({
      _id: feePlanId,
      school_id: user.school_id,
      student_id: student._id,
    }).session(session);

    if (!feePlan) {
      throw new Error("Fee plan not found for this student");
    }

    if (feePlan.status === "cancelled") {
      throw new Error("Cannot collect payment for a cancelled fee plan");
    }

    const academicYear = normalizeAcademicYear(feePlan.academicYear);
    if (!academicYear) {
      throw new Error("Fee plan academic year is invalid");
    }

    const balanceBeforePayment = resolveBalanceBeforePayment(feePlan);

    if (amountPaid > balanceBeforePayment) {
      throw new Error("Amount paid cannot exceed the pending balance");
    }

    const balanceAfterPayment = Math.max(balanceBeforePayment - amountPaid, 0);

    let receiptNumber = receiptNumberInput;

    if (!receiptNumber) {
      receiptNumber = await generateReceiptNumber(FeePayment, {
        schoolId: user.school_id,
        academicYear,
        session,
      });
    } else {
      await validateReceiptUniqueness(FeePayment, receiptNumber, user.school_id, session);
    }

    const [receipt] = await FeePayment.create(
      [
        {
          school_id: user.school_id,
          student_id: student._id,
          feePlan_id: feePlan._id,
          receiptNumber,
          academicYear,
          amountPaid,
          balanceBeforePayment,
          balanceAfterPayment,
          paymentMode,
          transactionReference,
          paymentStatus: "success",
          receivedBy: user.id,
          remarks,
          reversal: null,
          verificationStatus: "verified",
          source: "manual_entry",
          isLocked: true,
          createdBy: user.id,
          updatedBy: user.id,
        },
      ],
      { session }
    );

    const existingSummary = feePlan.paymentSummary || {};
    const currentPaid = Number(existingSummary.paidAmount || 0);
    const newPaidAmount = currentPaid + amountPaid;
    const newPendingAmount = balanceAfterPayment;

    const newPaymentStatus = normalizePaymentStatus({
      totalPaid: newPaidAmount,
      pendingAmount: newPendingAmount,
      finalPayableAmount: feePlan.finalPayableAmount,
    });

    feePlan.paymentSummary = {
      paidAmount: newPaidAmount,
      pendingAmount: newPendingAmount,
      paymentStatus: newPaymentStatus,
      paymentUpdatedAt: new Date(),
      lastPaymentAt: new Date(),
      lastReceipt_id: receipt._id,
    };

    // Plan Completion Logic
    if (newPendingAmount === 0) {
      feePlan.status = "completed";
    }

    feePlan.updatedBy = user.id;
    await feePlan.save({ session });

    if (useTransaction && session) {
      await session.commitTransaction();
    }

    // Trigger Success Notification (Non-blocking)
    try {
      await notifyFeePaymentSuccessService({
        school_id: user.school_id,
        student_id: feePlan.student_id,
        feePlan_id: feePlan._id,
        receipt: receipt,
        amountPaid: data.amountPaid,
        academicYear: feePlan.academicYear,
      });
    } catch (notifErr) {
      console.error("Payment success notification failed:", notifErr);
    }

    return {
      receipt,
      feePlan,
    };
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }

    if (err?.code === 11000) {
      throw new Error("Receipt number already exists");
    }

    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// --------------------------------------------------
// Reverse Fee Receipt
// --------------------------------------------------
export const reverseFeePaymentService = async (user, receiptId, data = {}) => {
  assertAdminOrStaff(user);

  if (!mongoose.Types.ObjectId.isValid(receiptId)) {
    throw new Error("Invalid receipt id");
  }

  const reversalReason = String(data.reversalReason || "").trim();

  if (!reversalReason) {
    throw new Error("reversalReason is required");
  }

  const useTransaction = await checkTransactionSupport();
  let session = null;

  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (error) {
      session = null;
    }
  }

  try {
    const receipt = await FeePayment.findOne({
      _id: receiptId,
      school_id: user.school_id,
    }).session(session);

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    // Prevent multiple reversals
    if (receipt.paymentStatus === "reversed") {
      throw new Error("Receipt already reversed");
    }

    // Prevent reversing cancelled receipts
    if (receipt.paymentStatus === "cancelled") {
      throw new Error("Cancelled receipt cannot be reversed");
    }

    // Immutable financial protection
    if (!receipt.isLocked) {
      throw new Error("Unlocked receipts cannot be reversed");
    }

    // Mark reversal
    receipt.paymentStatus = "reversed";

    receipt.reversal = {
      reason: reversalReason,
      reversedAt: new Date(),
      reversedBy: user.id,
    };

    receipt.updatedBy = user.id;

    await receipt.save({ session });

    // rebuild payment summary from valid receipts
    const recalculated = await recalculatePaymentSummaryService({
      feePlanId: receipt.feePlan_id,
      schoolId: user.school_id,
      updatedBy: user.id,
      session,
    });

    if (useTransaction && session) {
      await session.commitTransaction();
    }

    // Trigger Reversal Notification (Non-blocking)
    try {
      await notifyFeePaymentReversedService({
        school_id: user.school_id,
        student_id: receipt.student_id,
        feePlan_id: receipt.feePlan_id,
        receipt: receipt,
        reversalReason: reversalReason,
      });
    } catch (notifErr) {
      console.error("Payment reversal notification failed:", notifErr);
    }

    return {
      message: "Receipt reversed successfully",
      receipt,
      paymentSummary: recalculated.paymentSummary,
      feePlan: recalculated.feePlan,
    };
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};

// --------------------------------------------------
// Recalculate paymentSummary from receipt ledger
// --------------------------------------------------
export const recalculatePaymentSummaryService = async ({
  feePlanId,
  schoolId,
  updatedBy = null,
  session = null,
}) => {
  if (!mongoose.Types.ObjectId.isValid(feePlanId)) {
    throw new Error("Invalid feePlanId");
  }

  const feePlan = await StudentFeePlan.findOne({
    _id: feePlanId,
    school_id: schoolId,
  }).session(session);

  if (!feePlan) {
    throw new Error("Fee plan not found");
  }

  const validReceipts = await FeePayment.find({
    school_id: schoolId,
    feePlan_id: feePlan._id,
    paymentStatus: { $in: VALID_RECEIPT_STATUSES },
  })
    .sort({ createdAt: 1 })
    .session(session);

  const totalPaid = validReceipts.reduce((sum, receipt) => {
    return sum + Number(receipt.amountPaid || 0);
  }, 0);

  const finalPayableAmount = Number(feePlan.finalPayableAmount || 0);

  const pendingAmount = Math.max(finalPayableAmount - totalPaid, 0);

  const paymentStatus = normalizePaymentStatus({
    totalPaid,
    pendingAmount,
    finalPayableAmount,
  });

  const latestReceipt =
    validReceipts.length > 0 ? validReceipts[validReceipts.length - 1] : null;

  feePlan.paymentSummary = {
    paidAmount: totalPaid,
    pendingAmount,
    paymentStatus,
    paymentUpdatedAt: new Date(),
    lastPaymentAt: latestReceipt?.receivedAt || latestReceipt?.createdAt || null,
    lastReceipt_id: latestReceipt?._id || null,
  };

  // FeePlan lifecycle sync
  if (paymentStatus === "paid") {
    feePlan.status = "completed";
  } else if (feePlan.status === "completed") {
    // reversal recovery
    feePlan.status = "active";
  }

  if (updatedBy) {
    feePlan.updatedBy = updatedBy;
  }

  await feePlan.save({ session });

  return {
    feePlan,
    paymentSummary: feePlan.paymentSummary,
    totalValidReceipts: validReceipts.length,
  };
};

// --------------------------------------------------
// GET / QUERY SERVICES
// --------------------------------------------------

// --------------------------------------------------
// ADMIN / STAFF
// Get all receipts
// --------------------------------------------------
export const getAllFeeReceiptsService = async (user, query = {}) => {
  assertAdminOrStaff(user);

  const { page, limit, skip } = buildPagination(query);

  const filter = {
    school_id: user.school_id,
  };

  // Optional filters
  if (query.student_id) {
    if (!mongoose.Types.ObjectId.isValid(query.student_id)) {
      throw new Error("Invalid student_id");
    }

    filter.student_id = query.student_id;
  }

  if (query.paymentStatus) {
    filter.paymentStatus = query.paymentStatus;
  }

  if (query.paymentMode) {
    filter.paymentMode = query.paymentMode;
  }

  if (query.academicYear) {
    filter.academicYear = String(query.academicYear).trim();
  }

  const [receipts, total] = await Promise.all([
    FeePayment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("student_id", "student_name admission_no profile_avatar")
      .populate("feePlan_id", "academicYear finalPayableAmount paymentSummary")
      .populate("receivedBy", "name email role")
      .populate("reversal.reversedBy", "name email role"),

    FeePayment.countDocuments(filter),
  ]);

  return {
    receipts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// --------------------------------------------------
// ADMIN / STAFF
// Get one student's receipt history
// --------------------------------------------------
export const getStudentReceiptHistoryService = async (user, studentId, query = {}) => {
  assertAdminOrStaff(user);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid student_id");
  }

  const { page, limit, skip } = buildPagination(query);

  const filter = {
    school_id: user.school_id,
    student_id: studentId,
  };

  if (query.feePlan_id) {
    if (!mongoose.Types.ObjectId.isValid(query.feePlan_id)) {
      throw new Error("Invalid feePlan_id");
    }

    filter.feePlan_id = query.feePlan_id;
  }

  const [receipts, total] = await Promise.all([
    FeePayment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("student_id", "student_name admission_no profile_avatar")
      .populate("feePlan_id", "academicYear finalPayableAmount paymentSummary")
      .populate("receivedBy", "name email role")
      .populate("reversal.reversedBy", "name email role"),

    FeePayment.countDocuments(filter),
  ]);

  return {
    student_id: studentId,
    receipts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// --------------------------------------------------
// PARENT / STUDENT
// Get own receipts
// --------------------------------------------------
export const getMyFeeReceiptsService = async (user, query = {}) => {
  assertParentOrStudent(user);

  const { page, limit, skip } = buildPagination(query);

  // Find the student profile associated with this user
  const student = await StudentProfile.findOne({
    user_id: user.id || user.data?._id,
    school_id: user.school_id,
  }).select("_id");

  if (!student) {
    throw new Error("Student profile not found for this user");
  }

  const studentId = student._id;

  const filter = {
    school_id: user.school_id,
    student_id: studentId,
  };

  if (query.feePlan_id) {
    if (!mongoose.Types.ObjectId.isValid(query.feePlan_id)) {
      throw new Error("Invalid feePlan_id");
    }

    filter.feePlan_id = query.feePlan_id;
  }

  const [receipts, total] = await Promise.all([
    FeePayment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("feePlan_id", "academicYear finalPayableAmount paymentSummary"),

    FeePayment.countDocuments(filter),
  ]);

  return {
    receipts,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// --------------------------------------------------
// PARENT / STUDENT
// Get one receipt detail
// --------------------------------------------------
export const getMyReceiptDetailService = async (user, receiptId) => {
  assertParentOrStudent(user);

  if (!mongoose.Types.ObjectId.isValid(receiptId)) {
    throw new Error("Invalid receipt id");
  }

  // Find the student profile associated with this user
  const student = await StudentProfile.findOne({
    user_id: user.id || user.data?._id,
    school_id: user.school_id,
  }).select("_id");

  if (!student) {
    throw new Error("Student profile not found for this user");
  }

  const studentId = student._id;

  const receipt = await FeePayment.findOne({
    _id: receiptId,
    school_id: user.school_id,
    student_id: studentId,
  })
    .populate("feePlan_id", "academicYear finalPayableAmount paymentSummary")
    .populate("receivedBy", "name role")
    .populate("reversal.reversedBy", "name role");

  if (!receipt) {
    throw new Error("Receipt not found");
  }

  return receipt;
};