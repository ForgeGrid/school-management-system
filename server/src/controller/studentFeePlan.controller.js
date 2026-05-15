import logger from "../utils/logger.js";
import {
  createStudentFeePlanService,
  updateStudentFeePlanService,
  getStudentFeePlanService,
  cancelStudentFeePlanService
} from "../services/studentFeePlan.service.js";

export const createStudentFeePlan = async (req, res) => {
  try {
    const plan = await createStudentFeePlanService(
      req.user,
      req.body
    );

    return res.status(201).json({
      message: "Student fee plan created successfully",
      plan
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      message: err.message
    });
  }
};

export const updateStudentFeePlan = async (req, res) => {
  try {
    const plan = await updateStudentFeePlanService(
      req.params.planId,
      req.user,
      req.body
    );

    return res.json({
      message: "Fee plan updated successfully",
      plan
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      message: err.message
    });
  }
};

export const getStudentFeePlan = async (req, res) => {
  try {
    const plan = await getStudentFeePlanService(
      req.params.studentId,
      req.query.academicYear,
      req.user
    );

    return res.json({ plan });
  } catch (err) {
    logger.error(err);
    return res.status(404).json({
      message: err.message
    });
  }
};

export const cancelStudentFeePlan = async (req, res) => {
  try {
    const plan = await cancelStudentFeePlanService(
      req.params.planId,
      req.user
    );

    return res.json({
      message: "Fee plan cancelled successfully",
      plan
    });
  } catch (err) {
    logger.error(err);
    return res.status(400).json({
      message: err.message
    });
  }
};