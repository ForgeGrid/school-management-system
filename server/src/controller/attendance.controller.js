import logger from "../utils/logger.js";
import {
  getClassAttendanceRosterService,
  markSingleAttendanceService,
  markBulkAttendanceService,
  updateAttendanceRecordService,
  getAttendanceSummaryService,
  notifyAbsentParentsService,
  submitAbsentReasonService,
  adminUpdateAbsentReasonService,
  getMyAttendanceService,
  getStudentAttendanceService,
} from "../services/attendance.service.js";

// --------------------------------------
// 1) Load roster for attendance marking
// --------------------------------------
export const getClassAttendanceRoster = async (req, res) => {
  try {
    const result = await getClassAttendanceRosterService(req.user, {
      classSectionId: req.query.classSectionId,
      academicYear: req.query.academicYear,
      attendanceDate: req.query.attendanceDate,
    });

    return res.json({
      message: "Class attendance roster fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get attendance roster error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 2a) Single attendance create/update
// --------------------------------------
export const markSingleAttendance = async (req, res) => {
  try {
    const result = await markSingleAttendanceService(req.user, req.body || {});

    return res.status(201).json({
      message: "Attendance saved successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Mark single attendance error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 2b) Bulk attendance create/update
// --------------------------------------
export const markBulkAttendance = async (req, res) => {
  try {
    const result = await markBulkAttendanceService(req.user, req.body || {});

    return res.status(201).json({
      message: "Bulk attendance saved successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Mark bulk attendance error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 3) Admin-only edit
// --------------------------------------
export const updateAttendanceRecord = async (req, res) => {
  try {
    const attendance = await updateAttendanceRecordService(
      req.user,
      req.params.attendanceId,
      req.body || {}
    );

    return res.json({
      message: "Attendance updated successfully",
      attendance,
    });
  } catch (err) {
    logger.error("Update attendance error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 4) Summary counts
// --------------------------------------
export const getAttendanceSummary = async (req, res) => {
  try {
    const result = await getAttendanceSummaryService(req.user, {
      classSectionId: req.query.classSectionId,
      academicYear: req.query.academicYear,
      attendanceDate: req.query.attendanceDate,
    });

    return res.json({
      message: "Attendance summary fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Attendance summary error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 5) Manual trigger for absent-parent notification
// --------------------------------------
export const notifyAbsentParents = async (req, res) => {
  try {
    const result = await notifyAbsentParentsService(req.user, {
      academicYear: req.body.academicYear,
      attendanceDate: req.body.attendanceDate,
      classSectionId: req.body.classSectionId || null,
    });

    return res.json({
      message: "Absent parent notifications prepared successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Notify absent parents error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 6) Parent submits absent reason
// --------------------------------------
export const submitAbsentReason = async (req, res) => {
  try {
    const attendance = await submitAbsentReasonService(req.user, req.body || {});

    return res.json({
      message: "Absent reason submitted successfully",
      attendance,
    });
  } catch (err) {
    logger.error("Submit absent reason error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 7) Admin updates absent reason
// --------------------------------------
export const adminUpdateAbsentReason = async (req, res) => {
  try {
    const attendance = await adminUpdateAbsentReasonService(req.user, {
      attendanceId: req.params.attendanceId,
      text: (req.body || {}).text,
    });

    return res.json({
      message: "Absent reason updated successfully",
      attendance,
    });
  } catch (err) {
    logger.error("Admin absent reason update error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 8) Student/Parent view their own/child's attendance
// --------------------------------------
export const getMyAttendance = async (req, res) => {
  try {
    const result = await getMyAttendanceService(req.user, {
      academicYear: req.query.academicYear,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      student_id: req.query.studentId, // for parents
    });

    return res.json({
      message: "Personal attendance fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get my attendance error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// 9) Admin/Teacher view a specific student's attendance history
// --------------------------------------
export const getStudentAttendanceHistory = async (req, res) => {
  try {
    const result = await getStudentAttendanceService(
      req.user,
      req.params.studentId,
      {
        academicYear: req.query.academicYear,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }
    );

    return res.json({
      message: "Student attendance history fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get student attendance history error:", err);
    return res.status(400).json({ message: err.message });
  }
};