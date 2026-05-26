import { useState } from "react";
import { StepperSidebar } from "./StudentAdmission/StepperSidebar";
import { Step1BasicDetails } from "./StudentAdmission/Step1BasicDetails";
import { Step2AcademicFee } from "./StudentAdmission/Step2AcademicFee";
import { Step4ReviewSave } from "./StudentAdmission/Step4ReviewSave";
import { toast } from "sonner";

export default function StudentAdmissionForm({ setStudents, setAttendance, setActiveTab }) {
  const [activeStep, setActiveStep] = useState(1);
  const [form, setForm] = useState({
    studentName: "",
    email: "",
    password: "",
    admissionNumber: "",
    gender: "",
    dob: "",
    grade: "",
    parentName: "",
    parentEmail: "",
    parentPhone: "",
    guardianName: "",
    guardianRelation: "",
    street: "",
    city: "",
    state: "",
    postal: "",
    country: "",
    transportRequired: true,
    transportRoute: "",
    transportStop: "",
    academicPlan: "",
  });

  const handleChange = (key) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const goNext = () => setActiveStep((step) => Math.min(step + 1, 3));
  const goBack = () => setActiveStep((step) => Math.max(step - 1, 1));

  const onSubmit = () => {
    const nameParts = form.studentName.trim().split(" ");
    const firstName = nameParts[0] || "New";
    const lastName = nameParts.slice(1).join(" ") || "Student";
    const newId = Date.now();

    const newStudent = {
      id: newId,
      firstName,
      lastName,
      class: form.grade || "Grade 10",
      rollNo: form.admissionNumber || String(newId).slice(-4),
      email: form.email || "student@school.edu",
      status: "Active",
    };

    setStudents((prev) => [...prev, newStudent]);
    setAttendance((prev) => ({ ...prev, [newId]: "present" }));
    toast.success("Student admitted successfully!");
    setActiveTab("Dashboard");
  };

  return (
    <div className="flex flex-col sm:flex-row w-full h-full bg-transparent gap-5 lg:gap-6 p-0 overflow-hidden">

      {/* ── Mobile stepper strip (hidden on sm+) ── */}
      <div className="flex sm:hidden items-center gap-2 px-4 py-3 border-b border-slate-100 bg-white overflow-x-auto w-full">
        {[1, 2, 3].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => setActiveStep(n)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${n === activeStep
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

      {/* ── LEFT — Stepper sidebar (hidden on mobile) ── */}
      <aside className="hidden sm:flex w-56 lg:w-60 shrink-0 flex-col justify-between h-full py-1">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
          <StepperSidebar activeStep={activeStep} onStepClick={setActiveStep} />
        </div>
      </aside>

      {/* ── RIGHT — Form content ── */}
      <div className="flex flex-col flex-1 overflow-hidden h-full">
        {activeStep === 1 && (
          <Step1BasicDetails form={form} onChange={handleChange} goNext={goNext} />
        )}
        {activeStep === 2 && (
          <Step2AcademicFee form={form} onChange={handleChange} goNext={goNext} goBack={goBack} />
        )}
        {activeStep === 3 && (
          <Step4ReviewSave form={form} goBack={goBack} onSubmit={onSubmit} />
        )}
      </div>

    </div>
  );
}