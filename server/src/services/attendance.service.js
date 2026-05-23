import mongoose from "mongoose";
import { Attendance } from "../models/student/attendance.model.js";
import { ClassSection } from "../models/academic/classSection.model.js";
import { StudentProfile } from "../models/student/student.model.js";
import { StudentEnrollment } from "../models/student/studentEnrollment.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";
import { notify } from "../utils/notificationHelper.js";
import logger from "../utils/logger.js";

const ATTENDANCE_STATUSES = ["present", "absent", "late", "half_day", "excused"];
const SOURCE_TYPES = ["manual", "bulk_upload", "biometric"];
const EDIT_WINDOW_DAYS = 5;

const assertSchoolBoundUser = (user) => {
  if (!user || !user.school_id) {
    throw new Error("User is not associated with any school");
  }
};

const assertAttendanceManager = (user) => {
  assertSchoolBoundUser(user);

  if (!["school_admin", "teacher"].includes(user.role)) {
    throw new Error("Only admin or teacher can manage attendance");
  }
};

const assertAdminOnly = (user) => {
  assertSchoolBoundUser(user);

  if (user.role !== "school_admin") {
    throw new Error("Only school admin can perform this action");
  }
};

const dayBounds = (inputDate) => {
  const d = new Date(inputDate);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid attendanceDate");
  }

  const start = new Date(d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(d);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

const normalizeAttendanceDate = (inputDate) => {
  const { start } = dayBounds(inputDate);
  return start;
};

const buildEditableUntil = (attendanceDate) => {
  const d = new Date(attendanceDate);
  d.setDate(d.getDate() + EDIT_WINDOW_DAYS);
  d.setHours(23, 59, 59, 999);
  return d;
};

const normalizeOptionalReason = (absentReason, user) => {
  if (!absentReason) return null;

  if (typeof absentReason === "string") {
    const text = absentReason.trim();
    if (!text) return null;

    return {
      text,
      submittedBy: user.id,
      submittedByModel: "User",
      submittedAt: new Date(),
    };
  }

  if (typeof absentReason === "object") {
    const text = String(absentReason.text || "").trim();
    if (!text) return null;

    return {
      text,
      submittedBy: absentReason.submittedBy || user.id,
      submittedByModel: absentReason.submittedByModel || "User",
      submittedAt: absentReason.submittedAt ? new Date(absentReason.submittedAt) : new Date(),
    };
  }

  return null;
};

const assertTeacherCanAccessClass = async (user, classSection) => {
  if (user.role === "school_admin") return;

  const staffProfile = await StaffProfile.findOne({
    user_id: user.id,
    school_id: user.school_id,
  });

  if (!staffProfile) {
    throw new Error("Teacher profile not found");
  }

  if (!classSection.classTeacher_id) {
    throw new Error("This class is not assigned to a teacher");
  }

  if (String(classSection.classTeacher_id) !== String(staffProfile._id)) {
    throw new Error("You are not assigned to this class");
  }
};

const getClassSectionOrThrow = async (user, classSectionId, academicYear) => {
  if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
    throw new Error("Invalid classSection_id");
  }

  const query = {
    _id: classSectionId,
    school_id: user.school_id,
    status: "active",
  };

  if (academicYear) {
    query.academicYear = academicYear;
  }

  const classSection = await ClassSection.findOne(query);

  if (!classSection) {
    throw new Error("Class section not found");
  }

  await assertTeacherCanAccessClass(user, classSection);

  return classSection;
};

const getActiveEnrollmentsForClass = async (schoolId, academicYear, classSectionId) => {
  return StudentEnrollment.find({
    school_id: schoolId,
    academicYear,
    classSection_id: classSectionId,
    isActive: true,
  })
    .populate("student_id", "admission_no student_name parent_name parent_phone parent_email transport_required status")
    .sort({ roll_no: 1 });
};

