import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/school_role.middleware.js";
import { requireVerifiedSchool } from "../middleware/school_auth.middleware.js";
import {
  createClassSection,
  updateClassSection,
  getClassSections,
  getOneClassSection,
} from "../controller/classSection.controller.js";

const router = express.Router();

// All routes require authenticated user and verified active school
router.use(authMiddleware, requireVerifiedSchool);

router.post("/create", requireRole("school_admin"), createClassSection);
router.patch("/update/:classSectionId", requireRole("school_admin"), updateClassSection);
router.get("/all", requireRole("school_admin"), getClassSections);
router.get("/detail/:classSectionId", requireRole("school_admin"), getOneClassSection);

export default router;
