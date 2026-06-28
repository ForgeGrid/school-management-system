import mongoose from "mongoose";
import { ClassSection } from "../models/academic/classSection.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";
import { ClassSubjectAssignment } from "../models/academic/classSubjectAssignment.model.js";
import { StudentEnrollment } from "../models/student/studentEnrollment.model.js";
import { Attendance } from "../models/student/attendance.model.js";
import { Timetable } from "../models/academic/timetable.model.js";

import { resolveStudentPortalContextService } from "../services/studentEnrollment.service.js";

import {
  assertAdminOnly as assertSchoolAdmin,
  assertSchoolBoundUser,
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
import {
  dayBounds,
} from "../utils/date.helper.js";

const ATTENDANCE_STATUSES = ["present", "absent", "late", "half_day", "excused"];


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
    standard: data.standard !== undefined ? normalize(data.standard) : undefined,
    section: data.section !== undefined ? normalize(data.section).toUpperCase() : undefined,
    classTeacher_id: data.classTeacher_id !== undefined ? data.classTeacher_id : undefined,
    capacity: data.capacity !== undefined ? Number(data.capacity) : undefined,
    status: data.status,
    classCode: data.classCode !== undefined ? normalize(data.classCode) : undefined,
  };

  if (allowed.standard !== undefined || allowed.section !== undefined) {
    const newStandard = allowed.standard !== undefined ? allowed.standard : classSection.standard;
    const newSection = allowed.section !== undefined ? allowed.section : classSection.section;

    if (!newStandard) throw new Error("standard cannot be empty");
    if (!newSection) throw new Error("section cannot be empty");

    const exists = await ClassSection.findOne({
      _id: { $ne: classSection._id },
      school_id: user.school_id,
      academicYear: classSection.academicYear,
      standard: newStandard,
      section: newSection,
    });

    if (exists) {
      throw new Error("Another class section already exists for this standard and section in this academic year");
    }
  }

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

  if (query.search) {
    const searchRegex = new RegExp(normalize(query.search), "i");
    filter.$or = [
      { standard: searchRegex },
      { section: searchRegex },
      { classCode: searchRegex },
    ];
  }

  // 2) Pagination & Fetch
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, parseInt(query.limit) || 20);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    ClassSection.find(filter)
      .sort({ academicYear: -1, standard: 1, section: 1 })
      .populate({
        path: "classTeacher_id",
        select: "designation qualification profile_highlight user_id",
        populate: {
          path: "user_id",
          select: "name email profile_avatar",
        },
      })
      .populate("createdBy", "name email role")
      .skip(skip)
      .limit(limit),
    ClassSection.countDocuments(filter),
  ]);

  // 3) Group by "standard" (Grade)
  const groupedData = new Map();

  items.forEach((item) => {
    const grade = item.standard;
    if (!groupedData.has(grade)) {
      groupedData.set(grade, {
        grade,
        totalSections: 0,
        activeSections: 0,
        sections: [],
      });
    }

    const group = groupedData.get(grade);
    group.totalSections += 1;
    if (item.status === "active") {
      group.activeSections += 1;
    }

    const classTeacher = item.classTeacher_id;
    const teacherUser = classTeacher?.user_id;

    group.sections.push({
      id: item._id,
      academicYear: item.academicYear,
      standard: item.standard,
      section: item.section,
      classCode: item.classCode,
      status: item.status,
      capacity: item.capacity,
      currentStrength: item.currentStrength,
      classTeacher: classTeacher
        ? {
          staff_profile_id: classTeacher._id,
          user_id: teacherUser?._id,
          name: teacherUser?.name,
          email: teacherUser?.email,
          designation: classTeacher.designation,
          profile_avatar: teacherUser?.profile_avatar,
        }
        : null,
      createdBy: item.createdBy
        ? {
          id: item.createdBy._id,
          name: item.createdBy.name,
          role: item.createdBy.role,
        }
        : null,
      createdAt: item.createdAt,
    });
  });

  return {
    items: Array.from(groupedData.values()),
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
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

// ============================================================
// CLASS SECTION HUB
// GET /class-sections/:classSectionId/hub
//
// Compact, role-aware summary payload for the Class Section
// Hub page. Returns header info, class teacher summary, and
// lightweight counts only — full lists (roster, assignments,
// timetable slots, attendance roster) live on separate
// lazy-loaded endpoints.
// ============================================================

/**
 * Determines how the requesting user relates to this class section
 * and throws a 403-style error if they have no relationship at all.
 *
 * Returns one of: "admin" | "class_teacher" | "subject_teacher"
 */
const resolveClassSectionAccessRole = async (user, classSection) => {
  if (user.role === "school_admin") {
    return "school_admin";
  }

  if (user.role !== "teacher") {
    const err = new Error("You are not authorized to access this class section");
    err.statusCode = 403;
    throw err;
  }

  const staff = await StaffProfile.findOne({
    user_id: user.id,
    school_id: user.school_id,
  });

  if (!staff) {
    const err = new Error("Staff profile not found");
    err.statusCode = 403;
    throw err;
  }

  const isClassTeacher =
    classSection.classTeacher_id &&
    String(classSection.classTeacher_id) === String(staff._id);

  if (isClassTeacher) {
    return "class_teacher";
  }

  const subjectAssignment = await ClassSubjectAssignment.findOne({
    school_id: user.school_id,
    staff_id: staff._id,
    class_section_ids: classSection._id,
    status: "active",
  }).select("_id");

  if (subjectAssignment) {
    return "subject_teacher";
  }

  const err = new Error("You are not authorized to access this class section");
  err.statusCode = 403;
  throw err;
};

/**
 * Builds the permissions object for the hub page based on the
 * resolved access role.
 */
const buildHubPermissions = (accessRole) => {
  if (accessRole === "school_admin") {
    return {
      canEnrollStudents: true,
      canAssignTeachers: true,
      canMarkAttendance: true,
    };
  }

  if (accessRole === "class_teacher") {
    return {
      canEnrollStudents: false,
      canAssignTeachers: false,
      canMarkAttendance: true,
    };
  }

  return {
    canEnrollStudents: false,
    canAssignTeachers: false,
    canMarkAttendance: false,
  };
};

/**
 * Formats the class teacher's StaffProfile (populated with user_id)
 * into the compact summary shape required by the hub.
 */
const formatHubClassTeacher = (classTeacher) => {
  if (!classTeacher) return null;

  const teacherUser = classTeacher.user_id || null;

  return {
    staff_profile_id: classTeacher._id,
    user_id: teacherUser?._id || null,
    name: teacherUser?.name || null,
    email: teacherUser?.email || null,
    designation: classTeacher.designation || null,
    qualification: classTeacher.qualification || null,
    profile_highlight: classTeacher.profile_highlight || null,
    avatar: teacherUser?.profile_avatar || null,
  };
};

export const getClassSectionHubService = async (user, classSectionId, { attendanceDate } = {}) => {
  assertSchoolBoundUser(user);

  if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
    const err = new Error("Invalid classSection id");
    err.statusCode = 404;
    throw err;
  }

  // 1) Single class section lookup, with class teacher + user populated
  const classSection = await ClassSection.findOne({
    _id: classSectionId,
    school_id: user.school_id,
  }).populate({
    path: "classTeacher_id",
    select: "designation qualification profile_highlight user_id",
    populate: {
      path: "user_id",
      select: "name email profile_avatar",
    },
  });

  if (!classSection) {
    const err = new Error("Class section not found");
    err.statusCode = 404;
    throw err;
  }

  // 2) Resolve access role (admin / class teacher / subject teacher) — throws 403 if none
  const accessRole = await resolveClassSectionAccessRole(user, classSection);

  // 3) Fetch summary counts in parallel
  const { start, end } = dayBounds(attendanceDate || new Date());

  const [
    enrolledStudents,
    activeSubjectAssignments,
    attendanceAgg,
    publishedTimetableCount,
    latestTimetableSlot,
  ] = await Promise.all([
    StudentEnrollment.countDocuments({
      school_id: user.school_id,
      academicYear: classSection.academicYear,
      classSection_id: classSection._id,
      isActive: true,
    }),

    ClassSubjectAssignment.find({
      school_id: user.school_id,
      class_section_ids: classSection._id,
      status: "active",
    }).select("staff_id"),

    Attendance.aggregate([
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
    ]),

    Timetable.countDocuments({
      school_id: user.school_id,
      class_section_id: classSection._id,
      status: "published",
    }),

    Timetable.findOne({
      school_id: user.school_id,
      class_section_id: classSection._id,
      status: { $ne: "inactive" },
    })
      .sort({ updatedAt: -1 })
      .select("updatedAt"),
  ]);

  // ---- Student summary ----
  const capacity = classSection.capacity || 0;
  const remainingSeats = Math.max(capacity - enrolledStudents, 0);

  // ---- Subject summary ----
  const assignedTeacherIds = new Set(
    activeSubjectAssignments.map((a) => String(a.staff_id))
  );

  // ---- Attendance summary ----
  const attendanceCounts = {
    present: 0,
    absent: 0,
    late: 0,
    half_day: 0,
    excused: 0,
  };
  for (const row of attendanceAgg) {
    if (ATTENDANCE_STATUSES.includes(row._id)) {
      attendanceCounts[row._id] = row.count;
    }
  }

  return {
    classSection: {
      id: classSection._id,
      academicYear: classSection.academicYear,
      standard: classSection.standard,
      section: classSection.section,
      classCode: classSection.classCode,
      status: classSection.status,
      createdBy: classSection.createdBy
        ? {
          id: classSection.createdBy._id,
          name: classSection.createdBy.name,
          email: classSection.createdBy.email,
          role: classSection.createdBy.role,
        }
        : null,
      createdAt: classSection.createdAt,
    },

    classTeacher: formatHubClassTeacher(classSection.classTeacher_id),

    studentSummary: {
      enrolledStudents,
      capacity,
      remainingSeats,
    },

    subjectSummary: {
      assignedSubjects: activeSubjectAssignments.length,
      assignedTeachers: assignedTeacherIds.size,
    },

    attendanceSummary: {
      ...attendanceCounts,
      attendanceDate: start,
    },

    timetableSummary: {
      isPublished: publishedTimetableCount > 0,
      lastUpdatedAt: latestTimetableSlot?.updatedAt || null,
    },

    request_role: accessRole,
    permissions: buildHubPermissions(accessRole),
  };
};

