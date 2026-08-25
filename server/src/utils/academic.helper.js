import mongoose from "mongoose";
import { normalizeTime, timeToMinutes } from "./date.helper.js";

/**
 * academic.helper.js
 * 
 * Domain-specific logic for academic modules.
 */

/**
 * Normalizes period number.
 */
export const normalizePeriodNo = (value) => {
  const period = Number.parseInt(value, 10);
  if (!Number.isInteger(period) || period < 1) {
    throw new Error("period_no must be a positive integer");
  }
  return period;
};

/**
 * Checks if a staff member is eligible to handle a specific subject.
 */
export const staffCanHandleSubject = (staffProfile, subject) => {
  const capabilitySet = new Set(
    (Array.isArray(staffProfile.subjects) ? staffProfile.subjects : [])
      .map((s) => String(s).trim().toLowerCase())
      .filter(Boolean)
  );

  return (
    capabilitySet.has(String(subject.code).toLowerCase()) ||
    capabilitySet.has(String(subject.name || "").trim().toLowerCase().replace(/\s+/g, "_"))
  );
};

/**
 * Generates a class code from standard and section.
 */
export const generateClassCode = (standard, section) => {
  const std = String(standard || "").trim();
  const sec = String(section || "").trim().toUpperCase();

  const match = std.match(/^grade\s+(.+)$/i);
  const cleanStd = match ? `G${match[1].trim()}` : std;

  const safeStd = cleanStd.replace(/[^a-zA-Z0-9-]/g, "");
  return `${safeStd}-${sec}`;
};

/**
 * Derives previous academic year from current one (e.g., "2024-25" -> "2023-24").
 */
export const derivePreviousAcademicYear = (academicYear) => {
  const parts = String(academicYear || "").split("-");
  if (parts.length !== 2) return null;

  const start = Number.parseInt(parts[0], 10);
  const end = Number.parseInt(parts[1], 10);

  if (Number.isNaN(start) || Number.isNaN(end)) return null;

  return `${start - 1}-${end - 1}`;
};

/**
 * assertTeacherCanAccessClass - Validates if a teacher has permission to manage attendance for a class.
 */
export const assertTeacherCanAccessClass = async (StaffProfileModel, user, classSection) => {
  if (user.role === "school_admin") return;

  if (user.role === "teacher") {
    const staff = await StaffProfileModel.findOne({
      user_id: user.id,
      school_id: user.school_id,
    });

    if (!staff) {
      throw new Error("Staff profile not found");
    }

    const isClassTeacher = classSection.classTeacher_id && String(classSection.classTeacher_id) === String(staff._id);

    if (!isClassTeacher) {
      throw new Error("You are not authorized to manage attendance for this class");
    }
    return;
  }

  throw new Error("Unauthorized access");
};

/**
 * buildEditableUntil - Standard window for editing academic records (e.g. attendance).
 */
