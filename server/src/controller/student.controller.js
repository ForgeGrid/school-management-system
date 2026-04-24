// controllers/studentProfile.controller.js
import { v2 as cloudinary } from "cloudinary";
import logger from "../utils/logger.js";
import sendEmail from "../utils/sendEmail.js";
import { uploadBufferToCloud } from "../utils/cloudinary.js";
import { User } from "../models/auth/user.model.js";
import {
  createStudentService,
  updateStudentService,
  getMyStudentProfileService,
  getAllStudentsService,
  getOneStudentService,
  deleteStudentService,
} from "../services/student.services.js";

export const createStudent = async (req, res) => {
  try {
    const result = await createStudentService(req.user, req.body);

    return res.status(201).json({
      message: "Student created successfully",
      user: result.user,
      studentProfile: result.studentProfile,
    });
  } catch (err) {
    logger.error("Create student error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const result = await updateStudentService(req.user, req.params.studentId, req.body);

    return res.status(200).json({
      message: "Student updated successfully",
      user: result.user,
      studentProfile: result.studentProfile,
    });
  } catch (err) {
    logger.error("Update student error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const getMyStudentProfile = async (req, res) => {
  try {
    const profile = await getMyStudentProfileService(req.user.id);

    return res.status(200).json({
      message: "Student profile fetched",
      profile,
    });
  } catch (err) {
    logger.error("Get my student profile error:", err);
    return res.status(404).json({ message: err.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const profiles = await getAllStudentsService(req.user.school_id);

    return res.status(200).json({
      message: "Students fetched",
      profiles,
    });
  } catch (err) {
    logger.error("Get all students error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getOneStudent = async (req, res) => {
  try {
    const profile = await getOneStudentService(req.params.studentId, req.user.school_id);

    return res.status(200).json({
      message: "Student fetched",
      profile,
    });
  } catch (err) {
    logger.error("Get one student error:", err);
    return res.status(404).json({ message: err.message });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const profile = await deleteStudentService(req.user, req.params.studentId);

    return res.status(200).json({
      message: "Student archived successfully",
      profile,
    });
  } catch (err) {
    logger.error("Delete student error:", err);
    return res.status(400).json({ message: err.message });
  }
};