import mongoose from "mongoose";
import { BusRoute } from "../models/transport/busRoute.model.js";
import { TransportFeeStructure } from "../models/fees/transportFeeStructure.model.js";

import {
  assertAdminOnly as assertSchoolAdmin,
} from "../utils/auth.helper.js";
import {
  normalizeList as normalizeStops,
} from "../utils/format.helper.js";
import {
  normalizeBuses,
} from "../utils/transport.helper.js";
import {
  buildFilter as buildFilterGeneric,
} from "../utils/db.helper.js";

const VALID_STATUSES = ["active", "inactive", "archived"];


const buildFilter = (schoolId, query = {}) => {
  const filter = buildFilterGeneric(schoolId, query, ["status"]);

  if (query.routeName) {
    filter.routeName = { $regex: String(query.routeName).trim(), $options: "i" };
  }

  if (query.startPoint) {
    filter.startPoint = { $regex: String(query.startPoint).trim(), $options: "i" };
  }

  if (query.endPoint) {
    filter.endPoint = { $regex: String(query.endPoint).trim(), $options: "i" };
  }

  return filter;
};

// --------------------------------------
// Create Bus Route
// --------------------------------------
export const createBusRouteService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const payload = {
    school_id: user.school_id,
    routeName: String(data.routeName || "").trim(),
    buses: normalizeBuses(data.buses || []),
    startPoint: String(data.startPoint || "").trim(),
    endPoint: String(data.endPoint || "").trim(),
    stops: normalizeStops(data.stops || []),
    distanceKm: Number(data.distanceKm),
    status: data.status && VALID_STATUSES.includes(data.status) ? data.status : "active",
    createdBy: user.id,
  };

  if (!payload.routeName) throw new Error("routeName is required");
  if (!payload.startPoint) throw new Error("startPoint is required");
  if (!payload.endPoint) throw new Error("endPoint is required");
  if (Number.isNaN(payload.distanceKm)) throw new Error("distanceKm is required");

  const exists = await BusRoute.findOne({
    school_id: user.school_id,
    routeNameKey: payload.routeName.toLowerCase(),
  });

  if (exists) {
    throw new Error("Bus route already exists with this name in your school");
  }

  return await BusRoute.create(payload);
};

// --------------------------------------
// Update Bus Route
// --------------------------------------
export const updateBusRouteService = async (user, routeId, data = {}) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const route = await BusRoute.findOne({
    _id: routeId,
    school_id: user.school_id,
  });
  if (!route) {
    throw new Error("Bus route not found");
  }


  delete data.school_id;
  delete data.createdBy;
  delete data.updatedBy;

  if (data.routeName !== undefined) data.routeName = String(data.routeName).trim();
  if (data.startPoint !== undefined) data.startPoint = String(data.startPoint).trim();
  if (data.endPoint !== undefined) data.endPoint = String(data.endPoint).trim();
  if (data.distanceKm !== undefined) data.distanceKm = Number(data.distanceKm);

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    throw new Error("Invalid status value");
  }

  if (data.buses !== undefined) {
    data.buses = normalizeBuses(data.buses);
  }

  if (data.stops !== undefined) {
    data.stops = normalizeStops(data.stops);
  }

  if (data.routeName) {
    const nextRouteNameKey = data.routeName.trim().toLowerCase();
    const duplicate = await BusRoute.findOne({
      _id: { $ne: route._id },
      school_id: user.school_id,
      routeNameKey: nextRouteNameKey,
    });

    if (duplicate) {
      throw new Error("Another bus route already exists with this name in your school");
    }
  }

  Object.assign(route, data);
  route.updatedBy = user.id;

  const updatedRoute = await route.save();

  // --------------------------------------
  // Transport Fee Sync Logic
  // --------------------------------------
  const updatedStops = updatedRoute.stops || [];
  const schoolId = user.school_id;

  // 1. Find all active fee structures for this specific route
  const existingFees = await TransportFeeStructure.find({
    school_id: schoolId,
    route_id: routeId,
    status: "active",
  });

  const existingFeeStops = existingFees.map((f) => f.dropPoint);

  // 2. Identify stops to archive (exist in fees but not in updated route stops)
  // Use Case-Sensitive or Case-Insensitive? The model normalizes them to trimmed strings.
  // We'll stick to exact match of normalized strings.
  const stopsToArchive = existingFeeStops.filter((s) => !updatedStops.includes(s));

  if (stopsToArchive.length > 0) {
    await TransportFeeStructure.updateMany(
      {
        school_id: schoolId,
        route_id: routeId,
        dropPoint: { $in: stopsToArchive },
        status: "active",
      },
      {
        $set: { status: "archived", updatedBy: user.id },
      }
    );
  }

  // 3. Identify new stops needing fees (exist in route but no active fee structure yet)
  const newStopsNeedingFees = updatedStops.filter((s) => !existingFeeStops.includes(s));

  return {
    route: updatedRoute,
    transportFeeSyncRequired: stopsToArchive.length > 0 || newStopsNeedingFees.length > 0,
    archivedStops: stopsToArchive,
    newStopsNeedingFees,
  };
};