export const buildEditableUntil = (date, windowDays = 5) => {
  const d = new Date(date);
  d.setDate(d.getDate() + windowDays);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * validateClassTeacher - Validates if a staff member exists and is eligible to be a class teacher.
 */
export const validateClassTeacher = async (StaffProfileModel, schoolId, staffId) => {
  if (!mongoose.Types.ObjectId.isValid(staffId)) {
    throw new Error("Invalid staff_id for class teacher");
  }

  const staff = await StaffProfileModel.findOne({
    _id: staffId,
    school_id: schoolId,
    employeeStatus: "employed",
  });

  if (!staff) {
    throw new Error("Staff member not found or not eligible to be a class teacher");
  }

  return staff;
};

/**
 * getNumericStandard - Converts standard string (e.g. "Grade 5", "UKG") to a number for comparison.
 */
export const getNumericStandard = (standard) => {
  const std = String(standard || "").trim().toLowerCase();

  const match = std.match(/grade\s+(\d+)/);
  if (match) return Number(match[1]);

  if (std === "ukg") return 0;
  if (std === "lkg") return -1;
  if (std === "nursery") return -2;

  return null;
};

/**
 * buildGradeLabel - Creates a human-readable grade label (e.g. "Grade 5 (B)").
 */
export const buildGradeLabel = (classSection) => {
  if (!classSection) return "";
  const std = String(classSection.standard || "").trim();
  const sec = String(classSection.section || "").trim();
  return sec ? `${std} (${sec})` : std;
};

/**
 * formatUserResponse - Formats a user for a consistent response object.
 */
export const formatUserResponse = (user) => {
  if (!user) return null;
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

/**
 * formatStaffResponse - Formats a staff profile for a consistent response object.
 */
export const formatStaffResponse = (staff) => {
  if (!staff) return null;
  const user = staff.user_id ? formatUserResponse(staff.user_id) : null;
  return {
    id: staff._id,
    user,
    designation: staff.designation,
    employeeId: staff.employeeId,
    subjects: staff.subjects || [],
    profile_highlight: staff.profile_highlight || "",
  };
};

/**
 * formatSectionResponse - Formats a class section for a consistent response object.
 */
export const formatSectionResponse = (classSection) => {
  if (!classSection) return null;
  return {
    _id: classSection._id,
    standard: classSection.standard,
    section: classSection.section,
    classCode: classSection.classCode,
    label: buildGradeLabel(classSection),
  };
};

export const assertAttendanceEditable = (
  attendance,
  user,
  { allowAdminOverride = false } = {}
) => {
  // Admin override bypasses both checks
  if (user.role === "school_admin" && allowAdminOverride) {
    return;
  }

  // Explicit admin lock (independent of date window)
  if (attendance.isLocked) {
    throw new Error(
      "Attendance record is locked. Contact the administrator."
    );
  }

  // 5-day edit window expired
  if (
    attendance.editableUntil &&
    attendance.editableUntil < new Date()
  ) {
    throw new Error(
      "Attendance edit window has expired."
    );
  }
};

/**
 * Formats a student enrollment record for a consistent response matching the UI representation.
 */
export const formatEnrollmentResponse = (enrollment) => {
  if (!enrollment) return null;

  const student = enrollment.student_id || {};
  const userProfile = student.user_id || {};
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  let formattedDob = null;
  if (student.dob) {
    const date = new Date(student.dob);
    if (!Number.isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, "0");
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      formattedDob = `${day} ${month} ${year}`;
    }
  }

  const formattedRollNo = String(enrollment.roll_no || "").padStart(2, "0");
  const formattedGender = student.gender
    ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1).toLowerCase()
    : null;
  const formattedStatus = student.status
    ? student.status.charAt(0).toUpperCase() + student.status.slice(1).toLowerCase()
    : "Active";

  return {
    _id: enrollment._id,
    roll_no: formattedRollNo,
    enrollmentType: enrollment.enrollmentType,
    isActive: enrollment.isActive,
    student_id: {
      _id: student._id,
      admission_no: student.admission_no,
      student_name: student.student_name,
      gender: formattedGender,
      dob: formattedDob,
      transport_required: student.transport_required,
      status: formattedStatus,
      user_id: {
        _id: userProfile._id,
        profile_avatar: userProfile.profile_avatar?.secure_url || "",
      },
    },
  };
};

const safeText = (value, fallback = null) => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const safeNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

/**
 * Only two dashboard states for now:
 * - marked
 * - not_marked
 */
export const buildAttendanceDashboardStatus = ({
  totalMarked = 0,
  enrolledCount = 0,
} = {}) => {
  const markedCount = safeNumber(totalMarked, 0);
  const totalStudents = safeNumber(enrolledCount, 0);
  const unmarkedCount = Math.max(totalStudents - markedCount, 0);

  const status = unmarkedCount === 0 && totalStudents > 0 ? "marked" : "not_marked";

  return {
    status,
    isMarked: status === "marked",
    markedCount,
    unmarkedCount,
    totalStudents,
  };
};

export const formatAttendanceCounts = (summary = {}) => {
  const counts = summary.counts || {};

  return {
    present: safeNumber(counts.present ?? summary.present, 0),
    absent: safeNumber(counts.absent ?? summary.absent, 0),
    late: safeNumber(counts.late ?? summary.late, 0),
    half_day: safeNumber(counts.half_day ?? summary.half_day ?? summary.halfDay, 0),
    excused: safeNumber(counts.excused ?? summary.excused, 0),
  };
};

/**
 * Build one row for the attendance dashboard table.
 * Works for both admin and teacher dashboards.
 */
