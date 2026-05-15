import mongoose from "mongoose";
import { AcademicFeeStructure } from "../models/fees/academicFeeStructure.model.js";

const VALID_STATUSES = ["draft", "active", "archived"];



const normalizeFeeHeads = (feeHeads = []) => {
  if (!Array.isArray(feeHeads)) {
    throw new Error("feeHeads must be an array");
  }

  const normalized = feeHeads.map((item, index) => {
    if (!item?.name) {
      throw new Error(`feeHeads[${index}].name is required`);
    }
    if (item.amount === undefined || item.amount === null) {
      throw new Error(`feeHeads[${index}].amount is required`);
    }
    if (!item.frequency) {
      throw new Error(`feeHeads[${index}].frequency is required`);
    }
    if (item.order === undefined || item.order === null) {
      throw new Error(`feeHeads[${index}].order is required`);
    }

    return {
      name: String(item.name).trim(),
      amount: Number(item.amount),
      frequency: item.frequency,
      mandatory: item.mandatory !== undefined ? Boolean(item.mandatory) : true,
      taxable: item.taxable !== undefined ? Boolean(item.taxable) : false,
      order: Number(item.order),
    };
  });

  const seen = new Set();
  for (const head of normalized) {
    const key = head.name.toLowerCase();
    if (seen.has(key)) {
      throw new Error(`Duplicate fee head name found: ${head.name}`);
    }
    seen.add(key);
  }

  normalized.sort((a, b) => a.order - b.order);
  return normalized;
};

const buildFilter = (schoolId, query = {}) => {
  const filter = { school_id: schoolId };

  if (query.academicYear) filter.academicYear = String(query.academicYear).trim();
  if (query.standard) filter.standard = String(query.standard).trim();

  if (query.status && VALID_STATUSES.includes(query.status)) filter.status = query.status;

  return filter;
};

const assertSchoolAdmin = (user) => {
  if (!user || user.role !== "school_admin") {
    throw new Error("Only school admin can manage academic fee structure");
  }
  if (!user.school_id) {
    throw new Error("User is not associated with any school");
  }
};

const assertOwnSchool = (doc, user) => {
  if (!doc || doc.school_id.toString() !== user.school_id.toString()) {
    throw new Error("Unauthorized access");
  }
};

// --------------------------------------
// Create Academic Fee Structure
// --------------------------------------
export const createAcademicFeeStructureService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const payload = {
    school_id: user.school_id,
    academicYear: data.academicYear,
    standard: data.standard,

    status: data.status || "draft",
    feeHeads: normalizeFeeHeads(data.feeHeads),
    createdBy: user.id,
  };

  const exists = await AcademicFeeStructure.findOne({
    school_id: user.school_id,
    academicYear: payload.academicYear,
    standard: payload.standard,
  });

  if (exists) {
    throw new Error("Academic fee structure already exists for this school/year/standard");
  }

  return await AcademicFeeStructure.create(payload);
};

// --------------------------------------
// Update Academic Fee Structure
// --------------------------------------
export const updateAcademicFeeStructureService = async (user, structureId, data = {}) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid fee structure id");
  }

  const structure = await AcademicFeeStructure.findById(structureId);
  if (!structure) {
    throw new Error("Academic fee structure not found");
  }

  assertOwnSchool(structure, user);

  // Never allow changing school ownership directly
  delete data.school_id;
  delete data.createdBy;
  delete data.updatedBy;



  if (data.feeHeads !== undefined) {
    data.feeHeads = normalizeFeeHeads(data.feeHeads);
  }

  const nextAcademicYear = data.academicYear ? String(data.academicYear).trim() : structure.academicYear;
  const nextStandard = data.standard ? String(data.standard).trim() : structure.standard;

  const duplicate = await AcademicFeeStructure.findOne({
    _id: { $ne: structure._id },
    school_id: user.school_id,
    academicYear: nextAcademicYear,
    standard: nextStandard,
  });

  if (duplicate) {
    throw new Error("Another academic fee structure already exists for the same year/standard");
  }

  Object.assign(structure, data);
  structure.updatedBy = user.id;

  return await structure.save();
};


// --------------------------------------
// Get All Academic Fee Structures
// --------------------------------------
export const getAcademicFeeStructuresService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildFilter(user.school_id, query);

  const [items, total] = await Promise.all([
    AcademicFeeStructure.find(filter)
      .sort({ academicYear: -1, standard: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role"),
    AcademicFeeStructure.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// --------------------------------------
// Get One Academic Fee Structure
// --------------------------------------
export const getOneAcademicFeeStructureService = async (user, structureId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid fee structure id");
  }

  const structure = await AcademicFeeStructure.findById(structureId)
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (!structure) {
    throw new Error("Academic fee structure not found");
  }

  assertOwnSchool(structure, user);
  return structure;
};

// --------------------------------------
// Get Active Academic Fee Structure
// --------------------------------------
export const getActiveAcademicFeeStructureService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  if (!query.academicYear || !query.standard) {
    throw new Error("academicYear and standard are required");
  }

  const filter = {
    school_id: user.school_id,
    academicYear: String(query.academicYear).trim(),
    standard: String(query.standard).trim(),
    status: "active",
  };

  const structure = await AcademicFeeStructure.findOne(filter)
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (!structure) {
    throw new Error("Active academic fee structure not found");
  }

  return structure;
};

// --------------------------------------
// Activate Academic Fee Structure
// --------------------------------------
export const activateAcademicFeeStructureService = async (user, structureId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid fee structure id");
  }

  const structure = await AcademicFeeStructure.findById(structureId);
  if (!structure) {
    throw new Error("Academic fee structure not found");
  }

  assertOwnSchool(structure, user);

  structure.status = "active";
  structure.updatedBy = user.id;

  return await structure.save();
};

// --------------------------------------
// Archive Academic Fee Structure
// --------------------------------------
export const archiveAcademicFeeStructureService = async (user, structureId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid fee structure id");
  }

  const structure = await AcademicFeeStructure.findById(structureId);
  if (!structure) {
    throw new Error("Academic fee structure not found");
  }

  assertOwnSchool(structure, user);

  structure.status = "archived";
  structure.updatedBy = user.id;

  return await structure.save();
};