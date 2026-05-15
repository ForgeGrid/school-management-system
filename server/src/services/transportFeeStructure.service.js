import mongoose from "mongoose";
import { TransportFeeStructure } from "../models/fees/transportFeeStructure.model.js";
import { BusRoute } from "../models/transport/busRoute.model.js";
import logger from "../utils/logger.js";

const VALID_STATUSES = ["active", "inactive", "archived"];

const assertSchoolAdmin = (user) => {
  if (!user || user.role !== "school_admin") {
    throw new Error("Only school admin can manage transport fee structure");
  }
  if (!user.school_id) {
    throw new Error("User is not associated with any school");
  }
};

const assertOwnSchool = (doc, user) => {
  if (!doc || doc.school_id.toString() !== user.school_id.toString()) {
    throw new Error("Unauthorized access");
  }
};

const normalizePoint = (value) => String(value || "").trim();

const buildFilter = (schoolId, query = {}) => {
  const filter = { school_id: schoolId };

  if (query.academicYear) filter.academicYear = String(query.academicYear).trim();
  if (query.status && VALID_STATUSES.includes(query.status)) filter.status = query.status;
  if (query.route_id && mongoose.Types.ObjectId.isValid(query.route_id)) {
    filter.route_id = query.route_id;
  }
  if (query.dropPoint) {
    filter.dropPoint = { $regex: String(query.dropPoint).trim(), $options: "i" };
  }

  return filter;
};

const validateDropPointAgainstRoute = (route, dropPoint) => {
  const validPoints = new Set([
    route.endPoint?.toLowerCase(),
    ...(route.stops || []).map((s) => String(s).toLowerCase()),
  ]);

  if (!validPoints.has(String(dropPoint).toLowerCase())) {
    throw new Error(`dropPoint '${dropPoint}' must match the route stop or end point`);
  }
};

// --------------------------------------
// Create Transport Fee Structure
// --------------------------------------
export const createTransportFeeStructureService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const { academicYear, route_id, frequency, pricing, status } = data;

  if (!mongoose.Types.ObjectId.isValid(route_id)) {
    throw new Error("Valid route_id is required");
  }

  const route = await BusRoute.findById(route_id);
  if (!route) {
    throw new Error("Bus route not found");
  }

  assertOwnSchool(route, user);

  if (!academicYear) throw new Error("academicYear is required");
  if (!frequency) throw new Error("frequency is required");
  if (!Array.isArray(pricing) || pricing.length === 0) {
    throw new Error("pricing array with at least one entry is required");
  }

  const structuresToCreate = [];
  const currentStatus = status && VALID_STATUSES.includes(status) ? status : "active";

  for (const item of pricing) {
    const dropPoint = normalizePoint(item.dropPoint);
    const amount = Number(item.amount);

    if (!dropPoint) throw new Error("dropPoint is required for each pricing entry");
    if (Number.isNaN(amount)) throw new Error("valid amount is required for each pricing entry");

    validateDropPointAgainstRoute(route, dropPoint);

    // Check for duplicates
    const exists = await TransportFeeStructure.findOne({
      school_id: user.school_id,
      academicYear: String(academicYear).trim(),
      route_id,
      dropPointKey: dropPoint.toLowerCase(),
    });

    if (exists) {
      throw new Error(`Transport fee structure already exists for drop point: ${dropPoint}`);
    }

    structuresToCreate.push({
      school_id: user.school_id,
      academicYear: String(academicYear).trim(),
      route_id,
      dropPoint,
      dropPointKey: dropPoint.toLowerCase(),
      amount,
      frequency,
      status: currentStatus,
      createdBy: user.id,
    });
  }

  return await TransportFeeStructure.insertMany(structuresToCreate);
};