export const formatAttendanceDashboardRow = ({
  classSection,
  attendanceSummary = null,
  classTeacher = null,
  role = "school_admin",
  subject = null,
  attendanceDate = null,
} = {}) => {
  if (!classSection) return null;

  const classId = classSection._id || classSection.id || null;
  const enrolledCount = safeNumber(attendanceSummary?.enrolledCount, 0);
  const totalMarked = safeNumber(attendanceSummary?.totalMarked, 0);

  const statusInfo = buildAttendanceDashboardStatus({
    totalMarked,
    enrolledCount,
  });

  const counts = formatAttendanceCounts(attendanceSummary || {});
  const attendancePercent =
    statusInfo.totalStudents > 0
      ? Math.round((statusInfo.markedCount / statusInfo.totalStudents) * 1000) / 10
      : 0;

  return {
    id: classId,
    academicYear: classSection.academicYear || null,
    standard: classSection.standard || null,
    section: classSection.section || null,
    classCode: classSection.classCode || null,
    classLabel: `${safeText(classSection.standard, "")}${classSection.section ? ` (${classSection.section})` : ""}`.trim(),
    status: classSection.status || null,

    classTeacher: classTeacher
      ? {
        staff_profile_id: classTeacher.staff_profile_id || classTeacher._id || null,
        user_id: classTeacher.user_id || null,
        name: classTeacher.name || null,
        email: classTeacher.email || null,
        designation: classTeacher.designation || null,
        avatar: classTeacher.avatar || classTeacher.profile_avatar || null,
      }
      : null,

    subject: subject
      ? {
        id: subject.id || subject._id || null,
        name: subject.name || null,
        code: subject.code || null,
      }
      : null,

    counts: {
      enrolledCount: statusInfo.totalStudents,
      markedCount: statusInfo.markedCount,
      unmarkedCount: statusInfo.unmarkedCount,
      present: counts.present,
      absent: counts.absent,
      late: counts.late,
      half_day: counts.half_day,
      excused: counts.excused,
    },

    attendance: {
      attendanceDate: attendanceSummary?.attendanceDate || attendanceDate || null,
      status: statusInfo.status,
      isMarked: statusInfo.isMarked,
      percentage: attendancePercent,
    },

    role, // "school_admin" | "teacher"
  };
};

/**
 * Teacher dashboard returns subject-assigned classes in a flattened form.
 * This helper merges duplicates so the same class shows once,
 * with subject chips inside the row.
 */
export const mergeAttendanceDashboardRowsByClass = (rows = []) => {
  const merged = new Map();

  for (const row of rows) {
    if (!row) continue;

    const id = String(row.id || row._id || "");
    if (!id) continue;

    if (!merged.has(id)) {
      merged.set(id, {
        ...row,
        subjectChips: [],
        subjects: [],
      });
    }

    const target = merged.get(id);

    const subjectName = row.subject?.name || row.subject?.code || null;
    if (subjectName && !target.subjectChips.includes(subjectName)) {
      target.subjectChips.push(subjectName);
    }

    if (row.subject && !target.subjects.some((s) => String(s.id || s._id) === String(row.subject.id || row.subject._id))) {
      target.subjects.push(row.subject);
    }

    if (!target.classTeacher && row.classTeacher) {
      target.classTeacher = row.classTeacher;
    }

    // keep the strongest status data if one row has it
    if (row.attendance?.status) {
      target.attendance = row.attendance;
    }
    if (row.counts) {
      target.counts = row.counts;
    }
  }

  return Array.from(merged.values());
};

/**
 * Group rows by grade/standard for accordion UIs.
 */
export const groupAttendanceDashboardRowsByGrade = (rows = []) => {
  const grouped = new Map();

  for (const row of rows) {
    if (!row) continue;

    const grade = safeText(row.standard, "Unknown Grade");
    if (!grouped.has(grade)) {
      grouped.set(grade, {
        grade,
        totalSections: 0,
        markedSections: 0,
        notMarkedSections: 0,
        rows: [],
      });
    }

    const group = grouped.get(grade);
    group.totalSections += 1;

    if (row.attendance?.status === "marked") {
      group.markedSections += 1;
    } else {
      group.notMarkedSections += 1;
    }

    group.rows.push(row);
  }

  return Array.from(grouped.values());
};

/**
 * Build a compact payload that the dashboard page can render directly.
 */
