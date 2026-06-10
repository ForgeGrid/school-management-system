import mongoose from "mongoose";

import { StudentProfile } from "../models/student/student.model.js";
import { ParentProfile } from "../models/parent/parentProfile.model.js";
import { StudentEnrollment } from "../models/student/studentEnrollment.model.js";
import { ClassSection } from "../models/academic/classSection.model.js";
import { checkTransactionSupport } from "../utils/transactionHelper.js";

import {
  assertAdminOnly as assertSchoolAdmin,
} from "../utils/auth.helper.js";
import {
  normalizeText as normalize,
} from "../utils/format.helper.js";
import {
  getNumericStandard,
  derivePreviousAcademicYear,
} from "../utils/academic.helper.js";
import {
  getClassSectionOrThrow as getTargetClassSectionGeneric,
} from "../utils/db.helper.js";


const getCandidateSortKey = (item = {}) => {
  const name = String(item?.student?.student_name || item?.student_name || "")
    .trim()
    .toLowerCase();

  const admissionNo = String(item?.student?.admission_no || item?.admission_no || "")
    .trim()
    .toLowerCase();

  return { name, admissionNo };
};

const sortAllocationCandidatesAlphabetically = (items = []) => {
  return [...items].sort((a, b) => {
    const aKey = getCandidateSortKey(a);
    const bKey = getCandidateSortKey(b);

    if (aKey.name !== bKey.name) {
      return aKey.name.localeCompare(bKey.name);
    }

    return aKey.admissionNo.localeCompare(bKey.admissionNo);
  });
};


// --------------------------------------------------
// Internal: already-allocated student IDs for a year
// --------------------------------------------------
const getAlreadyAllocatedIds = async (schoolId, academicYear) => {
  const enrollments = await StudentEnrollment.find({
    school_id: schoolId,
    academicYear,
  }).select("student_id");

  return new Set(enrollments.map((e) => String(e.student_id)));
};


// --------------------------------------------------
// Internal: build grouped candidate map
// Returns { targetAcademicYear, targetStandard, previousAcademicYear, new_admissions[], promotions[] }
// This is the source of truth for candidate eligibility.
// --------------------------------------------------
const buildCandidateMap = async (user, { academicYear, classSection }) => {
  const targetAcademicYear = normalize(academicYear);
  const targetStandard = normalize(classSection.standard);
  const targetStandardNum = getNumericStandard(targetStandard);
  const previousAcademicYear = derivePreviousAcademicYear(targetAcademicYear);
  const allocatedIds = await getAlreadyAllocatedIds(user.school_id, targetAcademicYear);

  const new_admissions = [];
  const promotions = [];
  const seenIds = new Set();

  // 1) New admissions — students with a requestedGrade matching the target standard
  const newAdmissionStudents = await StudentProfile.find({
    school_id: user.school_id,
    status: "active",
    requestedGrade: targetStandard,
    _id: { $nin: [...allocatedIds] },
  })
    .populate("user_id", "name email role profile_avatar status")
    .sort({ student_name: 1, admission_no: 1 });

  for (const student of newAdmissionStudents) {
    const sid = String(student._id);
    seenIds.add(sid);
    new_admissions.push({
      student,
      sourceType: "new_admission",
      previousEnrollment_id: null,
      previousEnrollment: null,
    });
  }

  // 2) Promotion candidates — students active in the previous year at standard - 1
  if (previousAcademicYear && targetStandardNum !== null && targetStandardNum > 1) {
    const previousEnrollments = await StudentEnrollment.find({
      school_id: user.school_id,
      academicYear: previousAcademicYear,
      isActive: true,
    })
      .populate({
        path: "student_id",
        populate: {
          path: "user_id",
          select: "name email role profile_avatar status",
        },
      })
      .populate("classSection_id", "academicYear standard section classCode");

    for (const enrollment of previousEnrollments) {
      const prevStandardNum = getNumericStandard(enrollment.classSection_id?.standard);
      if (prevStandardNum !== targetStandardNum - 1) continue;

      const student = enrollment.student_id;
      if (!student) continue;

      const sid = String(student._id);
      if (allocatedIds.has(sid)) continue;  // already enrolled in target year
      if (seenIds.has(sid)) continue;        // prevent duplicates (edge-case: also a new admission)

      seenIds.add(sid);
      promotions.push({
        student,
        sourceType: "promotion",
        previousEnrollment_id: enrollment._id,
        previousEnrollment: enrollment,
      });
    }
  }

  // Sort each group alphabetically
  const sortFn = (a, b) => {
    const aName = String(a.student.student_name || "").toLowerCase();
    const bName = String(b.student.student_name || "").toLowerCase();
    if (aName !== bName) return aName.localeCompare(bName);
    return String(a.student.admission_no || "").localeCompare(String(b.student.admission_no || ""));
  };

  new_admissions.sort(sortFn);
  promotions.sort(sortFn);

  return {
    targetAcademicYear,
    targetStandard,
    previousAcademicYear,
    new_admissions,
    promotions,
  };
};