// --------------------------------------
// Update Transport Fee Structure
// --------------------------------------
export const updateTransportFeeStructureService = async (user, structureId, data = {}) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid transport fee structure id");
  }

  const structure = await TransportFeeStructure.findById(structureId);
  if (!structure) {
    throw new Error("Transport fee structure not found");
  }

  assertOwnSchool(structure, user);

  delete data.school_id;
  delete data.createdBy;
  delete data.updatedBy;

  if (data.academicYear !== undefined) data.academicYear = String(data.academicYear).trim();
  if (data.dropPoint !== undefined) data.dropPoint = normalizePoint(data.dropPoint);
  if (data.amount !== undefined) data.amount = Number(data.amount);

  if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
    throw new Error("Invalid status value");
  }

  if (data.route_id !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(data.route_id)) {
      throw new Error("Invalid route_id");
    }

    const route = await BusRoute.findById(data.route_id);
    if (!route) {
      throw new Error("Bus route not found");
    }
    assertOwnSchool(route, user);

    if (data.dropPoint !== undefined) {
      validateDropPointAgainstRoute(route, data.dropPoint);
    } else {
      validateDropPointAgainstRoute(route, structure.dropPoint);
    }
  } else if (data.dropPoint !== undefined) {
    const route = await BusRoute.findById(structure.route_id);
    if (!route) {
      throw new Error("Linked bus route not found");
    }
    validateDropPointAgainstRoute(route, data.dropPoint);
  }

  const nextAcademicYear =
    data.academicYear !== undefined ? data.academicYear : structure.academicYear;
  const nextRouteId = data.route_id !== undefined ? data.route_id : structure.route_id;
  const nextDropPoint = data.dropPoint !== undefined ? data.dropPoint : structure.dropPoint;

  const duplicate = await TransportFeeStructure.findOne({
    _id: { $ne: structure._id },
    school_id: user.school_id,
    academicYear: nextAcademicYear,
    route_id: nextRouteId,
    dropPointKey: nextDropPoint.toLowerCase(),
  });

  if (duplicate) {
    throw new Error(
      "Another transport fee structure already exists for the same route and drop point"
    );
  }

  const oldAmount = structure.amount;
  Object.assign(structure, data);
  structure.updatedBy = user.id;

  const updatedDoc = await structure.save();

  if (data.amount !== undefined && data.amount !== oldAmount) {
    logger.info(
      `Transport Fee Audit: FeeID ${structureId} amount updated from ${oldAmount} to ${data.amount} by ${user.id}`
    );
  }

  return updatedDoc;
};

// --------------------------------------
// Bulk Update Transport Fee Structures
// --------------------------------------
export const bulkUpdateTransportFeeStructuresService = async (user, routeId, data = {}) => {
  assertSchoolAdmin(user);

  const { academicYear, frequency, stops } = data;

  if (!mongoose.Types.ObjectId.isValid(routeId)) {
    throw new Error("Invalid route id");
  }

  if (!academicYear) throw new Error("academicYear is required");
  if (!frequency) throw new Error("frequency is required");
  if (!Array.isArray(stops)) throw new Error("stops must be an array");

  const route = await BusRoute.findById(routeId);
  if (!route) throw new Error("Bus route not found");
  assertOwnSchool(route, user);

  // Validate all drop points in payload exist in route
  for (const stop of stops) {
    validateDropPointAgainstRoute(route, stop.dropPoint);
    if (stop.amount < 0) throw new Error(`Invalid amount for stop: ${stop.dropPoint}`);
  }

  // Prevent duplicate dropPoints in request payload
  const dropPointsInPayload = stops.map((s) => normalizePoint(s.dropPoint).toLowerCase());
  if (new Set(dropPointsInPayload).size !== dropPointsInPayload.length) {
    throw new Error("Duplicate drop points found in request payload");
  }



  try {
    const existingFees = await TransportFeeStructure.find({
      school_id: user.school_id,
      route_id: routeId,
      academicYear: String(academicYear).trim(),
    }).lean();

    const existingFeeMap = new Map();
    existingFees.forEach((fee) => {
      existingFeeMap.set(fee.dropPoint.toLowerCase(), fee);
    });

    const bulkOps = [];
    const auditLogs = { created: [], updated: [], archived: [] };

    const payloadDropPoints = new Set();

    for (const stop of stops) {
      const normalizedDropPoint = normalizePoint(stop.dropPoint);
      const key = normalizedDropPoint.toLowerCase();
      payloadDropPoints.add(key);

      const existingFee = existingFeeMap.get(key);

      if (existingFee) {
        // Update if amount or status changed
        const amountChanged = stop.amount !== undefined && stop.amount !== existingFee.amount;
        const statusChanged = stop.status !== undefined && stop.status !== existingFee.status;

        if (amountChanged || statusChanged) {
          const updateFields = { updatedBy: user.id };
          if (amountChanged) {
            updateFields.amount = Number(stop.amount);
            auditLogs.updated.push({
              dropPoint: normalizedDropPoint,
              old: existingFee.amount,
              new: stop.amount,
            });
          }
          if (statusChanged) updateFields.status = stop.status;

          bulkOps.push({
            updateOne: {
              filter: { _id: existingFee._id },
              update: { $set: updateFields },
            },
          });
        }
      } else {
        // Create new record
        bulkOps.push({
          insertOne: {
            document: {
              school_id: user.school_id,
              academicYear: String(academicYear).trim(),
              route_id: routeId,
              dropPoint: normalizedDropPoint,
              dropPointKey: normalizedDropPoint.toLowerCase(),
              amount: Number(stop.amount),
              frequency,
              status: stop.status || "active",
              createdBy: user.id,
            },
          },
        });
        auditLogs.created.push(normalizedDropPoint);
      }
    }

    // Archive missing stops
    existingFees.forEach((fee) => {
      if (!payloadDropPoints.has(fee.dropPoint.toLowerCase()) && fee.status !== "archived") {
        bulkOps.push({
          updateOne: {
            filter: { _id: fee._id },
            update: { $set: { status: "archived", updatedBy: user.id } },
          },
        });
        auditLogs.archived.push(fee.dropPoint);
      }
    });

    if (bulkOps.length > 0) {
      await TransportFeeStructure.bulkWrite(bulkOps);
    }



    logger.info(
      `Transport Bulk Audit: Route ${routeId} bulk updated by ${user.id}. ` +
        `Created: ${auditLogs.created.length}, Updated: ${auditLogs.updated.length}, Archived: ${auditLogs.archived.length}`
    );

    return {
      success: true,
      summary: auditLogs,
    };
  } catch (err) {
    throw err;
  }
};

