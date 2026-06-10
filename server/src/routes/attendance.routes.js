import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole, requireVerifiedStaff } from "../middleware/school_role.middleware.js";
import { requireActiveSchool } from "../middleware/school_auth.middleware.js";
import {
  getClassAttendanceRoster,
  markSingleAttendance,
  markBulkAttendance,
  updateAttendanceRecord,
  getAttendanceSummary,
  notifyAbsentParents,
  submitAbsentReason,
  getMyAttendance,
  getStudentAttendanceHistory,
} from "../controller/attendance.controller.js";

const router = express.Router();

/**
 * All attendance routes require a valid session and an active school association.
 */
router.use(authMiddleware, requireActiveSchool, requireVerifiedStaff);

/**
 * 1) Load students of a particular class to display for marking attendance
 * Query params: classSectionId, academicYear, attendanceDate
 */
router.get(
  "/roster",
  requireRole("school_admin", "teacher"),
  getClassAttendanceRoster
);

/**
 * 2a) Mark single attendance (create or update)
 * Body: { classSection_id, academicYear, student_id, attendanceDate, status, absentReason?, source? }
 */
router.post(
  "/mark",
  requireRole("school_admin", "teacher"),
  markSingleAttendance
);

/**
 * 2b) Mark bulk attendance (create or update multiple)
 * Body: { classSection_id, academicYear, attendanceDate, records: [{ student_id, status, absentReason? }], source? }
 */
router.post(
  "/bulk-mark",
  requireRole("school_admin", "teacher"),
  markBulkAttendance
);

/**
 * 3) Edit attendance record (Admin only)
 * Params: attendanceId
 * Body: { status?, absentReason?, isLocked?, ... }
 */
router.patch(
  "/update/:attendanceId",
  requireRole("school_admin"),
  updateAttendanceRecord
);

/**
 * 4) Get attendance summary statistics
 * Query params: classSectionId, academicYear, attendanceDate
 */
router.get(
  "/summary",
  requireRole("school_admin", "teacher"),
  getAttendanceSummary
);

/**
 * 5) Trigger notifications for absent students
 * Body: { academicYear, attendanceDate, classSectionId? }
 */
router.post(
  "/notify-absent",
  requireRole("school_admin"),
  notifyAbsentParents
);

/**
 * 6) Parent or Admin submits an absent reason
 * Body: { student_id, attendanceDate, text }
 */
router.post(
  "/reason",
  requireRole("student", "school_admin"),
  submitAbsentReason
);



/**
 * 8) Student/Parent view their own/child's attendance
 * Query params: academicYear?, startDate?, endDate?, studentId? (if parent)
 */
router.get(
  "/me",
  requireRole("student"),
  getMyAttendance
);

/**
 * 9) Admin/Teacher view a specific student's attendance history
 * Params: studentId
 * Query params: academicYear?, startDate?, endDate?
 */
router.get(
  "/student/:studentId",
  requireRole("school_admin", "teacher"),
  getStudentAttendanceHistory
);

export default router;
