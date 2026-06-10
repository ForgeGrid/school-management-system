import mongoose from "mongoose";
import { FeeReminder } from "../models/fees/feeReminder.model.js";
import { User } from "../models/auth/user.model.js";
import logger from "../utils/logger.js";
import {
  normalizeAcademicYear,
  normalizeOffsets,
  normalizeReminderMessageConfig,
  validateAndNormalizeReminderTargets,
  REMINDER_MODES,
  FEE_TYPES,
  resolveReminderAudienceService,
  buildReminderMessageService,
  resolveReminderSenderId,
  isPlanEligibleForReminder,
  generateReminderStage,
  checkFeeReminderDuplicate,
} from "../utils/feeReminderHelper.js";
import {
  getIstStartOfToday,
  getDaysLeft,
} from "../utils/date.helper.js";
import { sendFeeReminderNotificationService } from "./notification.service.js";

const assertReminderAdmin = (user) => {
  if (!user || user.role !== "school_admin") {
    throw new Error("Only school admin can manage fee reminders");
  }
  if (!user.school_id) {
    throw new Error("User is not associated with any school");
  }
};

const normalizeText = (value) => String(value ?? "").trim();

const normalizeReminderMode = (value) => {
  const mode = normalizeText(value || "both");
  if (!REMINDER_MODES.has(mode)) {
    throw new Error("Invalid reminderMode");
  }
  return mode;
};

const normalizeFeeType = (value) => {
  const type = normalizeText(value || "both");
  if (!FEE_TYPES.has(type)) {
    throw new Error("Invalid feeType");
  }
  return type;
};

export const processReminderConfigCampaign = async ({
  config,
  triggerMode,
  triggeredBy = null,
  today = getIstStartOfToday(),
}) => {
  if (!config || config.status !== "active") {
    return {
      configId: config?._id || null,
      configName: config?.reminderName || null,
      notificationsSent: 0,
      skipped: true,
      reason: "inactive_config",
    };
  }

  if (config.manuallyStopped) {
    return {
      configId: config._id,
      configName: config.reminderName,
      notificationsSent: 0,
      skipped: true,
      reason: "manually_stopped",
    };
  }

  if (!config.reminderEnabled) {
    return {
      configId: config._id,
      configName: config.reminderName,
      notificationsSent: 0,
      skipped: true,
      reason: "reminder_disabled",
    };
  }

  if (
    triggerMode === "manual" &&
    !["manual", "both"].includes(config.reminderMode)
  ) {
    throw new Error("This reminder config does not allow manual trigger");
  }

  if (
    triggerMode === "cron" &&
    !["cron", "both"].includes(config.reminderMode)
  ) {
    return {
      configId: config._id,
      configName: config.reminderName,
      notificationsSent: 0,
      skipped: true,
      reason: "cron_mode_not_allowed",
    };
  }

  const daysLeft = config.feeDueDate ? getDaysLeft(config.feeDueDate, today) : null;

  if (triggerMode === "cron") {
    const offsets = Array.isArray(config.reminderOffsets) && config.reminderOffsets.length
      ? config.reminderOffsets
      : [7, 3, 1, 0];

    if (daysLeft === null || !offsets.includes(daysLeft)) {
      return {
        configId: config._id,
        configName: config.reminderName,
        notificationsSent: 0,
        skipped: true,
        reason: "offset_not_matched",
        daysLeft,
      };
    }
  }

  const audience = await resolveReminderAudienceService(config);

  if (!audience.audiencePlans.length) {
    return {
      configId: config._id,
      configName: config.reminderName,
      notificationsSent: 0,
      skipped: true,
      reason: "no_eligible_fee_plans",
      ...audience,
      daysLeft,
    };
  }
  const senderId = await resolveReminderSenderId({
    schoolId: config.school_id,
    triggeredBy,
  });

  logger.info(`Campaign: Starting for "${config.reminderName}" | Targets: ${config.targets.targetType} | Audience: ${audience.audiencePlans.length} plans`);

  let notificationsSent = 0;
  const sentPlans = [];

  const dateStr = today.toISOString().split("T")[0];

  for (const item of audience.audiencePlans) {
    const feePlan = item.feePlan;

    if (!isPlanEligibleForReminder(feePlan, config)) {
      continue;
    }

    const content = buildReminderMessageService({
      config,
      feePlan,
      daysLeft,
    });

    const stage = generateReminderStage(daysLeft);

    const isDuplicate = await checkFeeReminderDuplicate({
      schoolId: config.school_id,
      feePlanId: feePlan._id,
      configId: config._id,
      studentId: feePlan.student_id?._id || feePlan.student_id,
      stage,
      dateStr,
    });

    if (isDuplicate) {
      logger.info(`Campaign: Skipping student ${feePlan.student_id?._id || feePlan.student_id} - Duplicate/Already sent today for stage ${stage}`);
      continue;
    }

    await sendFeeReminderNotificationService({
      config,
      feePlan,
      message: content.message,
      title: content.title,
      senderId,
      metadata: {
        reminderConfig_id: config._id,
        reminderStage: stage,
        reminderDate: dateStr,
        dedupeKey: `${config.school_id}_${feePlan._id}_${config._id}_${stage}_${dateStr}`,
      },
    });

    notificationsSent += 1;
    sentPlans.push({
      feePlan_id: feePlan._id,
      student_id: feePlan.student_id?._id || feePlan.student_id,
    });
  }

  if (notificationsSent > 0) {
    config.lastTriggeredAt = new Date();
    config.lastTriggeredBy = senderId || triggeredBy || null;
    config.triggerCount = Number(config.triggerCount || 0) + notificationsSent;
    await config.save();
  }

  return {
    configId: config._id,
    configName: config.reminderName,
    notificationsSent,
    daysLeft,
    sentPlans,
    senderId,
  };
};

