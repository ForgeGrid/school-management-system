import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StepperSidebar } from "./StudentAdmission/StepperSidebar";
import { Step1BasicDetails } from "./StudentAdmission/Step1BasicDetails";
import { Step2AcademicFee } from "./StudentAdmission/Step2AcademicFee";
import { Step4ReviewSave } from "./StudentAdmission/Step4ReviewSave";
import { getAllStudents, selectStudentLoading } from "../../redux/slice/schoolStudentSlice";
import StudentAll from "./StudentAdmission/StudentAll";

export default function StudentAdmissionForm({ setActiveTab }) {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectStudentLoading("enrollStudent"));

  const [showForm, setShowForm] = useState(false); // ← only this added

  const [activeStep, setActiveStep] = useState(1);
  const [form, setForm] = useState({
    student_name:       "",
    email:              "",
    password:           "",
    admission_no:       "",
    gender:             "",
    dob:                "",
    requestedGrade:     "",
    avatarFile:         null,
    avatarPreview:      null,
    parent:             null,
    parentMode:         "link",
    parentUserId:       "",
    parent_name:        "",
    parent_email:       "",
    parent_phone:       "",
    guardian_name:      "",
    guardian_relation:  "",
    address:            null,
    street:             "",
    city:               "",
    state:              "",
    postalCode:         "",
    country:            "",
    transport_required: false,
    academicYear:              "2025 - 2026",
    grade:                     "",
    academicPlan:              "",
    academicPlanId:            "",
    transportRouteId:          "",
    transportRoute:            "",
    transportStop:             "",
    transportFee:              0,
    transportFrequency:        "Monthly",
    transportFeeStructureId:   "",
    discounts:                 [],
    additionalCharges:         [],
    estimatedTotal:            0,
    studentProfileId:          "",
    studentFeePlanId:          "",
  });

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const goNext = () => setActiveStep((s) => Math.min(s + 1, 3));
  const goBack = () => setActiveStep((s) => Math.max(s - 1, 1));

  const handleAdmissionSuccess = () => {
    // Refresh the student list from the API
    dispatch(getAllStudents());
    // Navigate back to the student list view
    setShowForm(false);
  };

  // ── Before create is clicked — show only the button ──
 // ── Before create is clicked — show StudentAll with top-right button ──
if (!showForm) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 py-4 shrink-0">
        <div>
          <h1 className="text-[22px] font-semibold text-slate-800">Students</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all enrolled students</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <span className="text-lg leading-none">+</span>
          New Admission
        </button>
      </div>

      {/* Student list — fills remaining space, no outer scroll */}
      <div className="flex-1 overflow-hidden px-6 pb-6">
        <StudentAll />
      </div>
    </div>
  );
}
 return (
  <div className="flex w-full h-full bg-transparent">

    {/* ── Single connected white card wrapping both sides ── */}
    <div className="flex w-full h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* ── Left: stepper strip ── */}
      <aside className="hidden sm:flex flex-col w-56 lg:w-64 shrink-0 border-r border-slate-200 p-5">
        <StepperSidebar activeStep={activeStep} onStepClick={setActiveStep} />
      </aside>

      {/* ── Right: form content ── */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Mobile stepper strip */}
        <div className="flex sm:hidden items-center gap-2 px-4 py-3 border-b border-slate-200 overflow-x-auto w-full">
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

        {/* Step content */}
        <div className="flex-1 p-6 lg:p-8 flex flex-col overflow-hidden">
          {activeStep === 1 && (
            <Step1BasicDetails form={form} onChange={handleChange} goNext={goNext} />
          )}
          {activeStep === 2 && (
            <Step2AcademicFee form={form} onChange={handleChange} goNext={goNext} goBack={goBack} />
          )}
          {activeStep === 3 && (
            <Step4ReviewSave form={form} goBack={goBack} isLoading={isLoading} onSubmit={handleAdmissionSuccess} />
          )}
        </div>
      </div>

    </div>
  </div>
);
}