const buildAttendanceMatch = (schoolId, classSectionId, attendanceDate) => {
  const { start, end } = dayBounds(attendanceDate);
  return {
    school_id: schoolId,
    classSection_id: classSectionId,
    attendanceDate: { $gte: start, $lte: end },
  };
};

const validateAttendanceStatus = (status) => {
  if (!ATTENDANCE_STATUSES.includes(status)) {
    throw new Error(`Invalid attendance status: ${status}`);
  }
};

const validateSource = (source) => {
  if (source && !SOURCE_TYPES.includes(source)) {
    throw new Error(`Invalid source type: ${source}`);
  }
};

const ensureStudentBelongsToClass = async ({
  schoolId,
  academicYear,
  classSectionId,
  studentId,
}) => {
  const enrollment = await StudentEnrollment.findOne({
    school_id: schoolId,
    academicYear,
    classSection_id: classSectionId,
    student_id: studentId,
    isActive: true,
  });

  if (!enrollment) {
    throw new Error("Student is not enrolled in this class");
  }

  return enrollment;
};

const mapAttendanceByStudentId = (records = []) => {
  const map = new Map();
  for (const record of records) {
    map.set(String(record.student_id), record);
  }
  return map;
};

// --------------------------------------
// 1) Load students for a class to mark attendance
// --------------------------------------
export const getClassAttendanceRosterService = async (user, { classSectionId, academicYear, attendanceDate }) => {
  assertAttendanceManager(user);

  if (!academicYear) {
    throw new Error("academicYear is required");
  }
  if (!attendanceDate) {
    throw new Error("attendanceDate is required");
  }

  const classSection = await getClassSectionOrThrow(user, classSectionId, academicYear);

  const enrollments = await getActiveEnrollmentsForClass(
    user.school_id,
    academicYear,
    classSection._id
  );

  const attendanceRecords = await Attendance.find(
    buildAttendanceMatch(user.school_id, classSection._id, attendanceDate)
  );

  const attendanceMap = mapAttendanceByStudentId(attendanceRecords);

  const students = enrollments.map((enrollment) => {
    const record = attendanceMap.get(String(enrollment.student_id._id)) || null;

    return {
      enrollment_id: enrollment._id,
      roll_no: enrollment.roll_no,
      student: enrollment.student_id,
      attendance: record,
    };
  });

  return {
    classSection,
    students,
  };
};

