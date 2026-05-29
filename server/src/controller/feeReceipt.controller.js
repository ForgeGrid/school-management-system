import {
  createFeePaymentService,
  reverseFeePaymentService,
  getAllFeeReceiptsService,
  getStudentReceiptHistoryService,
  getMyFeeReceiptsService,
  getMyReceiptDetailService,
} from "../services/feeReceipt.service.js";
import logger from "../utils/logger.js";

const sendError = (res, err, fallbackMessage = "Request failed", statusCode = 400) => {
  logger.error(err);
  return res.status(statusCode).json({
    message: err?.message || fallbackMessage,
  });
};

export const createFeePaymentController = async (req, res) => {
  try {
    const result = await createFeePaymentService(req.user, req.body);
    return res.status(201).json({
      message: "Fee receipt created successfully",
      ...result,
    });
  } catch (err) {
    return sendError(res, err, "Failed to create fee receipt", 400);
  }
};

export const reverseFeePaymentController = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const result = await reverseFeePaymentService(req.user, receiptId, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err, "Failed to reverse fee receipt", 400);
  }
};

export const getAllFeeReceiptsController = async (req, res) => {
  try {
    const result = await getAllFeeReceiptsService(req.user, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err, "Failed to fetch fee receipts", 400);
  }
};

export const getStudentReceiptHistoryController = async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await getStudentReceiptHistoryService(req.user, studentId, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err, "Failed to fetch student receipt history", 400);
  }
};

export const getMyFeeReceiptsController = async (req, res) => {
  try {
    const result = await getMyFeeReceiptsService(req.user, req.query);
    return res.status(200).json(result);
  } catch (err) {
    return sendError(res, err, "Failed to fetch my fee receipts", 400);
  }
};

export const getMyReceiptDetailController = async (req, res) => {
  try {
    const { receiptId } = req.params;
    const receipt = await getMyReceiptDetailService(req.user, receiptId);
    return res.status(200).json(receipt);
  } catch (err) {
    return sendError(res, err, "Failed to fetch receipt details", 400);
  }
};