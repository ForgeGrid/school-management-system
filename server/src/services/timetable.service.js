// services/timetable.service.js

import mongoose from "mongoose";
import logger from "../utils/logger.js";

import { Timetable } from "../models/academic/timetable.model.js";
import { ClassSection } from "../models/academic/classSection.model.js";
import { Subject } from "../models/academic/subject.model.js";
import { ClassSubjectAssignment } from "../models/academic/classSubjectAssignment.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";

import { resolveStudentPortalContextService } from "./studentEnrollment.service.js";

import {
    assertAdminOnly,
    assertSchoolBoundUser
} from "../utils/auth.helper.js";
import {
    normalizeDayOfWeek,
    normalizeTime,
    timeToMinutes,
    assertValidTimeRange,
    overlapExists,
    daySortIndex
} from "../utils/date.helper.js";
import {
    normalizePeriodNo,
    staffCanHandleSubject
} from "../utils/academic.helper.js";
import {
    getClassSectionOrThrow as getClassSectionGeneric,
    getSubjectOrThrow as getSubjectGeneric,
    getStaffProfileOrThrow as getStaffProfileGeneric
} from "../utils/db.helper.js";
import { checkTransactionSupport } from "../utils/transactionHelper.js";

const TIMETABLE_STATUSES = ["draft", "published", "inactive"];

export const sortTimetableSlots = (slots = []) => {
    return [...slots].sort((a, b) => {
        const dayDiff = daySortIndex[a.day_of_week] - daySortIndex[b.day_of_week];
        if (dayDiff !== 0) return dayDiff;
        return a.period_no - b.period_no;
    });
};

/**
 * Helper to format a timetable slot for list/bulk views (Compact)
 */
export const formatTimetableSlotSummary = (slot) => {
    if (!slot) return null;

    const s = slot.toObject ? slot.toObject() : slot;

    return {
        id: s._id,
        school_id: s.school_id?._id || s.school_id,
        class_section_id: s.class_section_id?._id || s.class_section_id,
        subject_id: s.subject_id?._id || s.subject_id,
        staff_id: s.staff_id?._id || s.staff_id,
        assignment_id: s.assignment_id?._id || s.assignment_id,
        day_of_week: s.day_of_week,
        period_no: s.period_no,
        period_label: s.period_label,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
    };
};

/**
 * Helper to format a timetable slot with minimal metadata for list rendering
 */
export const formatTimetableSlotList = (slot) => {
    if (!slot) return null;
    const s = slot.toObject ? slot.toObject() : slot;

    return {
        id: s._id,
        day_of_week: s.day_of_week,
        period_no: s.period_no,
        period_label: s.period_label,
        start_time: s.start_time,
        end_time: s.end_time,
        status: s.status,
        subject: s.subject_id ? {
            id: s.subject_id._id || s.subject_id,
            name: s.subject_id.name,
            code: s.subject_id.code
        } : null,
        staff: s.staff_id ? {
            id: s.staff_id._id || s.staff_id,
            name: s.staff_id.user_id?.name || "Unassigned",
            designation: s.staff_id.designation
        } : null,
        assignment_id: s.assignment_id?._id || s.assignment_id,
    };
};

/**
 * Helper to format a timetable slot for detail view
 */
export const formatTimetableSlotDetail = (slot) => {
    if (!slot) return null;
    const s = slot.toObject ? slot.toObject() : slot;

    return {
        ...formatTimetableSlotSummary(s),
        subject: s.subject_id ? {
            id: s.subject_id._id,
            name: s.subject_id.name,
            code: s.subject_id.code,
            status: s.subject_id.status
        } : null,
        staff: s.staff_id ? {
            id: s.staff_id._id,
            name: s.staff_id.user_id?.name,
            email: s.staff_id.user_id?.email,
            designation: s.staff_id.designation,
            qualification: s.staff_id.qualification
        } : null,
        classSection: s.class_section_id ? {
            id: s.class_section_id._id,
            academicYear: s.class_section_id.academicYear,
            standard: s.class_section_id.standard,
            section: s.class_section_id.section,
            classCode: s.class_section_id.classCode
        } : null,
        publishedAt: s.publishedAt,
        publishedBy: s.publishedBy,
        createdBy: s.createdBy,
    };
};

