import { sendSuccess, sendError } from "../utils/response.helper.js";

import {
  createStudentService,
  updateStudentService,
  getMyStudentProfileService,
  getAllStudentsService,
  getOneStudentService,
  deleteStudentService,
  requestLinkedPasswordResetOtpService,
  verifyLinkedPasswordResetOtpService
} from "../services/student.service.js";

export const createStudent = async (req, res) => {
  try {
    const result = await createStudentService(req.user, req.body, req.file);

    return sendSuccess(res, {
      message: "Student created successfully",
      status: 201,
      user: result.user,
      studentProfile: result.studentProfile,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Create student error",
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const result = await updateStudentService(req.user, req.params.studentId, req.body);

    return sendSuccess(res, {
      message: "Student updated successfully",
      user: result.user,
      studentProfile: result.studentProfile,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Update student error",
    });
  }
};

export const getMyStudentProfile = async (req, res) => {
  try {
    const profile = await getMyStudentProfileService(req.user.id);

    return sendSuccess(res, {
      message: "Student profile fetched",
      profile,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Get my student profile error",
      status: 404,
    });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const profiles = await getAllStudentsService(req.user.school_id);

    return sendSuccess(res, {
      message: "Students fetched",
      profiles,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Get all students error",
      status: 500,
    });
  }
};

export const getOneStudent = async (req, res) => {
  try {
    const profile = await getOneStudentService(req.params.studentId, req.user.school_id);

    return sendSuccess(res, {
      message: "Student fetched",
      profile,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Get one student error",
      status: 404,
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const profile = await deleteStudentService(req.user, req.params.studentId);

    return sendSuccess(res, {
      message: "Student archived successfully",
      profile,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Delete student error",
    });
  }
};

// Password reset for student + parent, by the admin

export const requestLinkedPasswordResetOtp = async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await requestLinkedPasswordResetOtpService(req.user, studentId);

    return res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    logger.error("Error requesting linked password OTP:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const verifyLinkedPasswordResetOtp = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { otp, newPassword } = req.body;

    const result = await verifyLinkedPasswordResetOtpService(
      req.user,
      studentId,
      otp,
      newPassword
    );

    return res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (err) {
    logger.error("Error verifying linked password OTP:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};