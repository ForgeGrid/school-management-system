import mongoose from "mongoose";
import logger from "../utils/logger.js";
import { StudentProfile } from "../models/student/student.model.js";
import { StudentEnrollment } from "../models/student/studentEnrollment.model.js";
import { ClassSection } from "../models/academic/classSection.model.js";

const assertSchoolAdmin = (user) => {
  if (!user || user.role !== "school_admin") {
    throw new Error("Only school admin can manage enrollments");
  }
  if (!user.school_id) {
    throw new Error("User is not associated with any school");
  }
};

const normalize = (value) => String(value || "").trim();

const getNumericStandard = (standard) => {
  const num = parseInt(String(standard).trim(), 10);
  return Number.isNaN(num) ? null : num;
};

const derivePreviousAcademicYear = (academicYear) => {
  const value = normalize(academicYear);
  const match = value.match(/^(\d{4})\s*-\s*(\d{2}|\d{4})$/);

  if (!match) return null;

  const start = parseInt(match[1], 10);
  const endPart = match[2];

  if (endPart.length === 2) {
    const prevStart = start - 1;
    const prevEnd = String(prevStart + 1).slice(-2);
    return `${prevStart}-${prevEnd}`;
  }

  const end = parseInt(endPart, 10);
  return `${start - 1}-${end - 1}`;
};

const getTargetClassSection = async (user, classSectionId) => {
  if (!mongoose.Types.ObjectId.isValid(classSectionId)) {
    throw new Error("Invalid classSection_id");
  }

  const classSection = await ClassSection.findOne({
    _id: classSectionId,
    school_id: user.school_id,
    status: "active",
  });

  if (!classSection) {
    throw new Error("Class section not found");
  }

  return classSection;
};

const getAlreadyAllocatedIds = async (schoolId, academicYear) => {
  const enrollments = await StudentEnrollment.find({
    school_id: schoolId,
    academicYear,
  }).select("student_id");

  return new Set(enrollments.map((e) => String(e.student_id)));
};

const buildCandidateMap = async (user, { academicYear, classSection }) => {
  const targetAcademicYear = normalize(academicYear);
  const targetStandard = normalize(classSection.standard);
  const targetStandardNum = getNumericStandard(targetStandard);
  const previousAcademicYear = derivePreviousAcademicYear(targetAcademicYear);
  const allocatedIds = await getAlreadyAllocatedIds(user.school_id, targetAcademicYear);

  const candidates = new Map();

  // 1) New admissions from StudentProfile
  const newAdmissionStudents = await StudentProfile.find({
    school_id: user.school_id,
    status: "active",
    requestedGrade: targetStandard,
    _id: { $nin: [...allocatedIds] },
  })
    .populate("user_id", "name email role profile_avatar status")
    .sort({ student_name: 1, admission_no: 1 });

  for (const student of newAdmissionStudents) {
    candidates.set(String(student._id), {
      student,
      sourceType: "new_admission",
      previousEnrollment_id: null,
      previousEnrollment: null,
    });
  }

  // 2) Promotion candidates from previous academic year
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
      if (prevStandardNum === targetStandardNum - 1) {
        const student = enrollment.student_id;
        if (!student) continue;
        if (allocatedIds.has(String(student._id))) continue;
        if (!candidates.has(String(student._id))) {
          candidates.set(String(student._id), {
            student,
            sourceType: "promotion",
            previousEnrollment_id: enrollment._id,
            previousEnrollment: enrollment,
          });
        }
      }
    }
  }

  const list = [...candidates.values()].sort((a, b) => {
    const aName = String(a.student.student_name || "").toLowerCase();
    const bName = String(b.student.student_name || "").toLowerCase();
    if (aName !== bName) return aName.localeCompare(bName);

    return String(a.student.admission_no || "").localeCompare(String(b.student.admission_no || ""));
  });

  return {
    targetAcademicYear,
    targetStandard,
    previousAcademicYear,
    list,
  };
};