// --------------------------------------
// Get All Bus Routes
// --------------------------------------
export const getBusRoutesService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildFilter(user.school_id, query);

  const [items, total] = await Promise.all([
    BusRoute.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role"),
    BusRoute.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

// --------------------------------------
// Get One Bus Route
// --------------------------------------
export const getOneBusRouteService = async (user, routeId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const route = await BusRoute.findOne({
    _id: routeId,
    school_id: user.school_id,
  })
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (!route) {
    throw new Error("Bus route not found");
  }

  return route;
};

// --------------------------------------
// Activate Bus Route
// --------------------------------------
export const activateBusRouteService = async (user, routeId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const route = await BusRoute.findOne({
    _id: routeId,
    school_id: user.school_id,
  });
  if (!route) {
    throw new Error("Bus route not found");
  }


  route.status = "active";
  route.updatedBy = user.id;

  return await route.save();
};

// --------------------------------------
// Archive Bus Route
// --------------------------------------
export const archiveBusRouteService = async (user, routeId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const route = await BusRoute.findOne({
    _id: routeId,
    school_id: user.school_id,
  });
  if (!route) {
    throw new Error("Bus route not found");
  }


  route.status = "archived";
  route.updatedBy = user.id;

  return await route.save();
};

// --------------------------------------
// Add Stop to Route
// --------------------------------------
export const addStopToRouteService = async (user, routeId, stopName) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const normalizedStop = String(stopName || "").trim();
  if (!normalizedStop) {
    throw new Error("stopName is required");
  }

  const route = await BusRoute.findOneAndUpdate(
    { _id: routeId, school_id: user.school_id },
    {
      $addToSet: { stops: normalizedStop },
      $set: { updatedBy: user.id }
    },
    { returnDocument: "after" }
  );

  if (!route) {
    throw new Error("Bus route not found");
  }

  return route;
};

// --------------------------------------
// Update Stop in Route
// --------------------------------------
export const updateStopInRouteService = async (user, routeId, oldStopName, newStopName) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const normalizedOld = String(oldStopName || "").trim();
  const normalizedNew = String(newStopName || "").trim();

  if (!normalizedOld || !normalizedNew) {
    throw new Error("oldStopName and newStopName are required");
  }

  if (normalizedOld === normalizedNew) {
    return await BusRoute.findOne({ _id: routeId, school_id: user.school_id });
  }

  // Check if new stop name already exists in the route
  const routeExists = await BusRoute.findOne({
    _id: routeId,
    school_id: user.school_id,
    stops: normalizedNew
  });

  if (routeExists) {
    throw new Error("New stop name already exists in this route");
  }


  const route = await BusRoute.findOneAndUpdate(
    {
      _id: routeId,
      school_id: user.school_id,
      stops: normalizedOld
    },
    {
      $set: { "stops.$": normalizedNew, updatedBy: user.id }
    },
    { returnDocument: "after" }
  );

  if (!route) {
    throw new Error("Bus route not found or stop not found in route");
  }

  return route;
};

// --------------------------------------
// Remove Stop from Route
// --------------------------------------
export const removeStopFromRouteService = async (user, routeId, stopName) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  const normalizedStop = String(stopName || "").trim();
  if (!normalizedStop) {
    throw new Error("stopName is required");
  }

  const route = await BusRoute.findOneAndUpdate(
    { _id: routeId, school_id: user.school_id },
    {
      $pull: { stops: normalizedStop },
      $set: { updatedBy: user.id }
    },
    { returnDocument: "after" }
  );

  if (!route) {
    throw new Error("Bus route not found");
  }

  return route;
};