const populateTimetableSlots = async (query) => {
    return query
        .populate("subject_id", "name code status")
        .populate({
            path: "staff_id",
            select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
            populate: {
                path: "user_id",
                select: "name email role",
            },
        })
        .populate({
            path: "assignment_id",
            select: "school_id subject_id staff_id class_section_ids status createdBy updatedBy createdAt updatedAt",
            populate: [
                {
                    path: "subject_id",
                    select: "name code status",
                },
                {
                    path: "staff_id",
                    select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
                    populate: {
                        path: "user_id",
                        select: "name email role",
                    },
                },
                {
                    path: "class_section_ids",
                    select: "academicYear standard section classCode status classTeacher_id",
                    populate: {
                        path: "classTeacher_id",
                        select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
                        populate: {
                            path: "user_id",
                            select: "name email role",
                        },
                    },
                },
            ],
        })
        .populate({
            path: "class_section_id",
            select: "academicYear standard section classCode status classTeacher_id",
            populate: {
                path: "classTeacher_id",
                select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
                populate: {
                    path: "user_id",
                    select: "name email role",
                },
            },
        });
};

const getClassSectionOrThrow = async (schoolId, classSectionId) => {
    const classSection = await getClassSectionGeneric(ClassSection, schoolId, classSectionId);
    await classSection.populate({
        path: "classTeacher_id",
        select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
        populate: {
            path: "user_id",
            select: "name email role",
        },
    });

    return classSection;
};

const getSubjectOrThrow = async (schoolId, subjectId) => {
    return await getSubjectGeneric(Subject, schoolId, subjectId);
};

const getStaffProfileOrThrow = async (schoolId, staffId) => {
    const staff = await getStaffProfileGeneric(StaffProfile, schoolId, staffId);
    await staff.populate("user_id", "name email role");
    return staff;
};


const resolveAssignmentForSlot = async ({
    schoolId,
    classSectionId,
    subjectId,
    staffId,
    assignmentId,
    allowMissingStaff = false,
}) => {
    if (assignmentId) {
        if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
            throw new Error("Invalid assignment_id");
        }

        const assignment = await ClassSubjectAssignment.findOne({
            _id: assignmentId,
            school_id: schoolId,
            status: "active",
        })
            .populate({
                path: "subject_id",
                select: "name code status",
            })
            .populate({
                path: "staff_id",
                select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
                populate: {
                    path: "user_id",
                    select: "name email role",
                },
            });

        if (!assignment) {
            throw new Error("Assignment not found or inactive");
        }

        if (
            !assignment.class_section_ids.some(
                (id) => String(id) === String(classSectionId)
            )
        ) {
            throw new Error("Assignment does not include the selected class section");
        }

        if (subjectId && String(assignment.subject_id._id) !== String(subjectId)) {
            throw new Error("Assignment subject does not match the selected subject");
        }

        if (staffId && String(assignment.staff_id._id) !== String(staffId)) {
            throw new Error("Assignment staff does not match the selected staff");
        }

        return assignment;
    }

    if (!staffId) {
        if (allowMissingStaff) return null;
        throw new Error("staff_id or assignment_id is required");
    }

    if (!subjectId) {
        throw new Error("subject_id is required when staff_id is provided");
    }

    const assignment = await ClassSubjectAssignment.findOne({
        school_id: schoolId,
        subject_id: subjectId,
        staff_id: staffId,
        class_section_ids: classSectionId,
        status: "active",
    })
        .populate({
            path: "subject_id",
            select: "name code status",
        })
        .populate({
            path: "staff_id",
            select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
            populate: {
                path: "user_id",
                select: "name email role",
            },
        });

    if (!assignment) {
        throw new Error("No active assignment found for the selected subject, staff, and class section");
    }

    return assignment;
};

