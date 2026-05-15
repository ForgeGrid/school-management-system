import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import {
  createAcademicFeeStructure,
  updateAcademicFeeStructure,
  getAcademicFeeStructures,
  getOneAcademicFeeStructure,
  getActiveAcademicFeeStructure,
  activateAcademicFeeStructure,
  archiveAcademicFeeStructure,
} from "../controller/academicFeeStructure.controller.js";

const router = express.Router();

// All routes require auth
router.use(authMiddleware);

// Only school admin can manage academic fee structure
router.use(requireRole("school_admin"));

router.post("/create", createAcademicFeeStructure);
router.get("/all", getAcademicFeeStructures);
router.get("/active", getActiveAcademicFeeStructure);
router.get("/detail/:structureId", getOneAcademicFeeStructure);
router.patch("/update/:structureId", updateAcademicFeeStructure);
router.patch("/:structureId/activate", activateAcademicFeeStructure);
router.patch("/:structureId/archive", archiveAcademicFeeStructure);

export default router;