// --------------------------------------
// 2) Mark attendance - single upsert
// --------------------------------------
export const markSingleAttendanceService = async (user, data = {}) => {
  assertAttendanceManager(user);

  const {
    classSection_id,
    academicYear,
    student_id,
    attendanceDate,
    status,
    absentReason,
    source,
  } = data;

  if (!classSection_id) throw new Error("classSection_id is required");
  if (!academicYear) throw new Error("academicYear is required");
  if (!student_id) throw new Error("student_id is required");
  if (!attendanceDate) throw new Error("attendanceDate is required");
  if (!status) throw new Error("status is required");

  validateAttendanceStatus(status);
  validateSource(source);

  const classSection = await getClassSectionOrThrow(user, classSection_id, academicYear);
  const enrollment = await ensureStudentBelongsToClass({
    schoolId: user.school_id,
    academicYear,
    classSectionId: classSection._id,
    studentId: student_id,
  });

  const normalizedDate = normalizeAttendanceDate(attendanceDate);
  const reason = normalizeOptionalReason(absentReason, user);

  const updateDoc = {
    school_id: user.school_id,
    academicYear,
    classSection_id: classSection._id,
    student_id,
    attendanceDate: normalizedDate,
    status,
    markedBy: user.id,
    markedRole: user.role,
    markedAt: new Date(),
    editableUntil: buildEditableUntil(normalizedDate),
    isLocked: false,
    source: source || "manual",
    updatedBy: user.id,
  };

  if (reason) {
    updateDoc.absentReason = reason;
  } else if (status !== "absent" && status !== "excused") {
    updateDoc.absentReason = null;
  }

  const attendance = await Attendance.findOneAndUpdate(
    {
      school_id: user.school_id,
      student_id,
      attendanceDate: normalizedDate,
    },
    {
      $set: updateDoc,
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );

  return {
    attendance,
    enrollment,
    classSection,
  };
};

// --------------------------------------
// 2) Mark attendance - bulk upsert
// Body:
// {
//   classSection_id,
//   academicYear,
//   attendanceDate,
//   source,
//   records: [
//     { student_id, status, absentReason? },
//     ...
//   ]
// }
// --------------------------------------
export const markBulkAttendanceService = async (user, data = {}) => {
  assertAttendanceManager(user);

  const {
    classSection_id,
    academicYear,
    attendanceDate,
    records,
    source,
  } = data;

  if (!classSection_id) throw new Error("classSection_id is required");
  if (!academicYear) throw new Error("academicYear is required");
  if (!attendanceDate) throw new Error("attendanceDate is required");
  if (!Array.isArray(records) || records.length === 0) {
    throw new Error("records must be a non-empty array");
  }

  validateSource(source);

  const classSection = await getClassSectionOrThrow(user, classSection_id, academicYear);

  const seenStudents = new Set();
  for (const [index, rec] of records.entries()) {
    if (!rec?.student_id) throw new Error(`records[${index}].student_id is required`);
    if (!rec?.status) throw new Error(`records[${index}].status is required`);
    validateAttendanceStatus(rec.status);

    const key = String(rec.student_id);
    if (seenStudents.has(key)) {
      throw new Error(`Duplicate student_id in bulk payload: ${key}`);
    }
    seenStudents.add(key);
  }

  const enrollmentMap = new Map();
  const enrollmentDocs = await StudentEnrollment.find({
    school_id: user.school_id,
    academicYear,
    classSection_id: classSection._id,
    student_id: { $in: records.map((r) => r.student_id) },
    isActive: true,
  }).select("_id student_id");

  for (const enrollment of enrollmentDocs) {
    enrollmentMap.set(String(enrollment.student_id), enrollment);
  }

  for (const rec of records) {
    if (!enrollmentMap.has(String(rec.student_id))) {
      throw new Error(`Student ${rec.student_id} is not enrolled in this class`);
    }
  }

  const normalizedDate = normalizeAttendanceDate(attendanceDate);
  const commonSet = {
    school_id: user.school_id,
    academicYear,
    classSection_id: classSection._id,
    attendanceDate: normalizedDate,
    markedBy: user.id,
    markedRole: user.role,
    markedAt: new Date(),
    editableUntil: buildEditableUntil(normalizedDate),
    isLocked: false,
    source: source || "bulk_upload",
    updatedBy: user.id,
  };

  const operations = records.map((rec) => {
    const reason = normalizeOptionalReason(rec.absentReason, user);

    const setDoc = {
      ...commonSet,
      student_id: rec.student_id,
      status: rec.status,
    };

    if (reason) {
      setDoc.absentReason = reason;
    } else if (rec.status !== "absent" && rec.status !== "excused") {
      setDoc.absentReason = null;
    }

    return {
      updateOne: {
        filter: {
          school_id: user.school_id,
          student_id: rec.student_id,
          attendanceDate: normalizedDate,
        },
        update: { $set: setDoc },
        upsert: true,
      },
    };
  });

  const result = await Attendance.bulkWrite(operations, { ordered: false });

  return {
    classSection,
    matchedCount: result.matchedCount || 0,
    modifiedCount: result.modifiedCount || 0,
    upsertedCount: result.upsertedCount || 0,
  };
};

// --------------------------------------
// 3) Admin-only edit of an attendance record
// --------------------------------------
export const updateAttendanceRecordService = async (user, attendanceId, data = {}) => {
  assertAdminOnly(user);

  if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
    throw new Error("Invalid attendance id");
  }

  const attendance = await Attendance.findOne({
    _id: attendanceId,
    school_id: user.school_id,
  });

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  const allowedFields = ["status", "absentReason", "editableUntil", "isLocked", "source", "classSection_id", "academicYear"];
  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      delete data[key];
    }
  }

  if (data.status !== undefined) validateAttendanceStatus(data.status);
  if (data.source !== undefined) validateSource(data.source);

  if (data.absentReason !== undefined) {
    data.absentReason = normalizeOptionalReason(data.absentReason, user);
  }

  Object.assign(attendance, data);
  attendance.updatedBy = user.id;

  await attendance.save();
  return attendance;
};