const ensureSlotConflictFree = async ({
    schoolId,
    classSectionId,
    staffId,
    dayOfWeek,
    periodNo,
    startTime,
    endTime,
    ignoreTimetableId = null,
}) => {
    const query = {
        school_id: schoolId,
        day_of_week: dayOfWeek,
        status: { $ne: "inactive" },
        _id: ignoreTimetableId
            ? { $ne: new mongoose.Types.ObjectId(ignoreTimetableId) }
            : { $exists: true },
    };

    const exactClassConflict = await Timetable.findOne({
        ...query,
        class_section_id: classSectionId,
        period_no: periodNo,
    }).lean();

    if (exactClassConflict) {
        throw new Error("This class section already has a timetable slot for the same day and period");
    }

    if (staffId) {
        const exactStaffConflict = await Timetable.findOne({
            ...query,
            staff_id: staffId,
            period_no: periodNo,
        }).lean();

        if (exactStaffConflict) {
            throw new Error("This staff member is already assigned to another timetable slot for the same day and period");
        }
    }

    const overlapCandidates = await Timetable.find({
        school_id: schoolId,
        day_of_week: dayOfWeek,
        status: { $ne: "inactive" },
        _id: ignoreTimetableId
            ? { $ne: new mongoose.Types.ObjectId(ignoreTimetableId) }
            : { $exists: true },
        $or: [
            { class_section_id: classSectionId },
            ...(staffId ? [{ staff_id: staffId }] : []),
        ],
    }).select("_id class_section_id staff_id start_time end_time period_no");

    const newStart = timeToMinutes(startTime);
    const newEnd = timeToMinutes(endTime);

    for (const slot of overlapCandidates) {
        const existingStart = timeToMinutes(slot.start_time);
        const existingEnd = timeToMinutes(slot.end_time);

        if (overlapExists(newStart, newEnd, existingStart, existingEnd)) {
            throw new Error("Timetable time overlap detected for this class section or staff member");
        }
    }
};

const getCurrentStaffProfile = async (user) => {
    if (!user || !user.school_id) {
        throw new Error("User is not associated with any school");
    }

    const staff = await StaffProfile.findOne({
        user_id: user.id,
        school_id: user.school_id,
    }).populate("user_id", "name email role");

    if (!staff) {
        throw new Error("Staff profile not found");
    }

    return staff;
};

const buildSlotPayload = async ({
    user,
    input,
    existingSlot = null,
    session = null,
}) => {
    const schoolId = user.school_id;
    const warnings = [];

    const classSectionId = input.class_section_id || input.classSectionId;
    const subjectId = input.subject_id || input.subjectId;
    const staffId = input.staff_id || input.staffId;
    const assignmentId = input.assignment_id || input.assignmentId;
    const dayOfWeek = normalizeDayOfWeek(input.day_of_week || input.dayOfWeek);
    const periodNo = normalizePeriodNo(input.period_no || input.periodNo);
    const { start_time, end_time } = assertValidTimeRange(
        input.start_time || input.startTime,
        input.end_time || input.endTime
    );

    if (!classSectionId) throw new Error("class_section_id is required");
    if (!subjectId) throw new Error("subject_id is required");

    const classSection = await getClassSectionOrThrow(schoolId, classSectionId);
    const subject = await getSubjectOrThrow(schoolId, subjectId);

    let staff = null;
    let assignment = null;

    if (staffId || assignmentId) {
        if (staffId) {
            staff = await getStaffProfileOrThrow(schoolId, staffId);
            if (!staffCanHandleSubject(staff, subject)) {
                throw new Error("Selected staff is not eligible for the selected subject");
            }
        }

        assignment = await resolveAssignmentForSlot({
            schoolId,
            classSectionId: classSection._id,
            subjectId: subject._id,
            staffId: staff ? staff._id : null,
            assignmentId,
            allowMissingStaff: false,
        });

        if (!staff) staff = assignment.staff_id;
    } else {
        warnings.push(
            "No staff/assignment provided. Slot has been saved as draft so the admin can assign a teacher later."
        );
    }

    const status = TIMETABLE_STATUSES.includes(String(input.status || "").trim())
        ? String(input.status).trim()
        : (staff && assignment ? "draft" : "draft");

    if (!["draft", "published", "inactive"].includes(status)) {
        throw new Error("Invalid timetable status");
    }

    if (status === "published" && (!staff || !assignment)) {
        warnings.push("Slot cannot be published yet because the assignee is missing. It has been saved as draft instead.");
    }

    const finalStatus = (staff && assignment) ? status : "draft";

    await ensureSlotConflictFree({
        schoolId,
        classSectionId: classSection._id,
        staffId: staff ? staff._id : null,
        dayOfWeek,
        periodNo,
        startTime: start_time,
        endTime: end_time,
        ignoreTimetableId: existingSlot ? existingSlot._id : null,
    });

    const payload = {
        school_id: schoolId,
        class_section_id: classSection._id,
        subject_id: subject._id,
        staff_id: staff ? staff._id : null,
        assignment_id: assignment ? assignment._id : null,
        day_of_week: dayOfWeek,
        period_no: periodNo,
        period_label: String(input.period_label || input.periodLabel || "").trim() || null,
        start_time,
        end_time,
        status: finalStatus,
        updatedBy: user.id,
    };

    if (!existingSlot) {
        payload.createdBy = user.id;
    }

    return {
        payload,
        classSection,
        subject,
        staff,
        assignment,
        warnings,
        finalStatus,
    };
};

