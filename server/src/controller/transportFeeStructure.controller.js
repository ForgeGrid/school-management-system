import logger from "../utils/logger.js";
import {
  createTransportFeeStructureService,
  updateTransportFeeStructureService,
  getTransportFeeStructuresService,
  getOneTransportFeeStructureService,
  getActiveTransportFeeStructureService,
  activateTransportFeeStructureService,
  archiveTransportFeeStructureService,
  bulkUpdateTransportFeeStructuresService,
} from "../services/transportFeeStructure.service.js";

// --------------------------------------
// Create
// --------------------------------------
export const createTransportFeeStructure = async (req, res) => {
  try {
    const structure = await createTransportFeeStructureService(req.user, req.body || {});

    return res.status(201).json({
      message: "Transport fee structure(s) created successfully",
      structures: structure,
    });
  } catch (err) {
    logger.error("Create transport fee structure error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Update
// --------------------------------------
export const updateTransportFeeStructure = async (req, res) => {
  try {
    const structure = await updateTransportFeeStructureService(
      req.user,
      req.params.structureId,
      req.body || {}
    );

    return res.json({
      message: "Transport fee structure updated successfully",
      structure,
    });
  } catch (err) {
    logger.error("Update transport fee structure error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Get All
// --------------------------------------
export const getTransportFeeStructures = async (req, res) => {
  try {
    const result = await getTransportFeeStructuresService(req.user, req.query || {});

    return res.json({
      message: "Transport fee structures fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get transport fee structures error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Get One
// --------------------------------------
export const getOneTransportFeeStructure = async (req, res) => {
  try {
    const structure = await getOneTransportFeeStructureService(
      req.user,
      req.params.structureId
    );

    return res.json({ structure });
  } catch (err) {
    logger.error("Get one transport fee structure error:", err);
    return res.status(404).json({ message: err.message });
  }
};

// --------------------------------------
// Get Active
// --------------------------------------
export const getActiveTransportFeeStructure = async (req, res) => {
  try {
    const structure = await getActiveTransportFeeStructureService(req.user, req.query || {});

    return res.json({ structure });
  } catch (err) {
    logger.error("Get active transport fee structure error:", err);
    return res.status(404).json({ message: err.message });
  }
};

// --------------------------------------
// Activate
// --------------------------------------
export const activateTransportFeeStructure = async (req, res) => {
  try {
    const structure = await activateTransportFeeStructureService(
      req.user,
      req.params.structureId
    );

    return res.json({
      message: "Transport fee structure activated successfully",
      structure,
    });
  } catch (err) {
    logger.error("Activate transport fee structure error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Archive
// --------------------------------------
export const archiveTransportFeeStructure = async (req, res) => {
  try {
    const structure = await archiveTransportFeeStructureService(
      req.user,
      req.params.structureId
    );

    return res.json({
      message: "Transport fee structure archived successfully",
      structure,
    });
  } catch (err) {
    logger.error("Archive transport fee structure error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Bulk Update
// --------------------------------------
export const bulkUpdateTransportFeeStructures = async (req, res) => {
  try {
    const result = await bulkUpdateTransportFeeStructuresService(
      req.user,
      req.params.routeId,
      req.body || {}
    );

    return res.json({
      message: "Transport fee structures bulk updated successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Bulk update transport fee structures error:", err);
    return res.status(400).json({ message: err.message });
  }
};