// --------------------------------------------------
// Internal: DB write helper — creates enrollment rows and marks previous records inactive.
// ALL DB commits go through here. This is the single write source of truth.
// --------------------------------------------------
const allocateStudentRows = async ({
  user,
  classSection,
  academicYear,
  selectedCandidates,
}) => {
  let session = null;
  const useTransaction = await checkTransactionSupport();

  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (error) {
      session = null;
    }
  }

  try {
    // Re-fetch class section inside the transaction for accurate capacity
    const classSectionFresh = await ClassSection.findOne({
      _id: classSection._id,
      school_id: user.school_id,
    }).session(session);

    if (!classSectionFresh) {
      throw new Error("Class section not found");
    }

    const remainingSeats = classSectionFresh.capacity - classSectionFresh.currentStrength;
    if (selectedCandidates.length > remainingSeats) {
      throw new Error(
        `Not enough seats: ${remainingSeats} available, ${selectedCandidates.length} requested`
      );
    }

    const nextRollStart = classSectionFresh.currentStrength + 1;

    // ---------- Build enrollment documents ----------
    const enrollmentsToCreate = selectedCandidates.map((candidate, index) => ({
      school_id: user.school_id,
      academicYear,
      student_id: candidate.student._id,
      classSection_id: classSectionFresh._id,
      roll_no: nextRollStart + index,
      previousEnrollment_id:
        candidate.sourceType === "promotion" ? candidate.previousEnrollment_id : null,
      enrollmentType:
        candidate.sourceType === "promotion" ? "promotion" : "new_admission",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    }));

    const createdEnrollments = await StudentEnrollment.insertMany(
      enrollmentsToCreate,
      { session }
    );

    // ---------- Update class section strength ----------
    classSectionFresh.currentStrength += createdEnrollments.length;
    classSectionFresh.updatedBy = user.id;
    await classSectionFresh.save({ session });

    // ---------- Mark previous enrollments inactive (promotions) ----------
    const promotionPrevIds = selectedCandidates
      .filter((c) => c.sourceType === "promotion" && c.previousEnrollment_id)
      .map((c) => c.previousEnrollment_id);

    let updatedPreviousEnrollmentsCount = 0;
    if (promotionPrevIds.length > 0) {
      const updateResult = await StudentEnrollment.updateMany(
        {
          _id: { $in: promotionPrevIds },
          school_id: user.school_id,
          isActive: true,
        },
        {
          $set: { isActive: false, updatedBy: user.id },
        },
        { session }
      );
      updatedPreviousEnrollmentsCount = updateResult.modifiedCount;
    }

    // ---------- Clear requestedGrade for new admissions ----------
    const newAdmissionIds = selectedCandidates
      .filter((c) => c.sourceType === "new_admission")
      .map((c) => c.student._id);

    if (newAdmissionIds.length > 0) {
      await StudentProfile.updateMany(
        {
          _id: { $in: newAdmissionIds },
          school_id: user.school_id,
        },
        {
          $set: { requestedGrade: null, updatedBy: user.id },
        },
        { session }
      );
    }

    if (useTransaction && session) {
      await session.commitTransaction();
    }

    const newAdmissionsCount = selectedCandidates.filter((c) => c.sourceType === "new_admission").length;
    const promotionsCount = selectedCandidates.filter((c) => c.sourceType === "promotion").length;

    return {
      classSection: classSectionFresh,
      createdEnrollments,
      selectedStudents: selectedCandidates.map((c) => ({
        student_id: c.student._id,
        student_name: c.student.student_name,
        admission_no: c.student.admission_no,
        sourceType: c.sourceType,
        previousEnrollment_id: c.previousEnrollment_id ?? null,
        user_id: c.student.user_id || null,
      })),
      newAdmissionsCount,
      promotionsCount,
      updatedPreviousEnrollmentsCount,
    };
  } catch (err) {
    if (useTransaction && session) {
      await session.abortTransaction();
    }
    throw err;
  } finally {
    if (session) {
      session.endSession();
    }
  }
};


