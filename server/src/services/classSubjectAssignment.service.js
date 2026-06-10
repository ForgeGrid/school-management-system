// services/classSubjectAssignment.service.js
import mongoose from "mongoose";
import { ClassSubjectAssignment } from "../models/academic/classSubjectAssignment.model.js";
import { Subject } from "../models/academic/subject.model.js";
import { ClassSection } from "../models/academic/classSection.model.js";
import { StaffProfile } from "../models/staff/teacher.model.js";
import { User } from "../models/auth/user.model.js";
import { checkTransactionSupport } from "../utils/transactionHelper.js";

import {
    assertAdminOnly as assertAdmin,
    assertAttendanceManager as assertAdminOrTeacher,
} from "../utils/auth.helper.js";
import {
    normalizeComparableText,
} from "../utils/format.helper.js";
import {
    formatUserResponse as formatUser,
    formatStaffResponse as formatStaff,
    formatSectionResponse as formatSection,
} from "../utils/academic.helper.js";

// ─────────────────────────────────────────────
// PRIVATE HELPERS & FORMATTERS
// ─────────────────────────────────────────────

const formatAssignment = (a) => {
    if (!a) return null;
    const doc = a.toObject ? a.toObject() : a;
    return {
        id: doc._id,
        subject: doc.subject_id ? { id: doc.subject_id._id, name: doc.subject_id.name, code: doc.subject_id.code } : null,
        staff: formatStaff(doc.staff_id),
        class_sections: (doc.class_section_ids || []).map(formatSection),
        status: doc.status,
        createdBy: formatUser(doc.createdBy),
        updatedBy: formatUser(doc.updatedBy),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
    };
};

const buildAssignmentPopulate = () => [
    { path: "subject_id", select: "name code" },
    { path: "staff_id", select: "designation employeeId subjects profile_highlight", populate: { path: "user_id", select: "name email" } },
    { path: "class_section_ids", select: "standard section academicYear classCode" },
    { path: "createdBy", select: "name email role" },
    { path: "updatedBy", select: "name email role" }
];

const resolveSearchIds = async (schoolId, search) => {
    if (!search) return null;
    const regex = new RegExp(search.trim(), "i");

    const [subjects, sections, staffProfiles] = await Promise.all([
        Subject.find({ school_id: schoolId, $or: [{ name: regex }, { code: regex }] }).select("_id"),
        ClassSection.find({ school_id: schoolId, $or: [{ standard: regex }, { section: regex }, { classCode: regex }] }).select("_id"),
        StaffProfile.find({ school_id: schoolId, subjects: regex }).select("_id")
    ]);

    // Also check User names for staff
    const users = await User.find({ school_id: schoolId, role: "teacher", name: regex }).select("_id");
    const staffByUserName = users.length ? await StaffProfile.find({ user_id: { $in: users.map(u => u._id) } }).select("_id") : [];

    return {
        subjectIds: subjects.map(s => s._id),
        sectionIds: sections.map(s => s._id),
        staffIds: [...new Set([...staffProfiles.map(s => s._id), ...staffByUserName.map(s => s._id)])]
    };
};

// ─────────────────────────────────────────────
// MAIN SERVICES
// ─────────────────────────────────────────────

export const getEligibleStaffForAssignmentService = async (adminUser, subjectId) => {
    assertAdmin(adminUser);

    const subject = await Subject.findOne({ _id: subjectId, school_id: adminUser.school_id, status: "active" });
    if (!subject) throw new Error("Active subject not found");

    const sName = normalizeComparableText(subject.name);
    const sCode = normalizeComparableText(subject.code);

    const staffList = await StaffProfile.find({
        school_id: adminUser.school_id,
        verificationStatus: "verified",
        employeeStatus: "employed"
    }).populate("user_id", "name email");

    const eligible = staffList.filter(s => {
        const caps = (s.subjects || []).map(normalizeComparableText);
        return caps.includes(sName) || caps.includes(sCode);
    });

    return eligible.map(formatStaff);
};