// ------------------------------------------------------
// 1) Eligible staff for a class section (class-teacher first)
// ------------------------------------------------------
export const getEligibleTimetableStaffService = async (
    adminUser,
    { classSectionId, subjectId = null }
) => {
    assertAdminOnly(adminUser);

    if (!classSectionId) {
        throw new Error("classSectionId is required");
    }

    const classSection = await getClassSectionOrThrow(adminUser.school_id, classSectionId);

    let subject = null;
    if (subjectId) {
        subject = await getSubjectOrThrow(adminUser.school_id, subjectId);
    }

    const assignmentQuery = {
        school_id: adminUser.school_id,
        status: "active",
        class_section_ids: classSection._id,
    };

    if (subject) {
        assignmentQuery.subject_id = subject._id;
    }

    const assignments = await ClassSubjectAssignment.find(assignmentQuery)
        .populate({
            path: "subject_id",
            select: "name code status",
        })
        .populate({
            path: "staff_id",
            select: "designation qualification experienceYears phone alternatePhone subjects verificationStatus employeeStatus user_id school_id",
            populate: {
                path: "user_id",
                select: "name email role",
            },
        });

    const filteredAssignments = assignments.filter((assignment) => {
        if (!assignment.subject_id || assignment.subject_id.status !== "active") {
            return false;
        }

        if (!assignment.staff_id) {
            return false;
        }

        const staff = assignment.staff_id;
        if (staff.verificationStatus !== "verified" || staff.employeeStatus !== "employed") {
            return false;
        }

        return staffCanHandleSubject(staff, assignment.subject_id);
    });

    const classTeacher = classSection.classTeacher_id || null;
    let classTeacherCanUseThisSubject = false;

    if (classTeacher) {
        classTeacherCanUseThisSubject = subject
            ? staffCanHandleSubject(classTeacher, subject)
            : true;
    }

    const teacherAssignment = classTeacher
        ? filteredAssignments.find(
            (assignment) =>
                String(assignment.staff_id._id) === String(classTeacher._id)
        ) || null
        : null;

    const candidates = filteredAssignments
        .filter((assignment) => {
            if (!subject) return true;
            return String(assignment.subject_id._id) === String(subject._id);
        })
        .map((assignment) => ({
            assignment_id: assignment._id,
            subject: {
                _id: assignment.subject_id._id,
                name: assignment.subject_id.name,
                code: assignment.subject_id.code,
            },
            staff: {
                staff_profile_id: assignment.staff_id._id,
                user_id: assignment.staff_id.user_id?._id || assignment.staff_id.user_id,
                name: assignment.staff_id.user_id?.name || null,
                email: assignment.staff_id.user_id?.email || null,
                designation: assignment.staff_id.designation || null,
                qualification: assignment.staff_id.qualification || null,
                experienceYears: assignment.staff_id.experienceYears || null,
            },
            class_section_ids: assignment.class_section_ids,
            is_class_teacher: classTeacher
                ? String(assignment.staff_id._id) === String(classTeacher._id)
                : false,
            can_select: true,
        }));

    // Pin class teacher first if they are part of the eligible pool
    candidates.sort((a, b) => {
        if (a.is_class_teacher && !b.is_class_teacher) return -1;
        if (!a.is_class_teacher && b.is_class_teacher) return 1;
        return String(a.staff.name || "").localeCompare(String(b.staff.name || ""));
    });

    const classTeacherSummary = classTeacher
        ? {
            staff_profile_id: classTeacher._id,
            user_id: classTeacher.user_id?._id || classTeacher.user_id,
            name: classTeacher.user_id?.name || null,
            email: classTeacher.user_id?.email || null,
            designation: classTeacher.designation || null,
            qualification: classTeacher.qualification || null,
            experienceYears: classTeacher.experienceYears || null,
            can_select: classTeacherCanUseThisSubject,
            is_class_teacher: true,
            is_eligible_for_subject: classTeacherCanUseThisSubject,
            linked_assignment_id: teacherAssignment ? teacherAssignment._id : null,
        }
        : null;

    return {
        classSection,
        subject,
        classTeacher: classTeacherSummary,
        candidates,
    };
};

