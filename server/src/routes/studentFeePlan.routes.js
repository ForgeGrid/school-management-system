import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import {
  createStudentFeePlan,
  updateStudentFeePlan,
  getStudentFeePlan,
  cancelStudentFeePlan,
} from "../controller/studentFeePlan.controller.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Only school admin can manage student fee plans
router.use(requireRole("school_admin"));

router.post("/create", createStudentFeePlan);
router.get("/detail/:studentId", getStudentFeePlan);
router.patch("/update/:planId", updateStudentFeePlan);
router.patch("/cancel/:planId", cancelStudentFeePlan);

export default router;