// --------------------------------------------------
// 1) Fetch candidates — returns two groups for the UI
// GET /enrollment/candidates
// --------------------------------------------------
export const getEnrollmentCandidatesService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(query.academicYear);
  const classSectionId = query.classSection_id;

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSectionGeneric(
    ClassSection,
    user.school_id,
    classSectionId
  );

  if (classSection.academicYear !== academicYear) {
    throw new Error("academicYear does not match the selected class section");
  }

  const { new_admissions, promotions } = await buildCandidateMap(user, {
    academicYear,
    classSection,
  });

  const mapItem = (item) => ({
    student: {
      _id: item.student._id,
      student_name: item.student.student_name,
      admission_no: item.student.admission_no,
      gender: item.student.gender,
      dob: item.student.dob,
      transport_required: item.student.transport_required,
      status: item.student.status,
      requestedGrade: item.student.requestedGrade || null,
      user_id: item.student.user_id || null,
    },
    sourceType: item.sourceType,
    previousEnrollment_id: item.previousEnrollment_id,
    previousEnrollment: item.previousEnrollment
      ? {
        _id: item.previousEnrollment._id,
        academicYear: item.previousEnrollment.academicYear,
        roll_no: item.previousEnrollment.roll_no,
        classSection_id: item.previousEnrollment.classSection_id,
      }
      : null,
    selected: false,
  });

  return {
    academicYear,
    classSection,
    new_admissions: new_admissions.map(mapItem),
    promotions: promotions.map(mapItem),
    totals: {
      new_admissions: new_admissions.length,
      promotions: promotions.length,
      combined: new_admissions.length + promotions.length,
    },
  };
};