// --------------------------------------
// 4) No deletion; attendance summary count
// --------------------------------------
export const getAttendanceSummaryService = async (user, { classSectionId, academicYear, attendanceDate }) => {
  assertAttendanceManager(user);

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSectionId is required");
  if (!attendanceDate) throw new Error("attendanceDate is required");

  const classSection = await getClassSectionOrThrow(user, classSectionId, academicYear);

  const { start, end } = dayBounds(attendanceDate);

  const summary = await Attendance.aggregate([
    {
      $match: {
        school_id: user.school_id,
        classSection_id: classSection._id,
        attendanceDate: { $gte: start, $lte: end },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    excused: 0,
  };

  for (const row of summary) {
    counts[row._id] = row.count;
  }

  const totalMarked = Object.values(counts).reduce((a, b) => a + b, 0);

  const enrolledCount = await StudentEnrollment.countDocuments({
    school_id: user.school_id,
    academicYear,
    classSection_id: classSection._id,
    isActive: true,
  });

  return {
    classSection,
    attendanceDate: start,
    totalMarked,
    enrolledCount,
    counts,
    unmarkedCount: Math.max(enrolledCount - totalMarked, 0),
  };
};

// --------------------------------------
// 5) Notify parents of absentees for a date
// This can be used by CRON or manual trigger
// --------------------------------------
export const notifyAbsentParentsService = async (user, { academicYear, attendanceDate, classSectionId = null }) => {
  assertSchoolBoundUser(user);

  if (!academicYear) throw new Error("academicYear is required");
  if (!attendanceDate) throw new Error("attendanceDate is required");

  const { start, end } = dayBounds(attendanceDate);

  const match = {
    school_id: user.school_id,
    academicYear,
    attendanceDate: { $gte: start, $lte: end },
    status: "absent",
  };

  if (classSectionId) {
    if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
      throw new Error("Invalid classSectionId");
    }
    match.classSection_id = classSectionId;
  }

  const absentees = await Attendance.find(match)
    .populate("student_id", "admission_no student_name parent_name parent_phone parent_email")
    .populate("classSection_id", "academicYear standard section classCode");

  const sentNotifications = [];

  for (const record of absentees) {
    if (!record.student_id) continue;

    const studentName = record.student_id.student_name || "Student";
    const title = "Attendance Alert: Absent";
    const message = `${studentName} was marked absent on ${start.toDateString()}. If this was unplanned, please contact the school office.`;

    const audience = {
      student_ids: [record.student_id._id],
      roles: ["school_admin"]
    };

    // Trigger in-app and potentially email/SMS notification
    await notify({
      school_id: user.school_id,
      audience,
      sender_id: user.id,
      type: "attendance_absent",
      title,
      message,
      scope: "students",
      metadata: {
        relatedModule: "attendance",
        relatedRefId: record._id,
        priority: "high"
      },
      sendEmailFlag: true, // Optionally notify parents via email if configured
      recipientEmail: record.student_id.parent_email
    });

    sentNotifications.push({
      student_id: record.student_id._id,
      student_name: studentName,
      parent_email: record.student_id.parent_email,
      status: "notified"
    });
  }

  logger.info(`Attendance Notification: Sent ${sentNotifications.length} absence alerts for school ${user.school_id} on ${start.toDateString()}`);

  return {
    count: sentNotifications.length,
    notifications: sentNotifications,
  };
};

// --------------------------------------
// 6) Parent submits absent reason
// The parent-child link check can be wired to your auth token structure.
// This function accepts several common shapes: user.student_ids, user.childIds, user.children.
// --------------------------------------
const assertStudentOrAdminAccess = async (user, studentId) => {
  if (user.role === "school_admin") return;

  if (user.role !== "student") {
    throw new Error("Only students or admins can perform this action");
  }

  const profile = await StudentProfile.findOne({
    user_id: user.id,
    school_id: user.school_id,
  });

  if (!profile || String(profile._id) !== String(studentId)) {
    throw new Error("You are not authorized for this student");
  }
};

export const submitAbsentReasonService = async (user, { attendanceId, student_id, attendanceDate, text }) => {
  assertSchoolBoundUser(user);

  if (!text || !String(text).trim()) throw new Error("Reason text is required");

  let attendance;
  if (attendanceId) {
    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      throw new Error("Invalid attendance id");
    }
    attendance = await Attendance.findOne({
      _id: attendanceId,
      school_id: user.school_id,
    });
  } else {
    if (!student_id) throw new Error("student_id is required");
    if (!attendanceDate) throw new Error("attendanceDate is required");
    const { start, end } = dayBounds(attendanceDate);
    attendance = await Attendance.findOne({
      school_id: user.school_id,
      student_id,
      attendanceDate: { $gte: start, $lte: end },
    });
  }

  if (!attendance) {
    throw new Error("Attendance record not found");
  }

  // Access control: Admin can update any, Student can only update their own
  if (user.role !== "school_admin") {
    await assertStudentOrAdminAccess(user, attendance.student_id);
  }

  if (attendance.status !== "absent") {
    throw new Error("Student was not absent on this date");
  }

  attendance.absentReason = {
    text: String(text).trim(),
    submittedBy: user.id,
    submittedByModel: "User",
    submittedAt: new Date(),
  };

  attendance.updatedBy = user.id;
  await attendance.save();

  return attendance;
};

// --------------------------------------
// 7) Student/Parent views their own/child's attendance
// --------------------------------------
export const getMyAttendanceService = async (user, filters = {}) => {
  assertSchoolBoundUser(user);

  let studentId;
  if (user.role === "student") {
    const profile = await StudentProfile.findOne({
      user_id: user.id,
      school_id: user.school_id,
    });
    if (!profile) {
      throw new Error("Student profile not found");
    }
    studentId = profile._id;
  } else {
    throw new Error("Only students or admins can access this service");
  }

  const { academicYear, startDate, endDate } = filters;
  const query = {
    school_id: user.school_id,
    student_id: studentId,
  };

  if (academicYear) query.academicYear = academicYear;
  if (startDate || endDate) {
    query.attendanceDate = {};
    if (startDate) query.attendanceDate.$gte = normalizeAttendanceDate(startDate);
    if (endDate) {
      const { end } = dayBounds(endDate);
      query.attendanceDate.$lte = end;
    }
  }

  const records = await Attendance.find(query)
    .populate("classSection_id", "standard section academicYear")
    .sort({ attendanceDate: -1 });

  return {
    studentId,
    records,
  };
};

// --------------------------------------
// 9) Admin/Teacher views a specific student's attendance history
// --------------------------------------
export const getStudentAttendanceService = async (user, studentId, filters = {}) => {
  assertAttendanceManager(user);

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    throw new Error("Invalid studentId");
  }

  const { academicYear, startDate, endDate } = filters;
  const query = {
    school_id: user.school_id,
    student_id: studentId,
  };

  if (academicYear) query.academicYear = academicYear;
  if (startDate || endDate) {
    query.attendanceDate = {};
    if (startDate) query.attendanceDate.$gte = normalizeAttendanceDate(startDate);
    if (endDate) {
      const { end } = dayBounds(endDate);
      query.attendanceDate.$lte = end;
    }
  }

  const records = await Attendance.find(query)
    .populate("classSection_id", "standard section academicYear")
    .sort({ attendanceDate: -1 });

  return {
    studentId,
    records,
  };
};