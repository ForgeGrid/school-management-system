import mongoose from "mongoose";

/**
 * db.helper.js
 * 
 * Common database lookup and query building patterns.
 */

/**
 * buildFilter - Generic filter builder for school-bound queries.
 */
export const buildFilter = (schoolId, query = {}, allowedFields = []) => {
    const filter = { school_id: schoolId };

    for (const field of allowedFields) {
        if (query[field] !== undefined) {
            filter[field] = query[field];
        }
    }

    return filter;
};

/**
 * applySearchFilter - Adds regex search to a query object.
 */
export const applySearchFilter = (query, search, fields = []) => {
    const q = String(search || "").trim();
    if (!q || fields.length === 0) return;

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    query.$or = fields.map(field => ({ [field]: regex }));
};

/**
 * genericGetOrThrow - Generic helper to find a document and throw if not found.
 */
export const genericGetOrThrow = async (Model, filter, errorMessage = "Document not found") => {
    const doc = await Model.findOne(filter);
    if (!doc) {
        throw new Error(errorMessage);
    }
    return doc;
};

/**
 * getClassSectionOrThrow - Specific helper for ClassSection.
 */
export const getClassSectionOrThrow = async (ClassSectionModel, schoolId, classSectionId, status = "active") => {
    if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
        throw new Error("Invalid classSection_id");
    }

    const filter = { _id: classSectionId, school_id: schoolId };
    if (status) filter.status = status;

    return genericGetOrThrow(ClassSectionModel, filter, "Class section not found or inactive");
};

/**
 * getSubjectOrThrow - Specific helper for Subject.
 */
export const getSubjectOrThrow = async (SubjectModel, schoolId, subjectId, status = "active") => {
    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
        throw new Error("Invalid subject_id");
    }

    const filter = { _id: subjectId, school_id: schoolId };
    if (status) filter.status = status;

    return genericGetOrThrow(SubjectModel, filter, "Subject not found or inactive");
};

/**
 * getStaffProfileOrThrow - Specific helper for StaffProfile.
 */
export const getStaffProfileOrThrow = async (StaffProfileModel, schoolId, staffId, eligibility = true) => {
    if (!mongoose.Types.ObjectId.isValid(staffId)) {
        throw new Error("Invalid staff_id");
    }

    const filter = { _id: staffId, school_id: schoolId };
    if (eligibility) {
        filter.verificationStatus = "verified";
        filter.employeeStatus = "employed";
    }

    return genericGetOrThrow(StaffProfileModel, filter, "Staff profile not found or not eligible");
};

/**
 * getByIdOrThrow - Generic helper to find a document by ID and schoolId.
 */
export const getByIdOrThrow = async (Model, schoolId, id, entityName = "Document") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ${entityName} ID format`);
    }
    const doc = await Model.findOne({ _id: id, school_id: schoolId });
    if (!doc) {
        throw new Error(`${entityName} not found`);
    }
    return doc;
};

/**
 * uniqueByProperty - Deduplicates an array of objects based on a property, keeping the one with higher confidence if available.
 */
export const uniqueByProperty = (items = [], property = "id") => {
    const map = new Map();

    for (const item of items) {
        const key = String(item[property] || "");
        if (!key) continue;

        const existing = map.get(key);

        if (!existing || (item._confidence || 0) > (existing._confidence || 0)) {
            map.set(key, item);
        }
    }

    return [...map.values()];
};