// --------------------------------------------------
// Create FeeReminderConfig
// --------------------------------------------------
export const createFeeReminderConfigService = async (user, data = {}) => {
  assertReminderAdmin(user);

  const academicYear = normalizeAcademicYear(data.academicYear);
  const reminderName = normalizeText(data.reminderName);
  const feeType = normalizeFeeType(data.feeType);
  const reminderMode = normalizeReminderMode(data.reminderMode);
  const reminderEnabled =
    data.reminderEnabled === undefined ? true : Boolean(data.reminderEnabled);
  const autoStopOnFullPayment =
    data.autoStopOnFullPayment === undefined
      ? true
      : Boolean(data.autoStopOnFullPayment);
  const feeDueDate = data.feeDueDate ? new Date(data.feeDueDate) : null;

  if (!academicYear) throw new Error("academicYear is required");
  if (!reminderName) throw new Error("reminderName is required");
  if (!feeDueDate || Number.isNaN(feeDueDate.getTime())) {
    throw new Error("feeDueDate is required");
  }

  const existing = await FeeReminder.findOne({
    school_id: user.school_id,
    academicYear,
    reminderName,
  });

  if (existing) {
    throw new Error("A reminder config with this name already exists for this academic year");
  }

  const targets = await validateAndNormalizeReminderTargets({
    schoolId: user.school_id,
    academicYear,
    targets: data.targets || {},
  });

  const messageConfig = normalizeReminderMessageConfig(data.messageConfig || {});

  const reminderOffsets = normalizeOffsets(data.reminderOffsets || [7, 3, 1, 0]);

  return await FeeReminder.create({
    school_id: user.school_id,
    academicYear,
    reminderName,
    feeType,
    feeDueDate,
    reminderOffsets,
    reminderMode,
    reminderEnabled,
    autoStopOnFullPayment,
    targets,
    messageConfig,
    status: "active",
    manuallyStopped: false,
    stoppedAt: null,
    stoppedBy: null,
    stopReason: null,
    lastTriggeredAt: null,
    lastTriggeredBy: null,
    triggerCount: 0,
    createdBy: user.id,
    updatedBy: user.id,
  });
};

// --------------------------------------------------
// Update FeeReminderConfig
// --------------------------------------------------
export const updateFeeReminderConfigService = async (user, configId, data = {}) => {
  assertReminderAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(configId)) {
    throw new Error("Invalid reminder config id");
  }

  const config = await FeeReminder.findOne({
    _id: configId,
    school_id: user.school_id,
  });

  if (!config) {
    throw new Error("Reminder config not found");
  }

  if (data.academicYear !== undefined) {
    config.academicYear = normalizeAcademicYear(data.academicYear);
  }

  if (data.reminderName !== undefined) {
    const reminderName = normalizeText(data.reminderName);
    if (!reminderName) throw new Error("reminderName cannot be empty");

    const duplicate = await FeeReminder.findOne({
      _id: { $ne: config._id },
      school_id: user.school_id,
      academicYear: config.academicYear,
      reminderName,
    });

    if (duplicate) {
      throw new Error("A reminder config with this name already exists for this academic year");
    }

    config.reminderName = reminderName;
  }

  if (data.feeType !== undefined) {
    config.feeType = normalizeFeeType(data.feeType);
  }

  if (data.feeDueDate !== undefined) {
    const dueDate = new Date(data.feeDueDate);
    if (Number.isNaN(dueDate.getTime())) {
      throw new Error("Invalid feeDueDate");
    }
    config.feeDueDate = dueDate;
  }

  if (data.reminderOffsets !== undefined) {
    config.reminderOffsets = normalizeOffsets(data.reminderOffsets);
  }

  if (data.reminderMode !== undefined) {
    config.reminderMode = normalizeReminderMode(data.reminderMode);
  }

  if (data.reminderEnabled !== undefined) {
    config.reminderEnabled = Boolean(data.reminderEnabled);
  }

  if (data.autoStopOnFullPayment !== undefined) {
    config.autoStopOnFullPayment = Boolean(data.autoStopOnFullPayment);
  }

  if (data.targets !== undefined) {
    config.targets = await validateAndNormalizeReminderTargets({
      schoolId: user.school_id,
      academicYear: config.academicYear,
      targets: data.targets,
    });
  }

  if (data.messageConfig !== undefined) {
    config.messageConfig = normalizeReminderMessageConfig(data.messageConfig);
  }

  if (data.status !== undefined) {
    if (!["active", "inactive", "archived"].includes(data.status)) {
      throw new Error("Invalid status");
    }
    config.status = data.status;
  }

  config.updatedBy = user.id;
  return await config.save();
};

