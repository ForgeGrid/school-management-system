import { Subject } from "../models/academic/subject.model.js";

import {
  assertAdminOnly as assertSchoolAdmin,
  assertSchoolBoundUser,
} from "../utils/auth.helper.js";
import {
  normalizeSubjectCode,
} from "../utils/format.helper.js";
import {
  applySearchFilter as applySearchFilterGeneric,
  buildFilter as buildFilterGeneric,
  getByIdOrThrow as getByIdOrThrowGeneric,
} from "../utils/db.helper.js";

/**
 * Normalize subject code from name/code input
 */
const buildSubjectFilter = (schoolId, query = {}) => {
  const filter = buildFilterGeneric(schoolId, query, ["status"]);

  if (query.search) {
    applySearchFilterGeneric(filter, query.search, ["name", "code", "description"]);
  }

  return filter;
};

// CREATE
export const createSubjectService = async (adminUser, data) => {
  assertSchoolAdmin(adminUser);

  const name = String(data.name || "").trim();
  const description = String(data.description || "").trim();
  const rawCode = data.code ? String(data.code).trim() : "";
  const code = normalizeSubjectCode(rawCode || name);

  if (!name) {
    throw new Error("Subject name is required");
  }

  if (!code) {
    throw new Error("Subject code could not be generated");
  }

  const existing = await Subject.findOne({
    school_id: adminUser.school_id,
    code,
  });

  if (existing) {
    throw new Error(`Subject code "${code}" already exists in this school`);
  }

  const subject = await Subject.create({
    school_id: adminUser.school_id,
    name,
    code,
    description,
    status: data.status || "active",
    createdBy: adminUser.id,
    updatedBy: null,
  });

  return subject;
};

// READ ALL
export const getSubjectsService = async (user, query = {}) => {
  assertSchoolBoundUser(user);

  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildSubjectFilter(user.school_id, query);

  const [items, total] = await Promise.all([
    Subject.find(filter)
      .sort({ status: 1, name: 1 })
      .skip(skip)
      .limit(limit),
    Subject.countDocuments(filter),
  ]);

  return {
    data: items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// READ ONE
export const getSubjectByIdService = async (user, subjectId) => {
  return await getByIdOrThrowGeneric(Subject, user.school_id, subjectId, "Subject");
};

// UPDATE
export const updateSubjectService = async (adminUser, subjectId, data) => {
  assertSchoolAdmin(adminUser);

  const subject = await getByIdOrThrowGeneric(Subject, adminUser.school_id, subjectId, "Subject");

  if (typeof data.name === "string") {
    const name = data.name.trim();
    if (!name) throw new Error("Subject name cannot be empty");
    subject.name = name;
  }

  if (typeof data.description === "string") {
    subject.description = data.description.trim();
  }

  if (typeof data.status === "string") {
    if (!["active", "inactive"].includes(data.status)) {
      throw new Error("Invalid subject status");
    }
    subject.status = data.status;
  }

  if (typeof data.code === "string" && data.code.trim()) {
    const newCode = normalizeSubjectCode(data.code);

    const existing = await Subject.findOne({
      school_id: adminUser.school_id,
      code: newCode,
      _id: { $ne: subjectId },
    });

    if (existing) {
      throw new Error(`Subject code "${newCode}" already exists in this school`);
    }

    subject.code = newCode;
  }

  subject.updatedBy = adminUser.id;

  await subject.save();
  return subject;
};

// DELETE (soft delete = deactivate)
export const deleteSubjectService = async (adminUser, subjectId) => {
  assertSchoolAdmin(adminUser);

  const subject = await getByIdOrThrowGeneric(Subject, adminUser.school_id, subjectId, "Subject");

  subject.status = "inactive";
  subject.updatedBy = adminUser.id;

  await subject.save();
  return subject;
};