import mongoose from "mongoose";
import { ClassSection } from "../models/academic/classSection.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";
import { ClassSubjectAssignment } from "../models/academic/classSubjectAssignment.model.js";


import { resolveStudentPortalContextService } from "../services/studentEnrollment.service.js";


import {
  assertAdminOnly as assertSchoolAdmin,
} from "../utils/auth.helper.js";
import {
  normalizeText as normalize,
} from "../utils/format.helper.js";
import {
  validateClassTeacher,
  generateClassCode,
} from "../utils/academic.helper.js";
import {
  getClassSectionOrThrow as getClassSectionGeneric,
} from "../utils/db.helper.js";


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
    await validateClassTeacher(StaffProfile, user.school_id, payload.classTeacher_id);
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

  const classSection = await getClassSectionGeneric(ClassSection, user.school_id, classSectionId);

  const allowed = {
    classTeacher_id: data.classTeacher_id !== undefined ? data.classTeacher_id : undefined,
    capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
    status: data.status,
    classCode: data.classCode !== undefined ? normalize(data.classCode) : undefined,
  };

  if (allowed.classTeacher_id !== undefined) {
    await validateClassTeacher(StaffProfile, user.school_id, allowed.classTeacher_id);
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

export const getMyClassIntroService = async (user, { childId = null } = {}) => {
  if (!["student", "parent"].includes(user.role)) {
    throw new Error("Only student or parent can access class intro");
  }

  const { classSection } = await resolveStudentPortalContextService(user, { childId });

  const freshClassSection = await ClassSection.findOne({
    _id: classSection._id,
    school_id: user.school_id,
  })
    .populate({
      path: "classTeacher_id",
      select: "designation qualification experienceYears profile_highlight subjects phone alternatePhone user_id",
      populate: {
        path: "user_id",
        select: "name email role profile_avatar status",
      },
    });

  if (!freshClassSection) {
    throw new Error("Class section not found");
  }

  const assignments = await ClassSubjectAssignment.find({
    school_id: user.school_id,
    status: "active",
    class_section_ids: freshClassSection._id,
  })
    .populate({
      path: "subject_id",
      select: "name code status",
    })
    .populate({
      path: "staff_id",
      select: "designation qualification experienceYears profile_highlight phone alternatePhone subjects verificationStatus employeeStatus user_id",
      populate: {
        path: "user_id",
        select: "name email role profile_avatar status",
      },
    });

  const classTeacher = freshClassSection.classTeacher_id
    ? {
        staff_profile_id: freshClassSection.classTeacher_id._id,
        user_id: freshClassSection.classTeacher_id.user_id?._id || freshClassSection.classTeacher_id.user_id,
        name: freshClassSection.classTeacher_id.user_id?.name || null,
        email: freshClassSection.classTeacher_id.user_id?.email || null,
        designation: freshClassSection.classTeacher_id.designation || null,
        qualification: freshClassSection.classTeacher_id.qualification || null,
        experienceYears: freshClassSection.classTeacher_id.experienceYears || null,
        profile_highlight: freshClassSection.classTeacher_id.profile_highlight || null,
      }
    : {
        name: "To be assigned",
        designation: null,
        qualification: null,
        experienceYears: null,
        profile_highlight: null,
      };

  const subjects = assignments
    .map((assignment) => ({
      subject: assignment.subject_id
        ? {
            id: assignment.subject_id._id,
            name: assignment.subject_id.name,
            code: assignment.subject_id.code,
          }
        : null,
      teacher: assignment.staff_id && assignment.staff_id.user_id
        ? {
            staff_profile_id: assignment.staff_id._id,
            user_id: assignment.staff_id.user_id._id,
            name: assignment.staff_id.user_id.name,
            email: assignment.staff_id.user_id.email,
            designation: assignment.staff_id.designation || null,
            qualification: assignment.staff_id.qualification || null,
            profile_highlight: assignment.staff_id.profile_highlight || null,
          }
        : {
            name: "To be assigned",
            designation: null,
            qualification: null,
            profile_highlight: null,
          },
      assignment_id: assignment._id,
      class_section_ids: assignment.class_section_ids || [],
    }))
    .sort((a, b) => String(a.subject?.name || "").localeCompare(String(b.subject?.name || "")));

  return {
    classSection: {
      id: freshClassSection._id,
      academicYear: freshClassSection.academicYear,
      standard: freshClassSection.standard,
      section: freshClassSection.section,
      classCode: freshClassSection.classCode,
    },
    classTeacher,
    subjects,
  };
};