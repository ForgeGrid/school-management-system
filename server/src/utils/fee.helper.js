/**
 * fee.helper.js
 * 
 * Domain-specific logic for fee module.
 */

/**
 * Normalizes fee heads.
 */
export const normalizeFeeHeads = (feeHeads = []) => {
    if (!Array.isArray(feeHeads)) {
        throw new Error("feeHeads must be an array");
    }

    const normalized = feeHeads.map((item, index) => {
        if (!item?.name) {
            throw new Error(`feeHeads[${index}].name is required`);
        }
        if (item.amount === undefined || item.amount === null) {
            throw new Error(`feeHeads[${index}].amount is required`);
        }
        if (!item.frequency) {
            throw new Error(`feeHeads[${index}].frequency is required`);
        }
        if (item.order === undefined || item.order === null) {
            throw new Error(`feeHeads[${index}].order is required`);
        }

        return {
            name: String(item.name).trim(),
            amount: Number(item.amount),
            frequency: item.frequency,
            mandatory: item.mandatory !== undefined ? Boolean(item.mandatory) : true,
            taxable: item.taxable !== undefined ? Boolean(item.taxable) : false,
            order: Number(item.order),
        };
    });

    const seen = new Set();
    for (const head of normalized) {
        const key = head.name.toLowerCase();
        if (seen.has(key)) {
            throw new Error(`Duplicate fee head name found: ${head.name}`);
        }
        seen.add(key);
    }

    normalized.sort((a, b) => a.order - b.order);
    return normalized;
};

/**
 * Constants for fee payments.
 */
export const MANUAL_PAYMENT_MODES = new Set([
    "cash",
    "upi",
    "card",
    "bank_transfer",
    "cheque",
]);

export const VALID_RECEIPT_STATUSES = ["success"];

/**
 * normalizePaymentStatus - Determines payment status based on amounts.
 */
export const normalizePaymentStatus = ({
    totalPaid,
    pendingAmount,
    finalPayableAmount,
}) => {
    if (pendingAmount <= 0) return "paid";
    if (totalPaid <= 0) return "unpaid";

    if (totalPaid > 0 && totalPaid < finalPayableAmount) {
        return "partial";
    }

    return "unpaid";
};

/**
 * formatAcademicYearForReceipt - Formats academic year for receipt numbers.
 */
export const formatAcademicYearForReceipt = (academicYear) => {
    const value = String(academicYear || "").trim();
    if (!value) return "";

    const match = value.match(/^(\d{4})\s*-\s*(\d{2}|\d{4})$/);
    if (!match) {
        return value.replace(/\s+/g, "");
    }

    const startYear = match[1].slice(2);
    const endPart = match[2].length === 2 ? match[2] : match[2].slice(2);
    return `${startYear}-${endPart}`;
};

/**
 * generateReceiptNumber - Generates the next sequential receipt number.
 */
export const generateReceiptNumber = async (FeePaymentModel, { schoolId, academicYear, session }) => {
    const series = formatAcademicYearForReceipt(academicYear);
    const latest = await FeePaymentModel.findOne({
        school_id: schoolId,
        academicYear,
    })
        .sort({ createdAt: -1 })
        .select("receiptNumber")
        .session(session);

    let nextSerial = 1;

    if (latest?.receiptNumber) {
        const parts = String(latest.receiptNumber).split("/");
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart, 10);

        if (!Number.isNaN(parsed)) {
            nextSerial = parsed + 1;
        }
    }

    return `RECEIPT/${series}/${String(nextSerial).padStart(4, "0")}`;
};

/**
 * resolveBalanceBeforePayment - Resolves the current balance before a new payment.
 */
export const resolveBalanceBeforePayment = (plan) => {
    const pending = plan?.paymentSummary?.pendingAmount;

    if (Number.isFinite(pending) && pending >= 0) {
        return pending;
    }

    return Math.max(Number(plan?.finalPayableAmount || 0), 0);
};

/**
 * validateReceiptUniqueness - Checks if a receipt number is already in use.
 */
export const validateReceiptUniqueness = async (FeePaymentModel, receiptNumber, schoolId, session) => {
    const existing = await FeePaymentModel.findOne({
        receiptNumber,
        school_id: schoolId,
    })
        .select("_id")
        .session(session);

    if (existing) {
        throw new Error("Receipt number already exists");
    }
};
