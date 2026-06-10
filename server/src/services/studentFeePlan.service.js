import { StudentFeePlan } from "../models/fees/studentFeePlan.model.js";
import { AcademicFeeStructure } from "../models/fees/academicFeeStructure.model.js";
import { TransportFeeStructure } from "../models/fees/transportFeeStructure.model.js";
import { StudentProfile } from "../models/student/student.model.js";

import { resolveStudentPortalContextService } from "../services/studentEnrollment.service.js";

export const calculateAcademicTotal = (feeHeads) => {
  return feeHeads.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateDiscountTotal = (discounts = []) => {
  return discounts.reduce((sum, item) => sum + item.amount, 0);
};

export const calculateAdditionalCharges = (charges = []) => {
  return charges.reduce((sum, item) => sum + item.amount, 0);
};

// --------------------------------------
// Create Student Fee Plan
// --------------------------------------
export const createStudentFeePlanService = async (user, data) => {
  // Protect internal paymentSummary field
  delete data.paymentSummary;

  if (user.role !== "school_admin") {
    throw new Error("Only school admin can create fee plans");
  }

  const existing = await StudentFeePlan.findOne({
    student_id: data.student_id,
    academicYear: data.academicYear,
    school_id: user.school_id
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

  const academicStructure = await AcademicFeeStructure.findOne({
    _id: data.academicFeeStructure_id,
    school_id: user.school_id,
  });
  if (!academicStructure) {
    throw new Error("Academic fee structure not found for this school");
  }

  // Security check: ensure fee structure grade matches student's requested grade
  if (student.requestedGrade && academicStructure.standard !== student.requestedGrade) {
    throw new Error(`Fee structure grade (${academicStructure.standard}) does not match student's requested grade (${student.requestedGrade})`);
  }

  let transportStructure = null;
  let totalTransportFee = 0;

  // Enforce transport requirement based on student profile
  if (student.transport_required) {
    if (!data.transportFeeStructure_id || !data.currentRoute_id) {
      throw new Error("Transport fee structure and route are required for this student");
    }

    const transportStructure = await TransportFeeStructure.findOne({
      _id: data.transportFeeStructure_id,
      school_id: user.school_id,
    });

    if (!transportStructure) {
      throw new Error("Transport fee structure not found for this school");
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

  const { paymentSummary, ...sanitizedData } = data;

  return await StudentFeePlan.create({
    ...sanitizedData,
    school_id: user.school_id,
    totalAcademicFee,
    totalTransportFee,
    totalDiscount,
    totalAdditionalCharges,
    finalPayableAmount,
    paymentSummary: {
      paidAmount: 0,
      pendingAmount: finalPayableAmount,
      paymentStatus: "unpaid",
      paymentUpdatedAt: new Date(),
    },
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
  // Protect internal paymentSummary field
  delete data.paymentSummary;

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

      const transportStructure = await TransportFeeStructure.findOne({
        _id: nextStructureId,
        school_id: user.school_id,
      });
      
      if (!transportStructure) {
        throw new Error("Transport fee structure not found for this school");
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

  // Sync pending amount ONLY if no payments have been made yet (initial state protection)
  if (plan.paymentSummary && plan.paymentSummary.paidAmount === 0) {
    plan.paymentSummary.pendingAmount = plan.finalPayableAmount;
  }

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

export const getMyFeeDetailsService = async (user, { academicYear = null, childId = null } = {}) => {
  if (!["student", "parent"].includes(user.role)) {
    throw new Error("Only student or parent can access fee details");
  }

  if (!user.school_id) {
    throw new Error("User is not linked to any school");
  }

  const { studentProfile, activeEnrollment } = await resolveStudentPortalContextService(user, { childId });

  const targetAcademicYear = String(academicYear || activeEnrollment.academicYear || "").trim();
  if (!targetAcademicYear) {
    throw new Error("academicYear is required");
  }

  const feePlan = await StudentFeePlan.findOne({
    school_id: user.school_id,
    student_id: studentProfile._id,
    academicYear: targetAcademicYear,
  })
    .populate("student_id", "student_name admission_no")
    .populate("academicFeeStructure_id")
    .populate("transportFeeStructure_id")
    .populate("currentRoute_id");

  if (!feePlan) {
    throw new Error("Fee plan not found for the selected student and academic year");
  }

  const paymentSummary = feePlan.paymentSummary || {};
  const academicFeeStructure = feePlan.academicFeeStructure_id || null;
  const transportFeeStructure = feePlan.transportFeeStructure_id || null;
  const route = feePlan.currentRoute_id || null;

  return {
    feePlan: {
      id: feePlan._id,
      academicYear: feePlan.academicYear,
      status: feePlan.status,
      finalPayableAmount: feePlan.finalPayableAmount,
      totalAcademicFee: feePlan.totalAcademicFee,
      totalTransportFee: feePlan.totalTransportFee,
      totalDiscount: feePlan.totalDiscount,
      totalAdditionalCharges: feePlan.totalAdditionalCharges,
    },
    paymentSummary: {
      paidAmount: paymentSummary.paidAmount || 0,
      pendingAmount: paymentSummary.pendingAmount || 0,
      paymentStatus: paymentSummary.paymentStatus || "unpaid",
      lastPaymentAt: paymentSummary.lastPaymentAt || null,
      lastReceipt_id: paymentSummary.lastReceipt_id || null,
      paymentUpdatedAt: paymentSummary.paymentUpdatedAt || null,
    },
    feeBreakdown: {
      academic: academicFeeStructure
        ? {
            id: academicFeeStructure._id,
            academicYear: academicFeeStructure.academicYear,
            standard: academicFeeStructure.standard,
            feeHeads: academicFeeStructure.feeHeads || [],
          }
        : null,
      transport: transportFeeStructure
        ? {
            id: transportFeeStructure._id,
            route_id: transportFeeStructure.route_id,
            pickupPoint: transportFeeStructure.pickupPoint,
            dropPoint: transportFeeStructure.dropPoint,
            amount: transportFeeStructure.amount,
            frequency: transportFeeStructure.frequency,
            route: route
              ? {
                  id: route._id,
                  routeName: route.routeName,
                  startPoint: route.startPoint,
                  endPoint: route.endPoint,
                  stops: route.stops || [],
                  distanceKm: route.distanceKm,
                  status: route.status,
                }
              : null,
          }
        : null,
      discounts: feePlan.discounts || [],
      additionalCharges: feePlan.additionalCharges || [],
    },
    student: {
      id: studentProfile._id,
      student_name: studentProfile.student_name,
      admission_no: studentProfile.admission_no,
    },
  };
};