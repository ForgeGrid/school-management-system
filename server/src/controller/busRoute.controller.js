import logger from "../utils/logger.js";
import {
  createBusRouteService,
  updateBusRouteService,
  getBusRoutesService,
  getOneBusRouteService,
  activateBusRouteService,
  archiveBusRouteService,
  addStopToRouteService,
  removeStopFromRouteService,
  updateStopInRouteService,
} from "../services/busRoute.service.js";

// --------------------------------------
// Create
// --------------------------------------
export const createBusRoute = async (req, res) => {
  try {
    const route = await createBusRouteService(req.user, req.body || {});

    return res.status(201).json({
      message: "Bus route created successfully",
      route,
    });
  } catch (err) {
    logger.error("Create bus route error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Bus route name already exists in this school" });
    }
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Update
// --------------------------------------
export const updateBusRoute = async (req, res) => {
  try {
    const result = await updateBusRouteService(
      req.user,
      req.params.routeId,
      req.body || {}
    );

    return res.json({
      message: "Bus route updated successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Update bus route error:", err);
    if (err.code === 11000) {
      return res.status(409).json({ message: "Bus route name already exists in this school" });
    }
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Get All
// --------------------------------------
export const getBusRoutes = async (req, res) => {
  try {
    const result = await getBusRoutesService(req.user, req.query || {});

    return res.json({
      message: "Bus routes fetched successfully",
      ...result,
    });
  } catch (err) {
    logger.error("Get bus routes error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Get One
// --------------------------------------
export const getOneBusRoute = async (req, res) => {
  try {
    const route = await getOneBusRouteService(req.user, req.params.routeId);

    return res.json({ route });
  } catch (err) {
    logger.error("Get one bus route error:", err);
    return res.status(404).json({ message: err.message });
  }
};

// --------------------------------------
// Activate
// --------------------------------------
export const activateBusRoute = async (req, res) => {
  try {
    const route = await activateBusRouteService(req.user, req.params.routeId);

    return res.json({
      message: "Bus route activated successfully",
      route,
    });
  } catch (err) {
    logger.error("Activate bus route error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Archive
// --------------------------------------
export const archiveBusRoute = async (req, res) => {
  try {
    const route = await archiveBusRouteService(req.user, req.params.routeId);

    return res.json({
      message: "Bus route archived successfully",
      route,
    });
  } catch (err) {
    logger.error("Archive bus route error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Add Stop
// --------------------------------------
export const addStopToRoute = async (req, res) => {
  try {
    const route = await addStopToRouteService(
      req.user,
      req.params.routeId,
      req.body.stopName
    );

    return res.json({
      message: "Stop added successfully",
      route,
    });
  } catch (err) {
    logger.error("Add stop error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Update Stop
// --------------------------------------
export const updateStopInRoute = async (req, res) => {
  try {
    const route = await updateStopInRouteService(
      req.user,
      req.params.routeId,
      req.body.oldStopName,
      req.body.newStopName
    );

    return res.json({
      message: "Stop updated successfully",
      route,
    });
  } catch (err) {
    logger.error("Update stop error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// --------------------------------------
// Remove Stop
// --------------------------------------
export const removeStopFromRoute = async (req, res) => {
  try {
    const route = await removeStopFromRouteService(
      req.user,
      req.params.routeId,
      req.body.stopName
    );

    return res.json({
      message: "Stop removed successfully",
      route,
    });
  } catch (err) {
    logger.error("Remove stop error:", err);
    return res.status(400).json({ message: err.message });
  }
};