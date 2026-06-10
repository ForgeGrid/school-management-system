import { Router } from "express";
import {
    createFeePaymentController,
    reverseFeePaymentController,
    getAllFeeReceiptsController,
    getStudentReceiptHistoryController,
    getMyFeeReceiptsController,
    getMyReceiptDetailController,
} from "../controller/feeReceipt.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";
import {
    requireActiveSchool,
    requireVerifiedSchool
} from "../middleware/school_auth.middleware.js";
import { requireRole, requireVerifiedStaff } from "../middleware/school_role.middleware.js";

const router = Router();

// Global Authentication
router.use(authMiddleware, requireVerifiedStaff);

// Admin / Staff
router.post(
    "/create",
    requireVerifiedSchool,
    requireRole("school_admin", "staff"),
    createFeePaymentController
);

router.patch(
    "/reverse/:receiptId",
    requireVerifiedSchool,
    requireRole("school_admin", "staff"),
    reverseFeePaymentController
);

router.get(
    "/all",
    requireActiveSchool,
    requireRole("school_admin", "staff"),
    getAllFeeReceiptsController
);

router.get(
    "/history/:studentId",
    requireActiveSchool,
    requireRole("school_admin", "staff"),
    getStudentReceiptHistoryController
);

// Parent / Student
router.get(
    "/me/all",
    requireActiveSchool,
    requireRole("parent", "student"),
    getMyFeeReceiptsController
);

router.get(
    "/me/detail/:receiptId",
    requireActiveSchool,
    requireRole("parent", "student"),
    getMyReceiptDetailController
);

export default router;