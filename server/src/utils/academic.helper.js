import mongoose from "mongoose";

/**
 * academic.helper.js
 * 
 * Domain-specific logic for academic modules.
 */

/**
 * Normalizes period number.
 */
export const normalizePeriodNo = (value) => {
    const period = Number.parseInt(value, 10);
    if (!Number.isInteger(period) || period < 1) {
        throw new Error("period_no must be a positive integer");
    }
    return period;
};

/**
 * Checks if a staff member is eligible to handle a specific subject.
 */
export const staffCanHandleSubject = (staffProfile, subject) => {
    const capabilitySet = new Set(
        (Array.isArray(staffProfile.subjects) ? staffProfile.subjects : [])
            .map((s) => String(s).trim().toLowerCase())
            .filter(Boolean)
    );

    return (
        capabilitySet.has(String(subject.code).toLowerCase()) ||
        capabilitySet.has(String(subject.name || "").trim().toLowerCase().replace(/\s+/g, "_"))
    );
};

/**
 * Generates a class code from standard and section.
 */
export const generateClassCode = (standard, section) => {
    const std = String(standard || "").trim();
    const sec = String(section || "").trim().toUpperCase();

    const match = std.match(/^grade\s+(.+)$/i);
    const cleanStd = match ? `G${match[1].trim()}` : std;

    const safeStd = cleanStd.replace(/[^a-zA-Z0-9-]/g, "");
    return `${safeStd}-${sec}`;
};

/**
 * Derives previous academic year from current one (e.g., "2024-25" -> "2023-24").
 */
export const derivePreviousAcademicYear = (academicYear) => {
    const parts = String(academicYear || "").split("-");
    if (parts.length !== 2) return null;

    const start = Number.parseInt(parts[0], 10);
    const end = Number.parseInt(parts[1], 10);

    if (Number.isNaN(start) || Number.isNaN(end)) return null;

    return `${start - 1}-${end - 1}`;
};

/**
 * assertTeacherCanAccessClass - Validates if a teacher has permission to manage attendance for a class.
 */
export const assertTeacherCanAccessClass = async (StaffProfileModel, user, classSection) => {
    if (user.role === "school_admin") return;

    if (user.role === "teacher") {
        const staff = await StaffProfileModel.findOne({
            user_id: user.id,
            school_id: user.school_id,
        });

        if (!staff) {
            throw new Error("Staff profile not found");
        }

        const isClassTeacher = classSection.classTeacher_id && String(classSection.classTeacher_id) === String(staff._id);

        if (!isClassTeacher) {
            throw new Error("You are not authorized to manage attendance for this class");
        }
        return;
    }

    throw new Error("Unauthorized access");
};

/**
 * buildEditableUntil - Standard window for editing academic records (e.g. attendance).
 */
export const buildEditableUntil = (date, windowDays = 5) => {
    const d = new Date(date);
    d.setDate(d.getDate() + windowDays);
    d.setHours(23, 59, 59, 999);
    return d;
};

/**
 * validateClassTeacher - Validates if a staff member exists and is eligible to be a class teacher.
 */
export const validateClassTeacher = async (StaffProfileModel, schoolId, staffId) => {
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new Error("Invalid staff_id for class teacher");
    }

    const staff = await StaffProfileModel.findOne({
        _id: staffId,
        school_id: schoolId,
        verificationStatus: "verified",
        employeeStatus: "employed",
    });

    if (!staff) {
        throw new Error("Staff member not found or not eligible to be a class teacher");
    }

    return staff;
};

/**
 * getNumericStandard - Converts standard string (e.g. "Grade 5", "UKG") to a number for comparison.
 */
export const getNumericStandard = (standard) => {
    const std = String(standard || "").trim().toLowerCase();

    const match = std.match(/grade\s+(\d+)/);
    if (match) return Number(match[1]);

    if (std === "ukg") return 0;
    if (std === "lkg") return -1;
    if (std === "nursery") return -2;

    return null;
};

/**
 * buildGradeLabel - Creates a human-readable grade label (e.g. "Grade 5 (B)").
 */
export const buildGradeLabel = (classSection) => {
    if (!classSection) return "";
    const std = String(classSection.standard || "").trim();
    const sec = String(classSection.section || "").trim();
    return sec ? `${std} (${sec})` : std;
};

/**
 * formatUserResponse - Formats a user for a consistent response object.
 */
export const formatUserResponse = (user) => {
    if (!user) return null;
    return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
};

/**
 * formatStaffResponse - Formats a staff profile for a consistent response object.
 */
export const formatStaffResponse = (staff) => {
    if (!staff) return null;
    const user = staff.user_id ? formatUserResponse(staff.user_id) : null;
    return {
        id: staff._id,
        user,
        designation: staff.designation,
        employeeId: staff.employeeId,
        subjects: staff.subjects || [],
        profile_highlight: staff.profile_highlight || "",
    };
};

/**
 * formatSectionResponse - Formats a class section for a consistent response object.
 */
export const formatSectionResponse = (classSection) => {
    if (!classSection) return null;
    return {
        _id: classSection._id,
        standard: classSection.standard,
        section: classSection.section,
        classCode: classSection.classCode,
        label: buildGradeLabel(classSection),
    };
};