// ----------------------------------------------------------------------
// 2) Single upsert (create/update by timetableId OR by class/day/period)
// ----------------------------------------------------------------------
export const upsertTimetableSlotService = async (adminUser, data = {}, session = null) => {
    assertAdminOnly(adminUser);

    const timetableId = data.timetableId || data._id || null;

    const existingSlot = timetableId
        ? await Timetable.findOne({
            _id: timetableId,
            school_id: adminUser.school_id,
        })
        : null;

    if (timetableId && !existingSlot) {
        throw new Error("Timetable slot not found");
    }

    const { payload, classSection, subject, staff, assignment, warnings, finalStatus } =
        await buildSlotPayload({
            user: adminUser,
            input: data,
            existingSlot,
            session,
        });

    const slot = existingSlot || new Timetable();

    // Assign in strict business order for MongoDB serialization consistency
    slot.school_id = payload.school_id;
    slot.class_section_id = payload.class_section_id;
    slot.subject_id = payload.subject_id;
    slot.staff_id = payload.staff_id;
    slot.assignment_id = payload.assignment_id;

    slot.day_of_week = payload.day_of_week;
    slot.period_no = payload.period_no;
    slot.period_label = payload.period_label;

    slot.start_time = payload.start_time;
    slot.end_time = payload.end_time;

    slot.status = payload.status;

    // Handle optional fields that might not be in payload but exist in schema
    if (payload.publishedAt !== undefined) slot.publishedAt = payload.publishedAt;
    if (payload.publishedBy !== undefined) slot.publishedBy = payload.publishedBy;

    slot.updatedBy = payload.updatedBy;

    if (slot.isNew) {
        slot.createdBy = payload.createdBy;
    }

    await slot.save({ session });

    return {
        timetable: formatTimetableSlotSummary(slot),
        warnings,
        status: finalStatus,
    };
};

// ----------------------------------------------------------------------
// 3) Bulk upsert (create/update many slots safely)
// ----------------------------------------------------------------------
export const bulkUpsertTimetableSlotsService = async (adminUser, data = {}) => {
    assertAdminOnly(adminUser);

    const slots = Array.isArray(data.slots) ? data.slots : [];
    if (slots.length === 0) {
        throw new Error("slots must be a non-empty array");
    }

    const useTransaction = await checkTransactionSupport(mongoose.connection);
    const session = useTransaction ? await mongoose.startSession() : null;

    try {
        if (session) session.startTransaction();

        const seenKeys = new Set();
        const results = [];
        const warnings = [];

        for (const [index, slotInput] of slots.entries()) {
            const classSectionId = slotInput.class_section_id || slotInput.classSectionId;
            const dayOfWeek = normalizeDayOfWeek(slotInput.day_of_week || slotInput.dayOfWeek);
            const periodNo = normalizePeriodNo(slotInput.period_no || slotInput.periodNo);

            if (!classSectionId) {
                throw new Error(`slots[${index}].class_section_id is required`);
            }

            const dedupeKey = `${String(classSectionId)}:${dayOfWeek}:${periodNo}`;
            if (seenKeys.has(dedupeKey)) {
                throw new Error(`Duplicate timetable slot in payload for ${dedupeKey}`);
            }
            seenKeys.add(dedupeKey);
        }

        for (const [index, slotInput] of slots.entries()) {
            const result = await upsertTimetableSlotService(adminUser, slotInput, session);

            // Shape each bulk item to be extremely compact as requested
            results.push({
                timetableId: result.timetable.id,
                class_section_id: result.timetable.class_section_id,
                subject_id: result.timetable.subject_id,
                staff_id: result.timetable.staff_id,
                assignment_id: result.timetable.assignment_id,
                day_of_week: result.timetable.day_of_week,
                period_no: result.timetable.period_no,
                period_label: result.timetable.period_label,
                start_time: result.timetable.start_time,
                end_time: result.timetable.end_time,
                status: result.timetable.status,
                warnings: result.warnings,
            });

            if (Array.isArray(result.warnings) && result.warnings.length) {
                warnings.push({
                    index,
                    warnings: result.warnings,
                });
            }
        }

        if (session) await session.commitTransaction();
        return {
            success: true,
            message: "Timetable slots saved successfully",
            results,
            warnings,
        };
    } catch (error) {
        if (session) await session.abortTransaction();
        throw error;
    } finally {
        if (session) session.endSession();
    }
};