export const createClassSubjectAssignmentService = async (adminUser, data) => {
    assertAdmin(adminUser);
    const { subject_id, staff_id, class_section_ids } = data;

    if (!class_section_ids || !Array.isArray(class_section_ids) || class_section_ids.length === 0) {
        throw new Error("At least one class section is required");
    }

    const useTransaction = await checkTransactionSupport();
    let session = null;
    if (useTransaction) {
        try {
            session = await mongoose.startSession();
            session.startTransaction();
        } catch (err) {
            session = null;
        }
    }

    try {
        const [subject, staff] = await Promise.all([
            Subject.findOne({ _id: subject_id, school_id: adminUser.school_id, status: "active" }).session(session),
            StaffProfile.findOne({ _id: staff_id, school_id: adminUser.school_id, verificationStatus: "verified", employeeStatus: "employed" }).session(session)
        ]);

        if (!subject) throw new Error("Subject not found or inactive");
        if (!staff) throw new Error("Staff not found, unverified, or not employed");

        const caps = (staff.subjects || []).map(normalizeComparableText);
        if (!caps.includes(normalizeComparableText(subject.name)) && !caps.includes(normalizeComparableText(subject.code))) {
            throw new Error("Staff is not eligible for this subject");
        }

        const sections = await ClassSection.find({ _id: { $in: class_section_ids }, school_id: adminUser.school_id, status: "active" }).session(session);
        if (sections.length !== (class_section_ids || []).length) throw new Error("Some class sections are invalid or inactive");

        // Check overlap
        const overlap = await ClassSubjectAssignment.findOne({
            school_id: adminUser.school_id,
            subject_id,
            class_section_ids: { $in: class_section_ids },
            status: "active"
        }).session(session);
        if (overlap) throw new Error("Overlap detected: Class section already has this subject assigned");

        const [assignment] = await ClassSubjectAssignment.create([{
            school_id: adminUser.school_id,
            subject_id,
            staff_id,
            class_section_ids,
            status: "active",
            createdBy: adminUser.id
        }], { session });

        if (useTransaction && session) {
            await session.commitTransaction();
        }
        return ClassSubjectAssignment.findById(assignment._id).populate(buildAssignmentPopulate());
    } catch (err) {
        if (useTransaction && session) {
            await session.abortTransaction();
        }
        throw err;
    } finally {
        if (session) session.endSession();
    }
};

export const getOneAssignmentService = async (user, assignmentId) => {
    assertAdminOrTeacher(user);

    const query = { _id: assignmentId, school_id: user.school_id };
    if (user.role === "teacher") {
        const profile = await StaffProfile.findOne({ user_id: user.id, school_id: user.school_id });
        if (!profile) throw new Error("Staff profile not found in your school");
        query.staff_id = profile._id;
    }

    const doc = await ClassSubjectAssignment.findOne(query).populate(buildAssignmentPopulate());
    if (!doc) throw new Error("Assignment not found");
    return formatAssignment(doc);
};

