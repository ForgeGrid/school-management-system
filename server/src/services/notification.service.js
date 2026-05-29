import logger from "../utils/logger.js";
import { notify } from "../utils/notificationHelper.js";
import {
    formatINR,
    buildFeePaymentAudience,
    buildSenderId
} from "../utils/feeReminderHelper.js";

export const sendFeeReminderNotificationService = async ({
  config,
  feePlan,
  message,
  title,
  senderId,
  metadata = {},
}) => {
  return notify({
    school_id: config.school_id,
    audience: {
      student_ids: [feePlan.student_id._id || feePlan.student_id],
      roles: ["school_admin"],
    },
    sender_id: senderId,
    type: "fee_reminder",
    title,
    message,
    scope: "students",
    relatedModule: "fees",
    relatedRefId: feePlan._id,
    metadata,
  });
};


export const notifyFeePaymentSuccessService = async ({
    school_id,
    student_id,
    feePlan_id,
    receipt,
    amountPaid,
    academicYear,
}) => {
    try {
        const receiptNumber = receipt?.receiptNumber || "";
        const amountText = formatINR(amountPaid);

        return await notify({
            school_id,
            audience: buildFeePaymentAudience(student_id),
            sender_id: buildSenderId(receipt),
            type: "fee_payment_success",
            title: "Fee Payment Received",
            message: `₹${amountText} fee payment has been successfully received for the academic year ${academicYear}. Receipt No: ${receiptNumber}.`,
            scope: "students",
            relatedModule: "fees",
            relatedRefId: feePlan_id,
            metadata: {
                receiptNumber,
                paymentStatus: "success",
                paymentAmount: Number(amountPaid || 0),
                academicYear,
            },
        });
    } catch (err) {
        logger.error("notifyFeePaymentSuccessService failed:", err);
        return null;
    }
};

export const notifyFeePaymentReversedService = async ({
    school_id,
    student_id,
    feePlan_id,
    receipt,
    reversalReason,
}) => {
    try {
        const receiptNumber = receipt?.receiptNumber || "";
        const reason = String(reversalReason || receipt?.reversal?.reason || "").trim();

        return await notify({
            school_id,
            audience: buildFeePaymentAudience(student_id),
            sender_id: buildSenderId(receipt),
            type: "fee_payment_reversed",
            title: "Fee Receipt Reversed",
            message: `Your fee receipt ${receiptNumber} has been reversed by the school administration. Reason: ${reason}.`,
            scope: "students",
            relatedModule: "fees",
            relatedRefId: feePlan_id,
            metadata: {
                receiptNumber,
                paymentStatus: "reversed",
                reversalReason: reason,
                reversedAt: receipt?.reversal?.reversedAt || new Date(),
            },
        });
    } catch (err) {
        logger.error("notifyFeePaymentReversedService failed:", err);
        return null;
    }
};