let _supportsTransactions = null;

const checkTransactionSupport = async () => {
  if (_supportsTransactions !== null) return _supportsTransactions;
  try {
    const hello = await mongoose.connection.db.admin().command({ hello: 1 });
    _supportsTransactions = !!hello.setName;
  } catch (err) {
    _supportsTransactions = false;
  }
  return _supportsTransactions;
};

const allocateStudentRows = async ({
  user,
  classSection,
  academicYear,
  selectedCandidates,
  source,
}) => {
  let session = null;
  const useTransaction = await checkTransactionSupport();

  if (useTransaction) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (error) {
      logger.warn("Failed to start transaction session, running without transaction:", error.message);
      session = null;
    }
  } else {
    logger.warn("Transactions not supported (running standalone MongoDB). Running without transaction.");
  }

  try {
    const classSectionFresh = await ClassSection.findOne({
      _id: classSection._id,
      school_id: user.school_id,
    }).session(session);

    if (!classSectionFresh) {
      throw new Error("Class section not found");
    }

    const remainingSeats = classSectionFresh.capacity - classSectionFresh.currentStrength;
    if (selectedCandidates.length > remainingSeats) {
      throw new Error("Not enough seats in the selected class section");
    }

    const nextRollStart = classSectionFresh.currentStrength + 1;

    const enrollmentsToCreate = selectedCandidates.map((candidate, index) => ({
      school_id: user.school_id,
      academicYear,
      student_id: candidate.student._id,
      classSection_id: classSectionFresh._id,
      roll_no: nextRollStart + index,
      previousEnrollment_id: candidate.sourceType === "promotion" ? candidate.previousEnrollment_id : null,
      enrollmentType: candidate.sourceType === "promotion" ? "promotion" : "new_admission",
      isActive: true,
      createdBy: user.id,
      updatedBy: user.id,
    }));

    const createdEnrollments = await StudentEnrollment.insertMany(enrollmentsToCreate, {
      session,
    });

    classSectionFresh.currentStrength += createdEnrollments.length;
    classSectionFresh.updatedBy = user.id;
    await classSectionFresh.save({ session });

    // Clear requestedGrade after allocation so old students do not keep reappearing
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

    // IMPORTANT !! This returns the response!
    return {
      classSection: classSectionFresh,
      createdEnrollments,
      selectedStudents: selectedCandidates.map((c) => ({
        student_id: c.student._id,
        student_name: c.student.student_name,
        admission_no: c.student.admission_no,
        sourceType: c.sourceType,
        previousEnrollment_id: c.previousEnrollment_id,
        user_id: c.student.user_id || null,
      })),
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
// 1) Fetch candidates for allocation UI
// --------------------------------------------------
export const getEnrollmentCandidatesService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(query.academicYear);
  const classSectionId = query.classSection_id;

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSection(user, classSectionId);

  if (classSection.academicYear !== academicYear) {
    throw new Error("academicYear does not match the selected class section");
  }

  const { list } = await buildCandidateMap(user, { academicYear, classSection });

  return {
    academicYear,
    classSection,
    total: list.length,
    students: list.map((item) => ({
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
    })),
  };
};

// --------------------------------------------------
// 2) Manual allocation
// body can use either:
// {
//   academicYear,
//   classSection_id,
//   studentIds: []
// }
//
// or
// {
//   academicYear,
//   classSection_id,
//   selections: [{ student_id, sourceType, previousEnrollment_id }]
// }
// --------------------------------------------------
export const allocateStudentsManuallyService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(data.academicYear);
  const classSectionId = data.classSection_id;

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSection(user, classSectionId);
  if (classSection.academicYear !== academicYear) {
    throw new Error("academicYear does not match the selected class section");
  }

  const candidateMapData = await buildCandidateMap(user, {
    academicYear,
    classSection,
  });

  const candidateMap = new Map(
    candidateMapData.list.map((item) => [String(item.student._id), item])
  );

  let selectedInputs = [];
  if (Array.isArray(data.selections) && data.selections.length > 0) {
    selectedInputs = data.selections;
  } else if (Array.isArray(data.studentIds) && data.studentIds.length > 0) {
    selectedInputs = data.studentIds.map((id) => ({ student_id: id }));
  } else {
    throw new Error("Either selections or studentIds must be provided");
  }

  const selectedCandidates = selectedInputs.map((input) => {
    const studentId = String(input.student_id || "");
    const candidate = candidateMap.get(studentId);

    if (!candidate) {
      throw new Error(`Student ${studentId} is not eligible for this allocation`);
    }

    return {
      ...candidate,
      sourceType: input.sourceType || candidate.sourceType,
      previousEnrollment_id: input.previousEnrollment_id || candidate.previousEnrollment_id,
    };
  });

  selectedCandidates.sort((a, b) => {
    const aName = String(a.student.student_name || "").toLowerCase();
    const bName = String(b.student.student_name || "").toLowerCase();
    return aName.localeCompare(bName);
  });

  return await allocateStudentRows({
    user,
    classSection,
    academicYear,
    selectedCandidates,
    source: "manual",
  });
};

