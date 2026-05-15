import { StudentFeePlan } from "../models/fees/studentFeePlan.model.js";
import { AcademicFeeStructure } from "../models/fees/academicFeeStructure.model.js";
import { TransportFeeStructure } from "../models/fees/transportFeeStructure.model.js";
import { StudentProfile } from "../models/student/student.model.js";

const calculateAcademicTotal = (feeHeads) => {
  return feeHeads.reduce((sum, item) => sum + item.amount, 0);
};

const calculateDiscountTotal = (discounts = []) => {
  return discounts.reduce((sum, item) => sum + item.amount, 0);
};

const calculateAdditionalCharges = (charges = []) => {
  return charges.reduce((sum, item) => sum + item.amount, 0);
};

// --------------------------------------
// Create Student Fee Plan
// --------------------------------------
export const createStudentFeePlanService = async (user, data) => {
  if (user.role !== "school_admin") {
    throw new Error("Only school admin can create fee plans");
  }

  const existing = await StudentFeePlan.findOne({
    student_id: data.student_id,
    academicYear: data.academicYear
  });

  if (existing) {
    throw new Error("Fee plan already exists for this student");
  }

  const student = await StudentProfile.findById(data.student_id);

  if (!student) {
    throw new Error("Student not found");
  }

  if (student.school_id.toString() !== user.school_id.toString()) {
    throw new Error("Unauthorized student access");
  }

  const academicStructure = await AcademicFeeStructure.findById(
    data.academicFeeStructure_id
  );

  if (!academicStructure) {
    throw new Error("Academic fee structure not found");
  }

  let transportStructure = null;
  let totalTransportFee = 0;

  // Enforce transport requirement based on student profile
  if (student.transport_required) {
    if (!data.transportFeeStructure_id || !data.currentRoute_id) {
      throw new Error("Transport fee structure and route are required for this student");
    }

    transportStructure = await TransportFeeStructure.findById(
      data.transportFeeStructure_id
    );

    if (!transportStructure) {
      throw new Error("Transport fee structure not found");
    }

    if (transportStructure.route_id.toString() !== data.currentRoute_id.toString()) {
      throw new Error("Selected transport fee does not belong to the selected route");
    }

    // Calculation logic (can be adjusted based on frequency)
    totalTransportFee = transportStructure.amount * 12;
  } else {
    // Force transport fields to null if not required
    data.transportFeeStructure_id = null;
    data.currentRoute_id = null;
  }

  const totalAcademicFee = calculateAcademicTotal(
    academicStructure.feeHeads
  );

  const totalDiscount = calculateDiscountTotal(
    data.discounts || []
  );

  const totalAdditionalCharges = calculateAdditionalCharges(
    data.additionalCharges || []
  );

  const finalPayableAmount =
    totalAcademicFee +
    totalTransportFee +
    totalAdditionalCharges -
    totalDiscount;

  return await StudentFeePlan.create({
    ...data,
    school_id: user.school_id,
    totalAcademicFee,
    totalTransportFee,
    totalDiscount,
    totalAdditionalCharges,
    finalPayableAmount,
    createdBy: user.id
  });
};

// --------------------------------------
// Update Student Fee Plan
// --------------------------------------
export const updateStudentFeePlanService = async (
  planId,
  user,
  data
) => {
  const plan = await StudentFeePlan.findById(planId);

  if (!plan) {
    throw new Error("Fee plan not found");
  }

  if (plan.school_id.toString() !== user.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

  const student = await StudentProfile.findById(plan.student_id);
  if (!student) {
    throw new Error("Associated student profile not found");
  }

  // Handle transport updates
  if (data.transportFeeStructure_id !== undefined || data.currentRoute_id !== undefined) {
    // If student requires transport
    if (student.transport_required) {
      const nextStructureId = data.transportFeeStructure_id || plan.transportFeeStructure_id;
      const nextRouteId = data.currentRoute_id || plan.currentRoute_id;

      if (!nextStructureId || !nextRouteId) {
         throw new Error("Both transport structure and route are required");
      }

      const transportStructure = await TransportFeeStructure.findById(nextStructureId);
      if (!transportStructure) {
        throw new Error("Transport fee structure not found");
      }

      if (transportStructure.route_id.toString() !== nextRouteId.toString()) {
        throw new Error("Selected transport fee does not belong to the selected route");
      }

      plan.transportFeeStructure_id = nextStructureId;
      plan.currentRoute_id = nextRouteId;
      plan.totalTransportFee = transportStructure.amount * 12;
    } else {
      // If student does not require transport, force it to null
      plan.transportFeeStructure_id = null;
      plan.currentRoute_id = null;
      plan.totalTransportFee = 0;
    }
  } else if (!student.transport_required) {
    // Sync check: if profile changed to false, ensure plan is updated
    plan.transportFeeStructure_id = null;
    plan.currentRoute_id = null;
    plan.totalTransportFee = 0;
  }

  if (data.discounts) {
    plan.discounts = data.discounts;
    plan.totalDiscount = calculateDiscountTotal(plan.discounts);
  }

  if (data.additionalCharges) {
    plan.additionalCharges = data.additionalCharges;
    plan.totalAdditionalCharges = calculateAdditionalCharges(plan.additionalCharges);
  }

  // Final Recalculation
  plan.finalPayableAmount =
    plan.totalAcademicFee +
    plan.totalTransportFee +
    plan.totalAdditionalCharges -
    plan.totalDiscount;

  plan.updatedBy = user.id;
  await plan.save();
  
  return plan;
};

export const getStudentFeePlanService = async (
  studentId,
  academicYear,
  user
) => {
  return await StudentFeePlan.findOne({
    student_id: studentId,
    academicYear,
    school_id: user.school_id
  })
    .populate("student_id")
    .populate("academicFeeStructure_id")
    .populate("transportFeeStructure_id")
    .populate("currentRoute_id");
};

export const cancelStudentFeePlanService = async (
  planId,
  user
) => {
  const plan = await StudentFeePlan.findById(planId);

  if (!plan) {
    throw new Error("Fee plan not found");
  }

  if (plan.school_id.toString() !== user.school_id.toString()) {
    throw new Error("Unauthorized access");
  }

  plan.status = "cancelled";
  plan.updatedBy = user.id;

  await plan.save();

  return plan;
};