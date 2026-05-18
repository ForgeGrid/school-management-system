import mongoose from "mongoose";
import { ClassSection } from "../models/academic/classSection.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";

const validateClassTeacher = async (schoolId, teacherId) => {
  if (!teacherId) return;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new Error("Invalid classTeacher_id format");
  }

  const teacher = await StaffProfile.findOne({
    _id: teacherId,
    school_id: schoolId,
  });

  if (!teacher) {
    throw new Error("Class teacher profile not found in your school");
  }
};

const assertSchoolAdmin = (user) => {
  if (!user || user.role !== "school_admin") {
    throw new Error("Only school admin can manage class sections");
  }
  if (!user.school_id) {
    throw new Error("User is not associated with any school");
  }
};

const normalize = (value) => String(value || "").trim();

const generateClassCode = (standard, section) => {
  const std = normalize(standard);
  const sec = normalize(section).toUpperCase();

  const match = std.match(/^grade\s+(.+)$/i);
  const cleanStd = match ? `G${match[1].trim()}` : std;

  const safeStd = cleanStd.replace(/[^a-zA-Z0-9-]/g, "");
  return `${safeStd}-${sec}`;
};

export const createClassSectionService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const standard = normalize(data.standard);
  const section = normalize(data.section).toUpperCase();

  let classCode = data.classCode ? normalize(data.classCode) : "";
  if (!classCode && standard && section) {
    classCode = generateClassCode(standard, section);
  }

  const payload = {
    school_id: user.school_id,
    academicYear: normalize(data.academicYear),
    standard,
    section,
    classCode,
    classTeacher_id: data.classTeacher_id || null,
    capacity: Number(data.capacity),
    currentStrength: Number(data.currentStrength || 0),
    status: data.status && ["active", "inactive"].includes(data.status) ? data.status : "active",
    createdBy: user.id,
  };

  if (payload.classTeacher_id) {
    await validateClassTeacher(user.school_id, payload.classTeacher_id);
  }

  if (!payload.academicYear) throw new Error("academicYear is required");
  if (!payload.standard) throw new Error("standard is required");
  if (!payload.section) throw new Error("section is required");
  if (!payload.classCode) throw new Error("classCode is required");
  if (Number.isNaN(payload.capacity)) throw new Error("capacity is required");
  if (payload.currentStrength < 0) throw new Error("currentStrength cannot be negative");
  if (payload.currentStrength > payload.capacity) {
    throw new Error("currentStrength cannot exceed capacity");
  }

  const exists = await ClassSection.findOne({
    school_id: user.school_id,
    academicYear: payload.academicYear,
    standard: payload.standard,
    section: payload.section,
  });

  if (exists) {
    throw new Error("Class section already exists for this academic year");
  }

  return await ClassSection.create(payload);
};

export const updateClassSectionService = async (user, classSectionId, data = {}) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
    throw new Error("Invalid classSection id");
  }

  const classSection = await ClassSection.findOne({
    _id: classSectionId,
    school_id: user.school_id,
  });

  if (!classSection) {
    throw new Error("Class section not found");
  }

  const allowed = {
    classTeacher_id: data.classTeacher_id !== undefined ? data.classTeacher_id : undefined,
    capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
    status: data.status,
    classCode: data.classCode !== undefined ? normalize(data.classCode) : undefined,
  };

  if (allowed.classTeacher_id !== undefined) {
    await validateClassTeacher(user.school_id, allowed.classTeacher_id);
  }

  if (allowed.capacity !== undefined && Number.isNaN(allowed.capacity)) {
    throw new Error("Invalid capacity");
  }

  if (allowed.capacity !== undefined && allowed.capacity < classSection.currentStrength) {
    throw new Error("Capacity cannot be less than current strength");
  }

  if (allowed.status !== undefined && !["active", "inactive"].includes(allowed.status)) {
    throw new Error("Invalid class section status");
  }

  if (allowed.classCode !== undefined && !allowed.classCode) {
    throw new Error("classCode cannot be empty");
  }

  Object.entries(allowed).forEach(([key, value]) => {
    if (value !== undefined) classSection[key] = value;
  });

  classSection.updatedBy = user.id;
  return await classSection.save();
};

export const getClassSectionsService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const filter = {
    school_id: user.school_id,
  };

  if (query.academicYear) filter.academicYear = normalize(query.academicYear);
  if (query.standard) filter.standard = normalize(query.standard);
  if (query.status && ["active", "inactive"].includes(query.status)) filter.status = query.status;

  const items = await ClassSection.find(filter)
    .sort({ academicYear: -1, standard: 1, section: 1 })
    .populate("classTeacher_id", "name email");

  return items;
};

export const getOneClassSectionService = async (user, classSectionId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
    throw new Error("Invalid classSection id");
  }

  const classSection = await ClassSection.findOne({
    _id: classSectionId,
    school_id: user.school_id,
  }).populate("classTeacher_id", "name email");

  if (!classSection) {
    throw new Error("Class section not found");
  }

  return classSection;
};