// --------------------------------------------------
// 2) Preview Allocation — no DB writes
// POST /enrollment/preview-allocation
// Body: { academicYear, classSection_id, mode: "manual"|"auto", new_admissions: [id], promotions: [id], count? }
// --------------------------------------------------
export const previewStudentAllocationService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(data.academicYear);
  const classSectionId = data.classSection_id;
  const mode = data.mode || "manual";

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSectionGeneric(
    ClassSection,
    user.school_id,
    classSectionId
  );

  if (classSection.academicYear !== academicYear) {
    throw new Error("academicYear does not match the selected class section");
  }

  const { new_admissions, promotions } = await buildCandidateMap(user, {
    academicYear,
    classSection,
  });

  // Build lookup maps for O(1) validation
  const newAdmissionMap = new Map(
    new_admissions.map((item) => [String(item.student._id), item])
  );
  const promotionMap = new Map(
    promotions.map((item) => [String(item.student._id), item])
  );

  let selectedNewAdmissions = [];
  let selectedPromotions = [];

  const remainingSeats = classSection.capacity - classSection.currentStrength;
  if (remainingSeats <= 0) throw new Error("No seats available in this class section");

  if (mode === "auto") {
    // Auto: globally sorted alphabetical pool across both groups, up to count / remaining seats
    const allCandidates = sortAllocationCandidatesAlphabetically([...new_admissions, ...promotions]);
    const count = data.count
      ? Math.min(Number(data.count), remainingSeats)
      : remainingSeats;

    if (count <= 0) throw new Error("Invalid allocation count");

    const slice = allCandidates.slice(0, count);
    selectedNewAdmissions = slice.filter((c) => c.sourceType === "new_admission");
    selectedPromotions = slice.filter((c) => c.sourceType === "promotion");
  } else {
    // Manual: frontend sends grouped student ID arrays
    const naIds = Array.isArray(data.new_admissions) ? data.new_admissions : [];
    const prIds = Array.isArray(data.promotions) ? data.promotions : [];

    if (!naIds.length && !prIds.length) {
      throw new Error("At least one student must be selected in new_admissions or promotions");
    }

    selectedNewAdmissions = naIds.map((id) => {
      const candidate = newAdmissionMap.get(String(id));
      if (!candidate)
        throw new Error(`Student ${id} is not an eligible new admission for this allocation`);
      return candidate;
    });

    selectedPromotions = prIds.map((id) => {
      const candidate = promotionMap.get(String(id));
      if (!candidate)
        throw new Error(`Student ${id} is not an eligible promotion candidate for this allocation`);
      return candidate;
    });
  }

  const totalSelected = selectedNewAdmissions.length + selectedPromotions.length;
  if (!totalSelected) throw new Error("No eligible students found for preview");
  if (totalSelected > remainingSeats) {
    throw new Error(
      `Selection (${totalSelected}) exceeds available seats (${remainingSeats})`
    );
  }

  const mapPreview = (c) => ({
    student_id: c.student._id,
    student_name: c.student.student_name,
    admission_no: c.student.admission_no,
    sourceType: c.sourceType,
    previousEnrollment_id: c.previousEnrollment_id ?? null,
  });

  return {
    academicYear,
    classSection,
    preview: {
      new_admissions: sortAllocationCandidatesAlphabetically(selectedNewAdmissions).map(mapPreview),
      promotions: sortAllocationCandidatesAlphabetically(selectedPromotions).map(mapPreview),
      totals: {
        new_admissions: selectedNewAdmissions.length,
        promotions: selectedPromotions.length,
        combined: totalSelected,
      },
    },
  };
};


// --------------------------------------------------
// 3) Confirm Allocation — the only commit step
// POST /enrollment/confirm-allocation
// Body: { academicYear, classSection_id, new_admissions: [id], promotions: [id] }
// --------------------------------------------------
export const confirmStudentAllocationService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(data.academicYear);
  const classSectionId = data.classSection_id;
  const naIds = Array.isArray(data.new_admissions) ? data.new_admissions : [];
  const prIds = Array.isArray(data.promotions) ? data.promotions : [];

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");
  if (!naIds.length && !prIds.length) {
    throw new Error("At least one student must be provided in new_admissions or promotions");
  }

  const classSection = await getTargetClassSectionGeneric(
    ClassSection,
    user.school_id,
    classSectionId
  );

  if (classSection.academicYear !== academicYear) {
    throw new Error("academicYear does not match the selected class section");
  }

  // Re-check eligibility at confirm time (not just preview time)
  const { new_admissions, promotions } = await buildCandidateMap(user, {
    academicYear,
    classSection,
  });

  const newAdmissionMap = new Map(
    new_admissions.map((item) => [String(item.student._id), item])
  );
  const promotionMap = new Map(
    promotions.map((item) => [String(item.student._id), item])
  );

  const selectedNewAdmissions = naIds.map((id) => {
    const candidate = newAdmissionMap.get(String(id));
    if (!candidate)
      throw new Error(`Student ${id} is no longer eligible as a new admission or is already allocated`);
    return candidate;
  });

  const selectedPromotions = prIds.map((id) => {
    const candidate = promotionMap.get(String(id));
    if (!candidate)
      throw new Error(`Student ${id} is no longer eligible for promotion or is already allocated`);
    return candidate;
  });

  const selectedCandidates = sortAllocationCandidatesAlphabetically([
    ...selectedNewAdmissions,
    ...selectedPromotions,
  ]);

  const result = await allocateStudentRows({
    user,
    classSection,
    academicYear,
    selectedCandidates,
  });

  return result;
};


// // --------------------------------------------------
// // 4) Update Enrollment Type — admin correction only
// // PATCH /enrollment/update-type/:enrollmentId
// // Patches enrollmentType field only. No allocation logic.
// // --------------------------------------------------
// export const updateStudentEnrollmentTypeService = async (user, enrollmentId, data = {}) => {
//   assertSchoolAdmin(user);