export const buildAttendanceDashboardPayload = ({
  rows = [],
  academicYear = null,
  attendanceDate = null,
  totalClasses = 0,
} = {}) => {
  const mergedRows = mergeAttendanceDashboardRowsByClass(rows);
  const groupedRows = groupAttendanceDashboardRowsByGrade(mergedRows);

  const markedClasses = mergedRows.filter((row) => row?.attendance?.status === "marked").length;
  const notMarkedClasses = mergedRows.filter((row) => row?.attendance?.status === "not_marked").length;

  return {
    academicYear,
    attendanceDate,
    totals: {
      classes: totalClasses || mergedRows.length,
      markedClasses,
      notMarkedClasses,
    },
    groupedRows,
    rows: mergedRows,
  };
};

// -------------------------------------------------------
// Period Template helpers (moved from timetable.service.js)
// -------------------------------------------------------

export const PERIOD_TEMPLATE_TYPES = ["CLASS", "BREAK", "LUNCH", "ASSEMBLY", "PET", "ECA", "FREE"];

export const DAY_ALIASES = {
  monday: "MON",
  mon: "MON",
  tuesday: "TUE",
  tue: "TUE",
  wednesday: "WED",
  wed: "WED",
  thursday: "THU",
  thu: "THU",
  friday: "FRI",
  fri: "FRI",
  saturday: "SAT",
  sat: "SAT",
  sunday: "SUN",
  sun: "SUN",
};

export const normalizeTemplateDay = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  const mapped = DAY_ALIASES[raw];
  if (!mapped) {
    throw new Error(`Invalid template day: ${value}`);
  }
  return mapped;
};

export const normalizeTemplateDays = (days = []) => {
  if (!Array.isArray(days) || days.length === 0) {
    throw new Error("appliesToDays must contain at least one day");
  }

  const unique = [];
  const seen = new Set();

  for (const day of days) {
    const normalized = normalizeTemplateDay(day);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      unique.push(normalized);
    }
  }

  return unique;
};

export const normalizeTemplateSlots = (slots = []) => {
  if (!Array.isArray(slots) || slots.length === 0) {
    throw new Error("slots must be a non-empty array");
  }

  const seenPeriodNos = new Set();

  const normalized = slots.map((slot, index) => {
    const periodNoRaw = slot.periodNo ?? slot.period_no;
    const periodNo = Number(periodNoRaw);

    if (!Number.isInteger(periodNo) || periodNo < 1) {
      throw new Error(`slots[${index}].periodNo must be a positive integer`);
    }

    if (seenPeriodNos.has(periodNo)) {
      throw new Error(`Duplicate periodNo in template: ${periodNo}`);
    }
    seenPeriodNos.add(periodNo);

    const label = String(slot.label ?? slot.period_label ?? "").trim() || `Period ${periodNo}`;
    const startTime = normalizeTime(slot.startTime ?? slot.start_time);
    const endTime = normalizeTime(slot.endTime ?? slot.end_time);
    const type = String(slot.type ?? "CLASS").trim().toUpperCase();

    if (!PERIOD_TEMPLATE_TYPES.includes(type)) {
      throw new Error(`Invalid template slot type: ${type}`);
    }

    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      throw new Error(`slots[${index}].endTime must be after startTime`);
    }

    return { periodNo, label, startTime, endTime, type };
  });

  normalized.sort((a, b) => a.periodNo - b.periodNo);

  for (let i = 1; i < normalized.length; i++) {
    const prev = normalized[i - 1];
    const curr = normalized[i];
    if (timeToMinutes(curr.startTime) < timeToMinutes(prev.endTime)) {
      throw new Error("Template slots must not overlap in time");
    }
  }

  return normalized;
};

export const formatPeriodTemplateSummary = (template) => {
  if (!template) return null;
  const t = template.toObject ? template.toObject() : template;

  return {
    id: t._id,
    schoolId: t.schoolId,
    name: t.name,
    appliesToDays: t.appliesToDays,
    isDefault: t.isDefault,
    isActive: t.isActive,
    slotsCount: Array.isArray(t.slots) ? t.slots.length : 0,
    createdBy: t.createdBy,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
};

export const formatPeriodTemplateDetail = (template) => {
  if (!template) return null;
  const t = template.toObject ? template.toObject() : template;

  return {
    ...formatPeriodTemplateSummary(t),
    slots: Array.isArray(t.slots)
      ? t.slots.map((slot) => ({
        periodNo: slot.periodNo,
        label: slot.label,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type,
      }))
      : [],
  };
};