import logger from "../utils/logger.js";
import {
  createClassSectionService,
  updateClassSectionService,
  getClassSectionsService,
  getOneClassSectionService,
} from "../services/classSection.service.js";

export const createClassSection = async (req, res) => {
  try {
    const classSection = await createClassSectionService(req.user, req.body || {});
    return res.status(201).json({
      message: "Class section created successfully",
      classSection,
    });
  } catch (err) {
    logger.error("Create class section error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const updateClassSection = async (req, res) => {
  try {
    const classSection = await updateClassSectionService(
      req.user,
      req.params.classSectionId,
      req.body || {}
    );

    return res.json({
      message: "Class section updated successfully",
      classSection,
    });
  } catch (err) {
    logger.error("Update class section error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const getClassSections = async (req, res) => {
  try {
    const items = await getClassSectionsService(req.user, req.query || {});
    return res.json({
      message: "Class sections fetched successfully",
      items,
    });
  } catch (err) {
    logger.error("Get class sections error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const getOneClassSection = async (req, res) => {
  try {
    const classSection = await getOneClassSectionService(req.user, req.params.classSectionId);
    return res.json({ classSection });
  } catch (err) {
    logger.error("Get one class section error:", err);
    return res.status(404).json({ message: err.message });
  }
};