// ----------------------------------------------------------------------
// 4) Read timetable by class section (day filter optional)
// ----------------------------------------------------------------------
export const getTimetableByClassSectionService = async (
    user,
    { classSectionId, dayOfWeek = null }
) => {
    assertSchoolBoundUser(user);

    if (!classSectionId) {
        throw new Error("classSectionId is required");
    }

    const classSection = await getClassSectionOrThrow(user.school_id, classSectionId);

    const query = {
        school_id: user.school_id,
        class_section_id: classSection._id,
        status: { $ne: "inactive" },
    };

    if (dayOfWeek) {
        query.day_of_week = normalizeDayOfWeek(dayOfWeek);
    }

    let timetable = await populateTimetableSlots(Timetable.find(query));
    timetable = sortTimetableSlots(timetable);

    return {
        classSection: {
            id: classSection._id,
            academicYear: classSection.academicYear,
            standard: classSection.standard,
            section: classSection.section,
            classCode: classSection.classCode,
        },
        timetable: timetable.map(formatTimetableSlotList),
    };
};

// ----------------------------------------------------------------------
// 5) Read timetable by staff (teacher sees own; admin can specify any staffId)
// ----------------------------------------------------------------------
export const getTimetableByStaffService = async (
    user,
    { staffId = null, dayOfWeek = null }
) => {
    assertSchoolBoundUser(user);

    let targetStaffId = staffId;

    if (user.role !== "school_admin") {
        const myStaff = await getCurrentStaffProfile(user);
        targetStaffId = myStaff._id;

        if (staffId && String(staffId) !== String(myStaff._id)) {
            throw new Error("You can only view your own timetable");
        }
    } else {
        if (!targetStaffId) {
            throw new Error("staffId is required for admin timetable lookup");
        }
        await getStaffProfileOrThrow(user.school_id, targetStaffId);
    }

    const query = {
        school_id: user.school_id,
        staff_id: targetStaffId,
        status: { $ne: "inactive" },
    };

    if (dayOfWeek) {
        query.day_of_week = normalizeDayOfWeek(dayOfWeek);
    }

    let timetable = await populateTimetableSlots(Timetable.find(query));
    timetable = sortTimetableSlots(timetable);

    return {
        staffId: targetStaffId,
        timetable: timetable.map(formatTimetableSlotList),
    };
};

