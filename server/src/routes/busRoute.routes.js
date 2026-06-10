import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { requireRole, requireVerifiedStaff } from "../middleware/school_role.middleware.js";
import {
  createBusRoute,
  updateBusRoute,
  getBusRoutes,
  getOneBusRoute,
  activateBusRoute,
  archiveBusRoute,
  addStopToRoute,
  removeStopFromRoute,
  updateStopInRoute,
} from "../controller/busRoute.controller.js";

const router = express.Router();

router.use(authMiddleware);
router.use(requireRole("school_admin"));

router.post("/create", createBusRoute);
router.get("/all", getBusRoutes);
router.get("/detail/:routeId", getOneBusRoute);
router.patch("/update/:routeId", updateBusRoute);
router.patch("/:routeId/activate", activateBusRoute);
router.patch("/:routeId/archive", archiveBusRoute);

// Granular Stop Management
router.post("/:routeId/stops/add", addStopToRoute);
router.patch("/:routeId/stops/update", updateStopInRoute);
router.delete("/:routeId/stops/remove", removeStopFromRoute);

export default router;