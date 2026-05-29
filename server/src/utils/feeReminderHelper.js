import mongoose from "mongoose";
import { FeeReminder } from "../models/fees/feeReminder.model.js";
import { StudentFeePlan } from "../models/fees/studentFeePlan.model.js";
import { StudentEnrollment } from "../models/student/studentEnrollment.model.js";
import { ClassSection } from "../models/academic/classSection.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import { User } from "../models/auth/user.model.js";
import { notify } from "../utils/notificationHelper.js";
import { Notification } from "../models/notification/notification.model.js";

export const REMINDER_TARGET_TYPES = new Set([
  "all_students",
  "grades",
  "class_sections",
  "students",
]);

export const REMINDER_MODES = new Set(["cron", "manual", "both"]);
export const FEE_TYPES = new Set(["academic", "transport", "both"]);
export const TEMPLATE_TYPES = new Set([
  "fee_due",
  "fee_overdue",
  "transport_fee",
  "partial_pending",
  "custom",
]);

const normalizeString = (value) => String(value ?? "").trim();

export const normalizeAcademicYear = (value) => normalizeString(value).replace(/\s+/g, "");

export const normalizeOffsets = (offsets = [7, 3, 1, 0]) => {
  if (!Array.isArray(offsets)) {
    throw new Error("reminderOffsets must be an array");
  }

  const cleaned = offsets
    .map((n) => Number(n))
    .filter((n) => Number.isInteger(n) && n >= 0);

  return [...new Set(cleaned)].sort((a, b) => b - a);
};

export const getIstStartOfToday = (date = new Date()) => {
  // Use Intl to get the date in Asia/Kolkata timezone
  const istStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(date);

  const [m, d, y] = istStr.split("/");
  const today = new Date(Number(y), Number(m) - 1, Number(d), 0, 0, 0, 0);
  return today;
};

