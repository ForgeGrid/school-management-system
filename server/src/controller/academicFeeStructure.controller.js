import logger from "../utils/logger.js";
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

    return res.status(201).json({
      message: "Academic fee structure created successfully",
      structure,
    });
  } catch (err) {
    logger.error("Create academic fee structure error:", err);
    return res.status(400).json({ message: err.message });
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

    return res.json({
      message: "Academic fee structure updated successfully",
      structure,
    });
  } catch (err) {
    logger.error("Update academic fee structure error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Get All
// --------------------------------------
export const getAcademicFeeStructures = async (req, res) => {
  try {
    const result = await getAcademicFeeStructuresService(req.user, req.query || {});

    return res.json({
      message: "Academic fee structures fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get academic fee structures error:", err);
    return res.status(400).json({ message: err.message });
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

    return res.json({ structure });
  } catch (err) {
    logger.error("Get one academic fee structure error:", err);
    return res.status(404).json({ message: err.message });
  }
};

// --------------------------------------
// Get Active
// --------------------------------------
export const getActiveAcademicFeeStructure = async (req, res) => {
  try {
    const structure = await getActiveAcademicFeeStructureService(req.user, req.query || {});

    return res.json({ structure });
  } catch (err) {
    logger.error("Get active academic fee structure error:", err);
    return res.status(404).json({ message: err.message });
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

    return res.json({
      message: "Academic fee structure activated successfully",
      structure,
    });
  } catch (err) {
    logger.error("Activate academic fee structure error:", err);
    return res.status(400).json({ message: err.message });
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

    return res.json({
      message: "Academic fee structure archived successfully",
      structure,
    });
  } catch (err) {
    logger.error("Archive academic fee structure error:", err);
    return res.status(400).json({ message: err.message });
  }
};