// utils/classSectionCard.helper.js
const toPlain = (doc) => (doc?.toObject ? doc.toObject() : doc);

const formatTinyUser = (user) => {
    const u = toPlain(user);
    if (!u) return null;

    return {
        id: u._id || u.id || null,
        name: u.name || null,
        email: u.email || null,
        role: u.role || null,
        profile_avatar: u.profile_avatar || null,
    };
};

const formatTinyStaff = (staff) => {
    const s = toPlain(staff);
    if (!s) return null;

    const user = s.user_id || s.user || null;

    return {
        staff_profile_id: s._id || s.id || null,
        user_id: user?._id || user?.id || null,
        name: user?.name || null,
        email: user?.email || null,
        designation: s.designation || null,
        qualification: s.qualification || null,
        experienceYears: s.experienceYears ?? null,
        profile_highlight: s.profile_highlight || null,
        avatar: user?.profile_avatar || null,
    };
};

/**
 * Reusable compact class section card formatter.
 * Use this for:
 * - admin class section landing cards
 * - teacher my-classes cards
 * - student/parent read-only cards
 */
export const formatClassSectionCard = (classSection, extras = {}) => {
    const cs = toPlain(classSection);

    if (!cs) return null;

    const classTeacherSource =
        extras.classTeacher !== undefined
            ? extras.classTeacher
            : cs.classTeacher_id || null;

    return {
        id: cs._id || cs.id || null,
        academicYear: cs.academicYear || null,
        standard: cs.standard || null,
        section: cs.section || null,
        classCode: cs.classCode || null,
        status: cs.status || null,

        classTeacher: formatTinyStaff(classTeacherSource),

        studentCount:
            extras.studentCount !== undefined ? extras.studentCount : null,

        subjectCount:
            extras.subjectCount !== undefined ? extras.subjectCount : null,

        attendanceToday:
            extras.attendanceToday !== undefined ? extras.attendanceToday : null,

        timetableStatus:
            extras.timetableStatus !== undefined ? extras.timetableStatus : null,

        createdBy:
            extras.createdBy !== undefined ? formatTinyUser(extras.createdBy) : null,

        createdAt:
            extras.createdAt !== undefined ? extras.createdAt : cs.createdAt || null,

        // Optional UI flags
        canMarkAttendance: !!extras.canMarkAttendance,
        canManageTimetable: !!extras.canManageTimetable,
        canAssignTeachers: !!extras.canAssignTeachers,
        canEnrollStudents: !!extras.canEnrollStudents,
    };
};