// --------------------------------------------------
// 3) Auto allocation by count, alphabetical order
// preview selected students, then store them
// --------------------------------------------------
export const autoAllocateStudentsService = async (user, data = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(data.academicYear);
  const classSectionId = data.classSection_id;

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSection(user, classSectionId);
  if (classSection.academicYear !== academicYear) {
    throw new Error("academicYear does not match the selected class section");
  }

  const remainingSeats = classSection.capacity - classSection.currentStrength;
  if (remainingSeats <= 0) {
    throw new Error("No seats available in this class section");
  }

  let countToAllocate;
  if (data.count !== undefined && data.count !== null && data.count !== "") {
    const count = Number(data.count);
    if (!Number.isInteger(count) || count <= 0) {
      throw new Error("count must be a positive integer");
    }
    if (count > remainingSeats) {
      throw new Error(`Requested count ${count} exceeds remaining seats ${remainingSeats}`);
    }
    countToAllocate = count;
  } else {
    countToAllocate = remainingSeats;
  }

  const candidateMapData = await buildCandidateMap(user, {
    academicYear,
    classSection,
  });

  const orderedCandidates = candidateMapData.list.sort((a, b) => {
    const aName = String(a.student.student_name || "").toLowerCase();
    const bName = String(b.student.student_name || "").toLowerCase();
    if (aName !== bName) return aName.localeCompare(bName);

    return String(a.student.admission_no || "").localeCompare(String(b.student.admission_no || ""));
  });

  const selectedCandidates = orderedCandidates.slice(0, countToAllocate);

  if (selectedCandidates.length === 0) {
    throw new Error("No eligible students found for auto allocation");
  }

  return await allocateStudentRows({
    user,
    classSection,
    academicYear,
    selectedCandidates,
    source: "auto",
  });
};


// --------------------------------------------------
// 4) Get already allocated students for a class
// --------------------------------------------------
export const getClassEnrolledStudentsService = async (user, query = {}) => {
  assertSchoolAdmin(user);

  const academicYear = normalize(query.academicYear);
  const classSectionId = query.classSection_id;

  if (!academicYear) throw new Error("academicYear is required");
  if (!classSectionId) throw new Error("classSection_id is required");

  const classSection = await getTargetClassSection(user, classSectionId);

  const enrollments = await StudentEnrollment.find({
    school_id: user.school_id,
    academicYear,
    classSection_id: classSection._id,
    isActive: true,
  })
    // .populate({
    //   path: "student_id",
    //   populate: {
    //     path: "user_id",
    //     select: "name email role profile_avatar status",
    //   },
    // })
    .sort({ roll_no: 1 });

  return {
    classSection,
    academicYear,
    total: enrollments.length,
    enrollments,
  };
};