// ============================================================
// TEACHER MY CLASSES
// GET /class-sections/my-classes
//
// Returns the authenticated teacher's class overview, split into:
//   - classTeacherSections  (where they are the class teacher)
//   - assignedSections      (where they are only a subject teacher)
// ============================================================

export const getMyClassesService = async (user, query = {}) => {
  if (!user || user.role !== "teacher") {
    const err = new Error("Only teachers can access this endpoint");
    err.statusCode = 403;
    throw err;
  }

  if (!user.school_id) {
    const err = new Error("User is not linked to any school");
    err.statusCode = 403;
    throw err;
  }

  // 1) Resolve the teacher's StaffProfile
  const staff = await StaffProfile.findOne({
    user_id: user.id,
    school_id: user.school_id,
  }).select("_id");

  if (!staff) {
    const err = new Error("Staff profile not found. Please contact your school admin.");
    err.statusCode = 403;
    throw err;
  }

  const sectionFilter = {
    school_id: user.school_id,
    classTeacher_id: staff._id,
  };
  const assignmentFilter = {
    school_id: user.school_id,
    staff_id: staff._id,
    status: "active",
  };

  if (query.academicYear) {
    sectionFilter.academicYear = normalize(query.academicYear);
    assignmentFilter.academicYear = normalize(query.academicYear); // Assuming assignment has academicYear too, or we filter later
  }

  // 2) Parallel: class-teacher sections + active subject assignments
  const [classTeacherSections, subjectAssignments] = await Promise.all([
    ClassSection.find(sectionFilter).sort({ academicYear: -1, standard: 1, section: 1 }),

    ClassSubjectAssignment.find(assignmentFilter)
      .populate({
        path: "subject_id",
        select: "name code status",
      })
      .populate({
        path: "class_section_ids",
        select: "academicYear standard section classCode status school_id",
      }),
  ]);

  // 3) Build a set of section IDs where teacher is the class teacher (for deduplication)
  const classTeacherSectionIds = new Set(
    classTeacherSections.map((cs) => String(cs._id))
  );

  // 4) Flatten assignments into per-section entries, deduplicating class-teacher sections
  const assignedEntries = []; // { classSection, assignment_id, subject }
  for (const assignment of subjectAssignments) {
    for (const cs of assignment.class_section_ids) {
      // skip if not in the same school (safety) or already a class-teacher section
      if (String(cs.school_id) !== String(user.school_id)) continue;
      if (classTeacherSectionIds.has(String(cs._id))) continue;
      assignedEntries.push({
        classSection: cs,
        assignment_id: assignment._id,
        subject: assignment.subject_id
          ? {
            id: assignment.subject_id._id,
            name: assignment.subject_id.name,
            code: assignment.subject_id.code,
          }
          : null,
      });
    }
  }

  // Sort assigned entries: academicYear desc, standard asc, section asc, subject name asc
  assignedEntries.sort((a, b) => {
    const yearDiff = String(b.classSection.academicYear || "").localeCompare(
      String(a.classSection.academicYear || "")
    );
    if (yearDiff !== 0) return yearDiff;
    const stdDiff = String(a.classSection.standard || "").localeCompare(
      String(b.classSection.standard || "")
    );
    if (stdDiff !== 0) return stdDiff;
    const secDiff = String(a.classSection.section || "").localeCompare(
      String(b.classSection.section || "")
    );
    if (secDiff !== 0) return secDiff;
    return String(a.subject?.name || "").localeCompare(String(b.subject?.name || ""));
  });

  // 5) Shape classTeacherSections (Minimal)
  const shapedClassTeacherSections = classTeacherSections.map((cs) => {
    return {
      id: cs._id,
      academicYear: cs.academicYear,
      standard: cs.standard,
      section: cs.section,
      classCode: cs.classCode,
      status: cs.status,
      capacity: cs.capacity,
      currentStrength: cs.currentStrength,
      createdAt: cs.createdAt,
    };
  });

  // 6) Shape assignedSections (Minimal)
  const shapedAssignedSections = assignedEntries.map((entry) => {
    const cs = entry.classSection;
    return {
      id: cs._id,
      academicYear: cs.academicYear,
      standard: cs.standard,
      section: cs.section,
      classCode: cs.classCode,
      status: cs.status,
      capacity: cs.capacity,
      currentStrength: cs.currentStrength,
      createdAt: cs.createdAt,
      assignment_id: entry.assignment_id,
      subject: entry.subject,
    };
  });

  // 7) Unique total sections
  const assignedSectionIds = new Set(shapedAssignedSections.map((s) => String(s.id)));
  const totalSections = classTeacherSectionIds.size + assignedSectionIds.size;

  return {
    classTeacherSections: shapedClassTeacherSections,
    assignedSections: shapedAssignedSections,
    totalClassTeacherSections: shapedClassTeacherSections.length,
    totalAssignedSections: shapedAssignedSections.length,
    totalSections,
    roleSummary: {
      isClassTeacher: shapedClassTeacherSections.length > 0,
      isSubjectTeacher: shapedAssignedSections.length > 0,
    },
  };
};