export const getDaysLeft = (dueDate, today = getIstStartOfToday()) => {
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const formatCurrencyINR = (value) => {
  const amount = Number(value || 0);
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount)}`;
};

export const formatINR = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDateShort = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN");
};

export const getFeeTypeLabel = (feeType) => {
  switch (feeType) {
    case "academic":
      return "Academic Fee";
    case "transport":
      return "Transport Fee";
    default:
      return "Fee";
  }
};

export const buildFeePaymentAudience = (student_id) => ({
  student_ids: [student_id],
  roles: ["student", "parent"],
});

export const buildSenderId = (receipt) => {
  return receipt?.receivedBy || receipt?.createdBy || receipt?.reversal?.reversedBy || receipt?.updatedBy || null;
};

export const replacePlaceholders = (template, values = {}) => {
  const source = String(template || "");
  return source.replace(/\{(\w+)\}/g, (_, key) => {
    const value = values[key];
    return value === undefined || value === null ? "" : String(value);
  }).replace(/\s+/g, " ").trim();
};

export const normalizeReminderMessageConfig = (messageConfig = {}) => {
  const templateType = TEMPLATE_TYPES.has(messageConfig.templateType)
    ? messageConfig.templateType
    : "fee_due";

  const customMessage = messageConfig.customMessage
    ? normalizeString(messageConfig.customMessage)
    : null;

  if (templateType === "custom" && !customMessage) {
    throw new Error("customMessage is required when templateType is custom");
  }

  return {
    templateType,
    customMessage,
    includePendingAmount:
      messageConfig.includePendingAmount === undefined
        ? true
        : Boolean(messageConfig.includePendingAmount),
    includeDueDate:
      messageConfig.includeDueDate === undefined
        ? true
        : Boolean(messageConfig.includeDueDate),
  };
};

export const validateAndNormalizeReminderTargets = async ({
  schoolId,
  academicYear,
  targets = {},
}) => {
  const targetType = targets.targetType;

  if (!REMINDER_TARGET_TYPES.has(targetType)) {
    throw new Error("Invalid targetType");
  }

  const normalized = {
    targetType,
    gradeLevels: [],
    classSection_ids: [],
    student_ids: [],
  };

  if (targetType === "all_students") {
    if ((targets.gradeLevels || []).length || (targets.classSection_ids || []).length || (targets.student_ids || []).length) {
      throw new Error("all_students target cannot include gradeLevels, classSection_ids, or student_ids");
    }
    return normalized;
  }

  if (targetType === "grades") {
    const gradeLevels = [...new Set((targets.gradeLevels || []).map((g) => normalizeString(g)).filter(Boolean))];
    if (!gradeLevels.length) {
      throw new Error("gradeLevels is required for grades target");
    }

    if ((targets.classSection_ids || []).length || (targets.student_ids || []).length) {
      throw new Error("grades target cannot include classSection_ids or student_ids");
    }

    normalized.gradeLevels = gradeLevels;
    return normalized;
  }

  if (targetType === "class_sections") {
    const ids = [...new Set((targets.classSection_ids || []).map((id) => String(id)).filter(Boolean))];
    if (!ids.length) {
      throw new Error("classSection_ids is required for class_sections target");
    }

    if ((targets.gradeLevels || []).length || (targets.student_ids || []).length) {
      throw new Error("class_sections target cannot include gradeLevels or student_ids");
    }

    const invalid = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalid.length) {
      throw new Error(`Invalid classSection_id(s): ${invalid.join(", ")}`);
    }

    const sections = await ClassSection.find({
      _id: { $in: ids },
      school_id: schoolId,
      academicYear: normalizeAcademicYear(academicYear),
    }).select("_id");

    if (sections.length !== ids.length) {
      throw new Error("One or more class sections do not belong to your school or academic year");
    }

    normalized.classSection_ids = ids;
    return normalized;
  }

  if (targetType === "students") {
    const ids = [...new Set((targets.student_ids || []).map((id) => String(id)).filter(Boolean))];
    if (!ids.length) {
      throw new Error("student_ids is required for students target");
    }

    if ((targets.gradeLevels || []).length || (targets.classSection_ids || []).length) {
      throw new Error("students target cannot include gradeLevels or classSection_ids");
    }

    const invalid = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalid.length) {
      throw new Error(`Invalid student_id(s): ${invalid.join(", ")}`);
    }

    const students = await StudentProfile.find({
      _id: { $in: ids },
      school_id: schoolId,
      status: "active",
    }).select("_id");

    if (students.length !== ids.length) {
      throw new Error("One or more students do not belong to your school or are inactive");
    }

    normalized.student_ids = ids;
    return normalized;
  }

  throw new Error("Unsupported targetType");
};

export const isPlanEligibleForReminder = (feePlan, config) => {
  if (!feePlan || !config) return false;

  const pendingAmount = Number(
    feePlan.paymentSummary?.pendingAmount ?? feePlan.finalPayableAmount ?? 0
  );

  const paymentStatus = feePlan.paymentSummary?.paymentStatus || "unpaid";

  if (config.autoStopOnFullPayment && paymentStatus === "paid") {
    return false;
  }

  if (pendingAmount <= 0) {
    return false;
  }

  if (config.feeType === "academic" && Number(feePlan.totalAcademicFee || 0) <= 0) {
    return false;
  }

  if (config.feeType === "transport" && Number(feePlan.totalTransportFee || 0) <= 0) {
    return false;
  }

  return true;
};

export const resolveReminderSenderId = async ({ schoolId, triggeredBy = null }) => {
  if (triggeredBy && mongoose.Types.ObjectId.isValid(triggeredBy)) {
    return triggeredBy;
  }

  const fallbackAdmin = await User.findOne({
    school_id: schoolId,
    role: "school_admin",
    status: "active",
  }).select("_id");

  return fallbackAdmin?._id || null;
};

export const resolveReminderAudienceService = async (config) => {
  const schoolId = config.school_id;
  const academicYear = normalizeAcademicYear(config.academicYear);
  const targetType = config.targets?.targetType;

  let candidateFeePlans = [];

  if (targetType === "all_students") {
    candidateFeePlans = await StudentFeePlan.find({
      school_id: schoolId,
      academicYear,
      status: "active",
    }).populate("student_id", "student_name parent_name parent_phone parent_email status");
  }

  if (targetType === "grades") {
    const sections = await ClassSection.find({
      school_id: schoolId,
      academicYear,
      standard: { $in: config.targets.gradeLevels },
      status: "active",
    }).select("_id");

    const sectionIds = sections.map((s) => s._id);
    if (!sectionIds.length) {
      return {
        audiencePlans: [],
        totalMatched: 0,
        totalEligible: 0,
        skippedPaid: 0,
        skippedInvalid: 0,
      };
    }

    const enrollments = await StudentEnrollment.find({
      school_id: schoolId,
      academicYear,
      classSection_id: { $in: sectionIds },
      isActive: true,
    })
      .populate("student_id", "student_name parent_name parent_phone parent_email status")
      .populate("classSection_id", "standard section classCode academicYear");

    const activeEnrollments = enrollments.filter(
      (enr) => String(enr.student_id?.status || "") === "active"
    );

    const studentIds = [...new Set(activeEnrollments.map((enr) => String(enr.student_id._id)))];

    candidateFeePlans = await StudentFeePlan.find({
      school_id: schoolId,
      academicYear,
      student_id: { $in: studentIds },
      status: "active",
    }).populate("student_id", "student_name parent_name parent_phone parent_email status");
  }

  if (targetType === "class_sections") {
    const enrollments = await StudentEnrollment.find({
      school_id: schoolId,
      academicYear,
      classSection_id: { $in: config.targets.classSection_ids },
      isActive: true,
    })
      .populate("student_id", "student_name parent_name parent_phone parent_email status")
      .populate("classSection_id", "standard section classCode academicYear");

    const activeEnrollments = enrollments.filter(
      (enr) => String(enr.student_id?.status || "") === "active"
    );

    const studentIds = [...new Set(activeEnrollments.map((enr) => String(enr.student_id._id)))];

    candidateFeePlans = await StudentFeePlan.find({
      school_id: schoolId,
      academicYear,
      student_id: { $in: studentIds },
      status: "active",
    }).populate("student_id", "student_name parent_name parent_phone parent_email status");
  }

  if (targetType === "students") {
    candidateFeePlans = await StudentFeePlan.find({
      school_id: schoolId,
      academicYear,
      student_id: { $in: config.targets.student_ids },
      status: "active",
    }).populate("student_id", "student_name parent_name parent_phone parent_email status");
  }

  const audiencePlans = [];
  let skippedPaid = 0;
  let skippedInvalid = 0;

  for (const feePlan of candidateFeePlans) {
    const student = feePlan.student_id;
    const planEligible = isPlanEligibleForReminder(feePlan, config);

    if (!student || String(student.status || "") !== "active") {
      skippedInvalid += 1;
      continue;
    }

    if (!planEligible) {
      const paymentStatus = feePlan.paymentSummary?.paymentStatus || "unpaid";
      const pendingAmount = Number(
        feePlan.paymentSummary?.pendingAmount ?? feePlan.finalPayableAmount ?? 0
      );

      if (paymentStatus === "paid" || pendingAmount <= 0) {
        skippedPaid += 1;
      } else {
        skippedInvalid += 1;
      }
      continue;
    }

    audiencePlans.push({
      feePlan,
      student,
    });
  }

  return {
    audiencePlans,
    totalMatched: candidateFeePlans.length,
    totalEligible: audiencePlans.length,
    skippedPaid,
    skippedInvalid,
  };
};

export const buildReminderMessageService = ({
  config,
  feePlan,
  daysLeft = null,
}) => {
  const student = feePlan.student_id;
  const pendingAmount = Number(
    feePlan.paymentSummary?.pendingAmount ?? feePlan.finalPayableAmount ?? 0
  );
  const totalAmount = Number(feePlan.finalPayableAmount || 0);

  const dueDateText = config.feeDueDate ? formatDateShort(config.feeDueDate) : "";
  const studentName = student?.student_name || "Student";
  const feeTypeLabel = getFeeTypeLabel(config.feeType);
  const pendingAmountText = formatCurrencyINR(pendingAmount);
  const totalAmountText = formatCurrencyINR(totalAmount);
  const gradeText = config.targets?.targetType === "grades"
    ? (config.targets.gradeLevels || []).join(", ")
    : "";
  const daysLeftText = daysLeft === null || daysLeft === undefined ? "" : String(daysLeft);

  const placeholders = {
    studentName,
    pendingAmount: pendingAmountText,
    totalAmount: totalAmountText,
    dueDate: dueDateText,
    feeType: feeTypeLabel,
    feeTypeLabel,
    academicYear: config.academicYear,
    reminderName: config.reminderName,
    grade: gradeText,
    daysLeft: daysLeftText,
  };

  const templateType = config.messageConfig?.templateType || "fee_due";
  const includePendingAmount = config.messageConfig?.includePendingAmount !== false;
  const includeDueDate = config.messageConfig?.includeDueDate !== false;

  const templates = {
    fee_due: "Dear {studentName}, your {feeTypeLabel} reminder is due on {dueDate}. Pending amount: {pendingAmount}.",
    fee_overdue: "Dear {studentName}, your {feeTypeLabel} is overdue. Pending amount: {pendingAmount}. Please clear the dues immediately.",
    transport_fee: "Dear {studentName}, your transport fee is due on {dueDate}. Pending amount: {pendingAmount}.",
    partial_pending: "Dear {studentName}, a part payment has been recorded. Remaining pending amount: {pendingAmount}.",
    custom: config.messageConfig?.customMessage || "Dear {studentName}, your fee reminder is pending.",
  };

  let message = templates[templateType] || templates.fee_due;

  if (!includePendingAmount) {
    message = message.replace(/\{pendingAmount\}/g, "");
  }

  if (!includeDueDate) {
    message = message.replace(/\{dueDate\}/g, "");
  }

  message = replacePlaceholders(message, placeholders);

  const overdue = daysLeft !== null && daysLeft < 0;
  const title = overdue
    ? "🚨 Fee Overdue Alert"
    : `${feeTypeLabel} Reminder`;

  return {
    title,
    message,
    placeholders,
  };
};

export const generateReminderStage = (daysLeft) => {
  if (daysLeft === null || daysLeft === undefined) return "manual";
  if (daysLeft > 0) return `due_${daysLeft}_days`;
  if (daysLeft === 0) return "due_today";
  return "overdue";
};

export const checkFeeReminderDuplicate = async ({
  schoolId,
  feePlanId,
  configId,
  studentId,
  stage,
  dateStr,
}) => {
  const dedupeKey = `${schoolId}_${feePlanId}_${configId}_${stage}_${dateStr}`;
  const existing = await Notification.findOne({
    school_id: schoolId,
    type: "fee_reminder",
    "audience.student_ids": studentId,
    "metadata.dedupeKey": dedupeKey,
  }).select("_id");

  return !!existing;
};
