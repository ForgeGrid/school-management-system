import { sendSuccess, sendError } from "../utils/response.helper.js";
import {
  createAcademicFeeStructureService,
  updateAcademicFeeStructureService,
  getAcademicFeeStructuresService,
  getOneAcademicFeeStructureService,
  getActiveAcademicFeeStructureService,
  activateAcademicFeeStructureService,
  archiveAcademicFeeStructureService,
} from "../services/academicFeeStructure.service.js";

// --------------------------------------
// Create
// --------------------------------------
export const createAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await createAcademicFeeStructureService(req.user, req.body || {});

    return sendSuccess(res, {
      message: "Academic fee structure created successfully",
      status: 201,
      structure,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Create academic fee structure error",
    });
  }
};

// --------------------------------------
// Update
// --------------------------------------
export const updateAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await updateAcademicFeeStructureService(
      req.user,
      req.params.structureId,
      req.body || {}
    );

    return sendSuccess(res, {
      message: "Academic fee structure updated successfully",
      structure,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Update academic fee structure error",
    });
  }
};

// --------------------------------------
// Get All
// --------------------------------------
export const getAcademicFeeStructures = async (req, res) => {
  try {
    const result = await getAcademicFeeStructuresService(req.user, req.query || {});

    return sendSuccess(res, {
      message: "Academic fee structures fetched successfully",
      ...result,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Get academic fee structures error",
    });
  }
};

// --------------------------------------
// Get One
// --------------------------------------
export const getOneAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await getOneAcademicFeeStructureService(
      req.user,
      req.params.structureId
    );

    return sendSuccess(res, { structure });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Get one academic fee structure error",
      status: 404,
    });
  }
};

// --------------------------------------
// Get Active
// --------------------------------------
export const getActiveAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await getActiveAcademicFeeStructureService(req.user, req.query || {});

    return sendSuccess(res, { structure });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Get active academic fee structure error",
      status: 404,
    });
  }
};

// --------------------------------------
// Activate
// --------------------------------------
export const activateAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await activateAcademicFeeStructureService(
      req.user,
      req.params.structureId
    );

    return sendSuccess(res, {
      message: "Academic fee structure activated successfully",
      structure,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Activate academic fee structure error",
    });
  }
};

// --------------------------------------
// Archive
// --------------------------------------
export const archiveAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await archiveAcademicFeeStructureService(
      req.user,
      req.params.structureId
    );

    return sendSuccess(res, {
      message: "Academic fee structure archived successfully",
      structure,
    });
  } catch (err) {
    return sendError(res, {
      error: err,
      context: "Archive academic fee structure error",
    });
  }
};