// ----------------------------------------------------------------------
// 6) Publish timetable (admin only) + notify assigned teachers
// ----------------------------------------------------------------------
export const publishTimetableService = async (
    adminUser,
    { classSectionId, dayOfWeek = null }
) => {
    assertAdminOnly(adminUser);

    if (!classSectionId) {
        throw new Error("classSectionId is required");
    }

    const classSection = await getClassSectionOrThrow(adminUser.school_id, classSectionId);

    const query = {
        school_id: adminUser.school_id,
        class_section_id: classSection._id,
        status: "draft",
    };

    if (dayOfWeek) {
        query.day_of_week = normalizeDayOfWeek(dayOfWeek);
    }

    const draftSlots = await Timetable.find(query)
        .select("_id school_id class_section_id subject_id staff_id assignment_id day_of_week period_no period_label start_time end_time status")
        .populate({
            path: "staff_id",
            select: "user_id designation qualification experienceYears",
            populate: {
                path: "user_id",
                select: "name email role",
            },
        })
        .populate({
            path: "class_section_id",
            select: "standard section classCode classTeacher_id",
            populate: {
                path: "classTeacher_id",
                select: "user_id designation qualification",
                populate: {
                    path: "user_id",
                    select: "name email role",
                },
            },
        })
        .populate("subject_id", "name code status");

    const publishable = [];
    const skipped = [];

    for (const slot of draftSlots) {
        if (!slot.staff_id || !slot.assignment_id) {
            skipped.push({
                timetableId: slot._id,
                reason: "Missing assignee/assignment",
            });
            continue;
        }

        publishable.push(slot._id);
    }

    if (publishable.length === 0) {
        return {
            classSection,
            publishedCount: 0,
            skipped,
            warnings: ["No publishable slots found. Fill missing assignees first."],
        };
    }

    const now = new Date();
    await Promise.all(
        draftSlots
            .filter(slot => publishable.includes(slot._id))
            .map(async (slot) => {
                slot.status = "published";
                slot.publishedAt = now;
                slot.publishedBy = adminUser.id;
                slot.updatedBy = adminUser.id;
                return slot.save();
            })
    );

    const publishedSlots = await populateTimetableSlots(
        Timetable.find({
            _id: { $in: publishable },
            school_id: adminUser.school_id,
        })
    );

    // Notify teachers after publish
    await notifyTimetablePublishedService(adminUser, publishedSlots);

    logger.info(
        `Timetable published: school=${adminUser.school_id}, classSection=${classSectionId}, count=${publishable.length}`
    );

    return {
        classSection: {
            id: classSection._id,
            classCode: classSection.classCode,
        },
        publishedCount: publishable.length,
        skipped,
        timetableIds: publishable,
        warnings: skipped.length
            ? ["Some slots were skipped because they were missing assignees."]
            : [],
    };
};

// ----------------------------------------------------------------------
// 7) Soft deactivate a timetable slot
// ----------------------------------------------------------------------
export const deactivateTimetableSlotService = async (adminUser, timetableId) => {
    assertAdminOnly(adminUser);

    if (!mongoose.Types.ObjectId.isValid(timetableId)) {
        throw new Error("Invalid timetableId");
    }

    const slot = await Timetable.findOne({
        _id: timetableId,
        school_id: adminUser.school_id,
    });

    if (!slot) {
        throw new Error("Timetable slot not found");
    }

    slot.status = "inactive";
    slot.updatedBy = adminUser.id;

    await slot.save();

    return formatTimetableSlotSummary(slot);
};

/**
 * 8) Get specific slot by ID
 */
export const getTimetableByIdService = async (user, timetableId) => {
    assertSchoolBoundUser(user);
    const slot = await populateTimetableSlots(
        Timetable.findOne({ _id: timetableId, school_id: user.school_id })
    );

    if (!slot) throw new Error("Timetable slot not found");
    return formatTimetableSlotDetail(slot);
};

/**
 * 9) Get all slots with filters
 */
export const getAllTimetableSlotsService = async (user, query = {}) => {
    assertSchoolBoundUser(user);
    const filter = { school_id: user.school_id };

    if (query.dayOfWeek) filter.day_of_week = normalizeDayOfWeek(query.dayOfWeek);
    if (query.status) filter.status = query.status;
    const classId = query.classSectionId || query.class_section_id;
    if (classId) filter.class_section_id = classId;

    let timetable = await populateTimetableSlots(Timetable.find(filter));
    timetable = sortTimetableSlots(timetable);

    return timetable.map(formatTimetableSlotList);
};

/**
 * 10) Alias for delete (soft-deactivate)
 */
export const deleteTimetableSlotService = deactivateTimetableSlotService;

const notifyTimetablePublishedService = async (adminUser, slots) => {
    // Implementation placeholder or actual logic if needed
    logger.info(`Notifying teachers for ${slots.length} slots`);
};

export const getMyTimetableService = async (user, { dayOfWeek = null, childId = null } = {}) => {
  if (!["student", "parent"].includes(user.role)) {
    throw new Error("Only student or parent can access timetable");
  }

  const { classSection } = await resolveStudentPortalContextService(user, { childId });

  return await getTimetableByClassSectionService(user, {
    classSectionId: classSection._id,
    dayOfWeek,
  });
};