// --------------------------------------------------
// Stop / Resume FeeReminderConfig
// action: "stop" | "resume"
// --------------------------------------------------
export const stopFeeReminderService = async (user, configId, data = {}) => {
  assertReminderAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(configId)) {
    throw new Error("Invalid reminder config id");
  }

  const config = await FeeReminder.findOne({
    _id: configId,
    school_id: user.school_id,
  });

  if (!config) {
    throw new Error("Reminder config not found");
  }

  const action = normalizeText(data.action || "stop").toLowerCase();
  const reason = data.reason ? normalizeText(data.reason) : null;

  if (action === "resume") {
    config.manuallyStopped = false;
    config.stoppedAt = null;
    config.stoppedBy = null;
    config.stopReason = null;
  } else {
    config.manuallyStopped = true;
    config.stoppedAt = new Date();
    config.stoppedBy = user.id;
    config.stopReason = reason || "Manually stopped by admin";
  }

  config.updatedBy = user.id;
  return await config.save();
};

// --------------------------------------------------
// Manual trigger by configId
// --------------------------------------------------
export const triggerFeeReminderService = async (user, configId) => {
  assertReminderAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(configId)) {
    throw new Error("Invalid reminder config id");
  }

  const config = await FeeReminder.findOne({
    _id: configId,
    school_id: user.school_id,
  });

  if (!config) {
    throw new Error("Reminder config not found");
  }

  return await processReminderConfigCampaign({
    config,
    triggerMode: "manual",
    triggeredBy: user.id,
  });
};

// --------------------------------------------------
// Cron runner - scans active configs and triggers on offsets
// --------------------------------------------------
export const cronFeeReminderService = async (triggeredBy = null) => {
  const today = getIstStartOfToday();

  const configs = await FeeReminder.find({
    status: "active",
    reminderEnabled: true,
    manuallyStopped: { $ne: true },
    reminderMode: { $in: ["cron", "both"] },
    feeDueDate: { $ne: null },
  });

  const results = [];

  for (const config of configs) {
    try {
      const offsets = Array.isArray(config.reminderOffsets) && config.reminderOffsets.length
        ? config.reminderOffsets
        : [7, 3, 1, 0];

      const daysLeft = getDaysLeft(config.feeDueDate, today);

      if (!offsets.includes(daysLeft)) {
        logger.info(`Cron: Skipping config "${config.reminderName}" - DaysLeft ${daysLeft} not in offsets [${offsets}]`);
        continue;
      }

      const result = await processReminderConfigCampaign({
        config,
        triggerMode: "cron",
        triggeredBy,
        today,
      });

      results.push(result);
    } catch (err) {
      results.push({
        configId: config._id,
        configName: config.reminderName,
        error: err.message,
        notificationsSent: 0,
      });
    }
  }

  return {
    scannedConfigs: configs.length,
    results,
  };
};

const buildListFilter = (user, query = {}) => {
  const filter = {
    school_id: user.school_id,
  };

  if (query.academicYear) filter.academicYear = String(query.academicYear).trim();
  if (query.status) filter.status = String(query.status).trim();
  if (query.feeType) filter.feeType = String(query.feeType).trim();
  if (query.reminderMode) filter.reminderMode = String(query.reminderMode).trim();

  if (query.reminderEnabled !== undefined) {
    filter.reminderEnabled = query.reminderEnabled === "true" || query.reminderEnabled === true;
  }

  if (query.manuallyStopped !== undefined) {
    filter.manuallyStopped = query.manuallyStopped === "true" || query.manuallyStopped === true;
  }

  if (query.search) {
    const search = String(query.search).trim();
    if (search) {
      filter.$or = [
        { reminderName: { $regex: search, $options: "i" } },
      ];
    }
  }

  return filter;
};

// --------------------------------------------------
// List Reminder Configs
// --------------------------------------------------
export const getFeeReminderConfigsService = async (user, query = {}) => {
  assertReminderAdmin(user);

  const page = Math.max(parseInt(query.page ?? "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit ?? "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildListFilter(user, query);

  const [configs, total] = await Promise.all([
    FeeReminder.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role")
      .populate("lastTriggeredBy", "name email role")
      .lean(),
    FeeReminder.countDocuments(filter),
  ]);

  return {
    configs,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// --------------------------------------------------
// Get Single Reminder Config
// --------------------------------------------------
export const getSingleFeeReminderService = async (user, configId) => {
  assertReminderAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(configId)) {
    throw new Error("Invalid reminder config id");
  }

  const config = await FeeReminder.findOne({
    _id: configId,
    school_id: user.school_id,
  })
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role")
    .populate("lastTriggeredBy", "name email role");

  if (!config) {
    throw new Error("Reminder config not found");
  }

  return config;
};
