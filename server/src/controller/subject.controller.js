import {
  createSubjectService,
  getSubjectsService,
  getSubjectByIdService,
  updateSubjectService,
  deleteSubjectService,
} from "../services/subject.service.js";

export const createSubject = async (req, res, next) => {
  try {
    const subject = await createSubjectService(req.user, req.body);
    return res.status(201).json({
      success: true,
      message: "Subject created successfully",
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjects = async (req, res, next) => {
  try {
    const result = await getSubjectsService(req.user, req.query);
    return res.status(200).json({
      success: true,
      message: "Subjects fetched successfully",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubjectById = async (req, res, next) => {
  try {
    const subject = await getSubjectByIdService(req.user, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Subject fetched successfully",
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req, res, next) => {
  try {
    const subject = await updateSubjectService(req.user, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req, res, next) => {
  try {
    const subject = await deleteSubjectService(req.user, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Subject deactivated successfully",
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};