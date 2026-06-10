import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole, requireVerifiedStaff } from "../middleware/school_role.middleware.js";
import {
  createTransportFeeStructure,
  updateTransportFeeStructure,
  getTransportFeeStructures,
  getOneTransportFeeStructure,
  getActiveTransportFeeStructure,
  activateTransportFeeStructure,
  archiveTransportFeeStructure,
  bulkUpdateTransportFeeStructures,
} from "../controller/transportFeeStructure.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("school_admin"));

router.post("/create", createTransportFeeStructure);
router.get("/all", getTransportFeeStructures);
router.get("/active", getActiveTransportFeeStructure);
router.get("/detail/:structureId", getOneTransportFeeStructure);
router.patch("/update/:structureId", updateTransportFeeStructure);
router.patch("/:structureId/activate", activateTransportFeeStructure);
router.patch("/:structureId/archive", archiveTransportFeeStructure);
router.patch("/update/route/:routeId", bulkUpdateTransportFeeStructures);

export default router;