import logger from "../utils/logger.js";
import {
  createClassSectionService,
  updateClassSectionService,
  getClassSectionsService,
  getOneClassSectionService,
  getMyClassIntroService,
  getClassSectionHubService,
  getMyClassesService,
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

// --------------------------------------
// GET /api/student/class-intro
// Query: ?childId=<id>  (optional, used when a parent is viewing a specific child)
// Access: student, parent
// --------------------------------------
export const getMyClassIntroController = async (req, res, next) => {
  try {
    const { childId } = req.query;

    const result = await getMyClassIntroService(req.user, {
      childId: childId || null,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

// --------------------------------------
// GET /api/class-sections/:classSectionId/hub
// Query: ?attendanceDate=YYYY-MM-DD  (optional, defaults to today)
// Access: school_admin, class_teacher, subject_teacher
// --------------------------------------
export const getClassSectionHub = async (req, res, next) => {
  try {
    const { classSectionId } = req.params;
    const { attendanceDate } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await getClassSectionHubService(req.user, classSectionId, {
      attendanceDate: attendanceDate ? new Date(attendanceDate) : today,
    });

    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};

// --------------------------------------
// GET /api/class-sections/my-classes
// Access: teacher (verified staff only)
// --------------------------------------
export const getMyClassesController = async (req, res, next) => {
  try {
    const result = await getMyClassesService(req.user);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return next(err);
  }
};