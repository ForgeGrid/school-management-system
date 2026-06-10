/**
 * auth.helper.js
 * 
 * Centralized authentication and authorization assertions.
 */

/**
 * Ensures the user is associated with a school.
 */
export const assertSchoolBoundUser = (user) => {
    if (!user || !user.school_id) {
        throw new Error("User index is not associated with any school");
    }
};

/**
 * Ensures the user is a school admin.
 */
export const assertAdminOnly = (user) => {
    assertSchoolBoundUser(user);
    if (user.role !== "school_admin") {
        throw new Error("Only school admin can perform this action");
    }
};

/**
 * Alternative name for assertAdminOnly, used in some services.
 */
export const assertAdminRole = assertAdminOnly;

/**
 * Ensures the user is a school admin or staff.
 */
export const assertAdminOrStaff = (user) => {
    assertSchoolBoundUser(user);
    if (!["school_admin", "staff"].includes(user.role)) {
        throw new Error("Only school admin or staff can perform this action");
    }
};

/**
 * Ensures the user is a school admin or teacher.
 */
export const assertAdminOrTeacher = (user) => {
    assertSchoolBoundUser(user);
    if (!["school_admin", "teacher"].includes(user.role)) {
        throw new Error("Only school admin or teacher can perform this action");
    }
};

/**
 * Ensures the user is an attendance manager (Admin or Teacher).
 */
export const assertAttendanceManager = assertAdminOrTeacher;

/**
 * Ensures the user has one of the specified roles.
 */
export const assertRole = (user, roles) => {
    assertSchoolBoundUser(user);
    const roleSet = new Set(Array.isArray(roles) ? roles : [roles]);
    if (!roleSet.has(user.role)) {
        throw new Error(`Unauthorized: User does not have required role(s): ${Array.from(roleSet).join(", ")}`);
    }
};

/**
 * Ensures the user owns the document or is an admin.
 */
export const assertOwnSchool = (doc, user) => {
    assertSchoolBoundUser(user);
    const targetSchoolId = doc.school_id || doc._id;
    if (String(targetSchoolId) !== String(user.school_id)) {
        throw new Error("Unauthorized access to school data");
    }
};

/**
 * Ensures the user has a staff role (admin, teacher, or staff).
 */
export const assertStaffRole = (user) => {
    assertSchoolBoundUser(user);
    if (!["school_admin", "teacher", "staff"].includes(user.role)) {
        throw new Error("Invalid role for this action");
    }
};

/**
 * Ensures the invited role is valid (teacher or staff).
 */
export const assertInviteRole = (role) => {
    if (!["teacher", "staff"].includes(role)) {
        throw new Error("Only teachers or staff members can be invited");
    }
};

/**
 * Ensures the user is a parent or student.
 */
export const assertParentOrStudent = (user) => {
    assertSchoolBoundUser(user);
    if (!["student", "parent"].includes(user.role)) {
        throw new Error("Only parent or student can access this portal");
    }
};

/**
 * Ensures the user has a role that can create records (teacher, staff, or parent).
 */
export const assertCreatorRole = (user) => {
    assertSchoolBoundUser(user);
    if (!["teacher", "staff", "parent"].includes(user.role)) {
        throw new Error("Unauthorized: Your role cannot create records");
    }
};

/**
 * Ensures the user is the creator of the document or a school admin.
 */
export const assertCreatorOrAdmin = (user, doc = null, creatorField = "createdBy") => {
    assertSchoolBoundUser(user);
    if (user.role === "school_admin") return;

    if (!doc) return; // if doc is not provided, we only check school_id (already done in assertSchoolBoundUser)

    const creatorId = doc[creatorField]?.user_id || doc[creatorField]?._id || doc[creatorField];
    if (String(creatorId) !== String(user.id)) {
        throw new Error("Unauthorized: You are not the creator of this record");
    }
};