export const listClassSubjectAssignmentsService = async (user, filters = {}) => {
    assertAdminOrTeacher(user);

    const page = Math.max(parseInt(filters.page || "1", 10), 1);
    const limit = Math.min(Math.max(parseInt(filters.limit || "20", 10), 1), 100);
    const skip = (page - 1) * limit;

    const query = { school_id: user.school_id };

    if (user.role === "teacher") {
        const profile = await StaffProfile.findOne({ user_id: user.id, school_id: user.school_id });
        if (!profile) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        query.staff_id = profile._id;
    } else if (filters.staff_id) {
        // Harden: verify staff belongs to school
        const staff = await StaffProfile.findOne({ _id: filters.staff_id, school_id: user.school_id });
        if (!staff) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        query.staff_id = filters.staff_id;
    }

    if (filters.subject_id) {
        // Harden: verify subject belongs to school
        const subject = await Subject.findOne({ _id: filters.subject_id, school_id: user.school_id });
        if (!subject) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        query.subject_id = filters.subject_id;
    }

    if (filters.class_id) {
        // Harden: verify section belongs to school
        const section = await ClassSection.findOne({ _id: filters.class_id, school_id: user.school_id });
        if (!section) return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
        query.class_section_ids = filters.class_id;
    }
    if (filters.status) query.status = filters.status;

    if (filters.search) {
        const searchRes = await resolveSearchIds(user.school_id, filters.search);
        const or = [];
        if (searchRes.subjectIds.length) or.push({ subject_id: { $in: searchRes.subjectIds } });
        if (searchRes.staffIds.length) or.push({ staff_id: { $in: searchRes.staffIds } });
        if (searchRes.sectionIds.length) or.push({ class_section_ids: { $in: searchRes.sectionIds } });

        if (or.length) query.$or = or;
        else return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    const [items, total] = await Promise.all([
        ClassSubjectAssignment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(buildAssignmentPopulate()),
        ClassSubjectAssignment.countDocuments(query)
    ]);

    return {
        data: items.map(formatAssignment),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    };
};

export const updateClassSubjectAssignmentService = async (adminUser, assignmentId, data) => {
    assertAdmin(adminUser);
    const assignment = await ClassSubjectAssignment.findOne({ _id: assignmentId, school_id: adminUser.school_id });
    if (!assignment) throw new Error("Assignment not found");

    const { subject_id, staff_id, class_section_ids, status } = data;

    if (subject_id || staff_id || class_section_ids) {
        const sId = subject_id || assignment.subject_id;
        const stId = staff_id || assignment.staff_id;
        const cIds = class_section_ids || assignment.class_section_ids;

        const [subject, staff] = await Promise.all([
            Subject.findOne({ _id: sId, school_id: adminUser.school_id, status: "active" }),
            StaffProfile.findOne({ _id: stId, school_id: adminUser.school_id, verificationStatus: "verified", employeeStatus: "employed" })
        ]);

        if (!subject || !staff) throw new Error("Invalid/Inactive Subject or Staff");

        const caps = (staff.subjects || []).map(normalizeComparableText);
        if (!caps.includes(normalizeComparableText(subject.name)) && !caps.includes(normalizeComparableText(subject.code))) {
            throw new Error("Staff ineligible for this subject");
        }

        if (class_section_ids) {
            if (!Array.isArray(class_section_ids) || class_section_ids.length === 0) {
                throw new Error("At least one class section must be assigned");
            }
            const sections = await ClassSection.find({ _id: { $in: cIds }, school_id: adminUser.school_id, status: "active" });
            if (sections.length !== cIds.length) throw new Error("Invalid/Inactive class sections");

            const overlap = await ClassSubjectAssignment.findOne({
                _id: { $ne: assignmentId },
                school_id: adminUser.school_id,
                subject_id: sId,
                class_section_ids: { $in: cIds },
                status: "active"
            });
            if (overlap) throw new Error("Overlap detected with another teacher");
            assignment.class_section_ids = cIds;
        }

        assignment.subject_id = sId;
        assignment.staff_id = stId;
    }

    if (status) {
        if (!["active", "inactive"].includes(status)) throw new Error("Invalid status value");
        assignment.status = status;
    }
    assignment.updatedBy = adminUser.id;
    await assignment.save();

    const final = await ClassSubjectAssignment.findById(assignment._id).populate(buildAssignmentPopulate());
    return formatAssignment(final);
};

export const deactivateClassSubjectAssignmentService = async (adminUser, assignmentId) => {
    assertAdmin(adminUser);
    const assignment = await ClassSubjectAssignment.findOneAndUpdate(
        { _id: assignmentId, school_id: adminUser.school_id },
        { status: "inactive", updatedBy: adminUser.id },
        { returnDocument: "after" }
    ).populate(buildAssignmentPopulate());

    if (!assignment) throw new Error("Assignment not found");
    return formatAssignment(assignment);
};
