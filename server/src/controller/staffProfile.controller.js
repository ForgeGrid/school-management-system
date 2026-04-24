// controllers/staffProfile.controller.js

import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

import logger from "../utils/logger.js";
import sendEmail from "../utils/sendEmail.js";
import { uploadBufferToCloud } from "../utils/cloudinary.js";

import { User } from "../models/auth/user.model.js";
import School from "../models/school_admin/school.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";

import {
  createStaffProfileService,
  updateStaffProfileService,
  getMyProfileService,
  getAllTeachersService,
  getOneTeacherService,
  approveStaffService,
  rejectStaffService,
} from "../services/staffProfile.service.js";


// --------------------------------------
// Create profile
// --------------------------------------
export const createProfile = async (req, res) => {
  try {
    const profile = await createStaffProfileService(req.user, req.body);

    return res.status(201).json({
      message: "Profile created successfully",
      profile,
    });
  } catch (err) {
    logger.error("Create profile error:", err);
    return res.status(400).json({ message: err.message });
  }
};


// --------------------------------------
// Update profile
// --------------------------------------
export const updateProfile = async (req, res) => {
  try {
    const { name, ...profileData } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      user.name = name;
      await user.save();
    }

    const profile = await updateStaffProfileService(req.user, profileData);

    return res.json({
      message: "Profile updated successfully",
      user: user.toJSON(),
      profile,
    });
  } catch (err) {
    logger.error("Update profile error:", err);
    return res.status(400).json({ message: err.message });
  }
};


// --------------------------------------
// Get my profile
// --------------------------------------
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getMyProfileService(req.user.id);
    return res.json({ profile });
  } catch (err) {
    logger.error("Get my profile error:", err);
    return res.status(404).json({ message: err.message });
  }
};


// --------------------------------------
// Get all teachers
// --------------------------------------
export const getAllTeachers = async (req, res) => {
  try {
    const profiles = await getAllTeachersService(req.user.school_id);
    return res.json({ profiles });
  } catch (err) {
    logger.error("Get all teachers error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


// --------------------------------------
// Get one teacher
// --------------------------------------
export const getOneTeacher = async (req, res) => {
  try {
    const profile = await getOneTeacherService(
      req.params.profileId,
      req.user.school_id
    );

    return res.json({ profile });
  } catch (err) {
    logger.error("Get one teacher error:", err);
    return res.status(404).json({ message: err.message });
  }
};


// --------------------------------------
// Approve teacher/staff
// --------------------------------------
export const approveStaff = async (req, res) => {
  try {
    const profile = await approveStaffService(req.params.profileId, req.user);

    return res.json({
      message: "Staff approved successfully",
      profile,
    });
  } catch (err) {
    logger.error("Approve staff error:", err);
    return res.status(400).json({ message: err.message });
  }
};


// --------------------------------------
// Reject teacher/staff
// --------------------------------------
export const rejectStaff = async (req, res) => {
  try {
    const profile = await rejectStaffService(
      req.params.profileId,
      req.body.reason,
      req.user
    );

    return res.json({
      message: "Staff rejected",
      profile,
    });
  } catch (err) {
    logger.error("Reject staff error:", err);
    return res.status(400).json({ message: err.message });
  }
};