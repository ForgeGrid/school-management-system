import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StepperSidebar } from "./StudentAdmission/StepperSidebar";
import { Step1BasicDetails } from "./StudentAdmission/Step1BasicDetails";
import { Step2AcademicFee } from "./StudentAdmission/Step2AcademicFee";
import { Step4ReviewSave } from "./StudentAdmission/Step4ReviewSave";
import {
  selectStudentLoading,
} from "../../redux/slice/schoolStudentSlice";

export default function StudentAdmissionForm({ setStudents, setAttendance, setActiveTab }) {
  const isLoading = useSelector(selectStudentLoading("enrollStudent"));

  const [activeStep, setActiveStep] = useState(1);
  const [form, setForm] = useState({
    // ── Step 1: Student Account ────────────────────────────────
    student_name:       "",
    email:              "",
    password:           "",
    admission_no:       "",

    // ── Step 1: Student Profile ────────────────────────────────
    gender:             "",
    dob:                "",
    requestedGrade:     "",

    // ── Step 1: Photo ──────────────────────────────────────────
    avatarFile:         null,
    avatarPreview:      null,

    // ── Step 1: Parent block (normalised by Step 1 before goNext) ──
    parent:             null,
    parentMode:         "link",   // "link" → existing | "create" → new
    parentUserId:       "",
    parent_name:        "",
    parent_email:       "",
    parent_phone:       "",
    guardian_name:      "",       // ✅ added — maps to ParentProfile.guardian_name
    guardian_relation:  "",       // ✅ added — maps to ParentProfile.guardian_relation

    // ── Step 1: Address block (normalised by Step 1 before goNext) ──
    address:            null,
    street:             "",
    city:               "",
    state:              "",
    postalCode:         "",
    country:            "",

    // ── Step 1: Transport (toggle only — route/fee set in Step 2) ──
    transport_required: false,

    // ── Step 2: Academic fee ───────────────────────────────────
    academicYear:              "2025 - 2026",
    grade:                     "",
    academicPlan:              "",
    academicPlanId:            "",   // → feePlan.academicFeeStructure_id

    // ── Step 2: Transport fee ──────────────────────────────────
    transportRouteId:          "",   // → feePlan.currentRoute_id
    transportRoute:            "",
    transportStop:             "",
    transportFee:              0,
    transportFrequency:        "Monthly",
    transportFeeStructureId:   "",   // → feePlan.transportFeeStructure_id

    // ── Step 2: Adjustments ────────────────────────────────────
    discounts:                 [],
    additionalCharges:         [],
    estimatedTotal:            0,

    // ── Populated by API response after successful admission ───
    studentProfileId:          "",
    studentFeePlanId:          "",
  });

  // ✅ handleChange supports both primitive values and object values
  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const goNext = () => setActiveStep((s) => Math.min(s + 1, 3));
  const goBack = () => setActiveStep((s) => Math.max(s - 1, 1));

  // ── Called by Step4ReviewSave after a successful enrollStudent dispatch ──
  const handleAdmissionSuccess = (result) => {
    const resData     = result.payload?.data || result.payload;
    const studentData = resData?.studentProfile;

    if (studentData) {
      const nameParts = studentData.student_name?.trim().split(" ") || ["New"];
      const firstName = nameParts[0];
      const lastName  = nameParts.slice(1).join(" ") || "Student";

      const newStudent = {
        id:       studentData._id    || Date.now(),
        firstName,
        lastName,
        class:    studentData.requestedGrade || form.requestedGrade || form.grade || "—",
        rollNo:   studentData.admission_no   || form.admission_no,
        email:    studentData.email          || form.email,
        status:   "Active",
      };

      setStudents((prev)   => [...prev, newStudent]);
      setAttendance((prev) => ({ ...prev, [newStudent.id]: "present" }));
    }

    setActiveTab("Dashboard");
  };

  return (
    <div className="flex flex-col sm:flex-row w-full h-full bg-transparent gap-5 lg:gap-6 p-0 overflow-hidden">

      {/* ── Mobile stepper strip ── */}
      <div className="flex sm:hidden items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white overflow-x-auto w-full">
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setActiveStep(n)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              n === activeStep
                ? "bg-blue-600 text-white"
                : n < activeStep
                  ? "bg-green-100 text-green-700"
                  : "bg-slate-100 text-slate-400"
            }`}
          >
            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold border border-current">
              {n}
            </span>
            {["Basic Details", "Academic Fee", "Review & Save"][n - 1]}
          </button>
        ))}
      </div>

      {/* ── Stepper sidebar (desktop) ── */}
      <aside className="hidden sm:flex w-56 lg:w-60 shrink-0 flex-col justify-between h-full py-1">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
          <StepperSidebar activeStep={activeStep} onStepClick={setActiveStep} />
        </div>
      </aside>

      {/* ── Form content ── */}
      <div className="flex flex-col flex-1 overflow-hidden h-full">
        {activeStep === 1 && (
          <Step1BasicDetails
            form={form}
            onChange={handleChange}
            goNext={goNext}
          />
        )}
        {activeStep === 2 && (
          <Step2AcademicFee
            form={form}
            onChange={handleChange}
            goNext={goNext}
            goBack={goBack}
          />
        )}
        {activeStep === 3 && (
          <Step4ReviewSave
            form={form}
            goBack={goBack}
            isLoading={isLoading}
            onSubmit={handleAdmissionSuccess}
          />
        )}
      </div>
    </div>
  );
}