// --------------------------------------
// Get All Transport Fee Structures
// --------------------------------------
export const getTransportFeeStructuresService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;

  const filter = buildFilter(user.school_id, query);

  const [items, total] = await Promise.all([
    TransportFeeStructure.find(filter)
      .sort({ academicYear: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("route_id", "routeName startPoint endPoint distanceKm status")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role"),
    TransportFeeStructure.countDocuments(filter),
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
// Get One Transport Fee Structure
// --------------------------------------
export const getOneTransportFeeStructureService = async (user, structureId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid transport fee structure id");
  }

  const structure = await TransportFeeStructure.findById(structureId)
    .populate("route_id", "routeName startPoint endPoint stops distanceKm status")
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (!structure) {
    throw new Error("Transport fee structure not found");
  }

  assertOwnSchool(structure, user);
  return structure;
};

// --------------------------------------
// Get Active by Route
// --------------------------------------
export const getActiveTransportFeeStructureService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  if (!query.academicYear) {
    throw new Error("academicYear is required");
  }

  if (!mongoose.Types.ObjectId.isValid(query.route_id)) {
    throw new Error("Valid route_id is required");
  }

  const structure = await TransportFeeStructure.findOne({
    school_id: user.school_id,
    academicYear: String(query.academicYear).trim(),
    route_id: query.route_id,
    dropPoint: query.dropPoint ? normalizePoint(query.dropPoint) : { $exists: true },
    status: "active",
  })
    .populate("route_id", "routeName startPoint endPoint stops distanceKm status")
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (!structure) {
    throw new Error("Active transport fee structure not found");
  }

  return structure;
};

// --------------------------------------
// Activate
// --------------------------------------
export const activateTransportFeeStructureService = async (user, structureId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid transport fee structure id");
  }

  const structure = await TransportFeeStructure.findById(structureId);
  if (!structure) {
    throw new Error("Transport fee structure not found");
  }

  assertOwnSchool(structure, user);

  structure.status = "active";
  structure.updatedBy = user.id;

  return await structure.save();
};

// --------------------------------------
// Archive
// --------------------------------------
export const archiveTransportFeeStructureService = async (user, structureId) => {
  assertSchoolAdmin(user);

  if (!mongoose.Types.ObjectId.isValid(structureId)) {
    throw new Error("Invalid transport fee structure id");
  }

  const structure = await TransportFeeStructure.findById(structureId);
  if (!structure) {
    throw new Error("Transport fee structure not found");
  }

  assertOwnSchool(structure, user);

  structure.status = "archived";
  structure.updatedBy = user.id;

  return await structure.save();
};