//   const { enrollmentType } = data;
//   const validTypes = ["new_admission", "promotion", "transfer"];

//   if (!validTypes.includes(enrollmentType)) {
//     throw new Error(`Invalid enrollmentType. Must be one of: ${validTypes.join(", ")}`);
//   }

//   const enrollment = await StudentEnrollment.findOne({
//     _id: enrollmentId,
//     school_id: user.school_id,
//   });

//   if (!enrollment) throw new Error("Enrollment record not found");

//   enrollment.enrollmentType = enrollmentType;
//   enrollment.updatedBy = user.id;
//   await enrollment.save();

//   return enrollment;
// };


// --------------------------------------------------
// 5) Promote Student Enrollment — patch-only correction
// POST /enrollment/promote
// Body: { enrollment_id }
// Only patches enrollmentType to "promotion" on an existing record.
// Does NOT create a new enrollment row.
// --------------------------------------------------
export const promoteStudentEnrollmentService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const { enrollment_id } = data;

  if (!enrollment_id) {
    throw new Error("enrollment_id is required");
  }

  const enrollment = await StudentEnrollment.findOne({
    _id: enrollment_id,
    school_id: user.school_id,
  });

  if (!enrollment) {
    throw new Error("Enrollment record not found or does not belong to this school");
  }

  if (!enrollment.isActive) {
    throw new Error("Cannot promote an inactive enrollment record");
  }

  enrollment.enrollmentType = "promotion";
  enrollment.updatedBy = user.id;
  await enrollment.save();

  return enrollment;
};


// --------------------------------------------------
// 6) Get Enrolled Students for a Class — saved roster only
// GET /enrollment/enrolled
// Returns already-committed, active enrollment rows sorted by roll number.
// No preview or candidate logic.
// --------------------------------------------------
export const getClassEnrolledStudentsService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(query.academicYear);
  const classSectionId = query.classSection_id;

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSectionGeneric(
    ClassSection,
    user.school_id,
    classSectionId
  );

  const enrollments = await StudentEnrollment.find({
    school_id: user.school_id,
    academicYear,
    classSection_id: classSection._id,
    isActive: true,
  }).sort({ roll_no: 1 });

  return {
    classSection,
    academicYear,
    total: enrollments.length,
    enrollments,
  };
};

export const resolveStudentPortalContextService = async (user, { childId = null } = {}) => {
  if (!user || !["student", "parent"].includes(user.role)) {
    throw new Error("Only student or parent can access this service");
  }

  if (!user.school_id) {
    throw new Error("User is not linked to any school");
  }

  let studentProfile = null;

  if (user.role === "student") {
    studentProfile = await StudentProfile.findOne({
      user_id: user.id,
      school_id: user.school_id,
    }).populate("user_id", "name email role profile_avatar status");
  } else {
    const parentProfile = await ParentProfile.findOne({
      user_id: user.id,
      school_id: user.school_id,
    }).select("children");

    if (!parentProfile) {
      throw new Error("Parent profile not found");
    }

    const selectedChildId = childId || parentProfile.children?.[0];

    if (!selectedChildId) {
      throw new Error("No linked child found for this parent");
    }

    if (!parentProfile.children.some((id) => String(id) === String(selectedChildId))) {
      throw new Error("Selected child does not belong to this parent");
    }

    studentProfile = await StudentProfile.findOne({
      _id: selectedChildId,
      school_id: user.school_id,
    }).populate("user_id", "name email role profile_avatar status");
  }

  if (!studentProfile) {
    throw new Error("Student profile not found");
  }

  const activeEnrollment = await StudentEnrollment.findOne({
    school_id: user.school_id,
    student_id: studentProfile._id,
    isActive: true,
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "classSection_id",
      select: "academicYear standard section classCode status classTeacher_id",
    });

  if (!activeEnrollment) {
    throw new Error("Active enrollment not found for this student");
  }

  return {
    studentProfile,
    activeEnrollment,
    classSection: activeEnrollment.classSection_id,
    academicYear: activeEnrollment.academicYear,
  };
};