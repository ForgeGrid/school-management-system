import React, { useState } from "react";
import {
  CalendarDays,
  GraduationCap,
  Users,
  Tag,
  Mail,
  Users2,
  CheckCircle2,
  XCircle,
  Clock,
  BookOpen,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";

import { Students } from "./Students";
import { SubjectTeachers } from "./SubjectTeachers";
import { Timetable } from "./ClassTimetable";
import { Attendance } from "./ClassAttendance";
import { Candidates } from "./process/Candidates";
import { Preview } from "./process/Preview";
import { Success } from "./process/Success";

const CLASS_INFO = {
  name: "Grade 5 (A)",
  status: "Active",
  academicYear: "2025 - 2026",
  standard: "Grade 5",
  section: "A",
  classCode: "G5-A",
  createdOn: "10 Jun 2025, 10:30 AM",
  classTeacher: {
    name: "Priya N",
    subject: "Hindi Teacher",
    email: "priya.n@school.com",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  stats: {
    enrolled: 32,
    capacity: 40,
    presentToday: 28,
    absentToday: 3,
    lateToday: 1,
    subjects: 6,
    timetableStatus: "Published",
    timetableUpdated: "Updated 2 days ago",
  },
};

// Mock data for enrollment wizard
const MOCK_NEW_ADMISSIONS = [
  { id: "ADM001", name: "Aanya Sharma", initials: "AS", grade: "Grade 5", date: "10 Jun 2025 10:30 AM", color: "bg-rose-50 border-rose-200 text-rose-600", type: "New Admission" },
  { id: "ADM002", name: "Rohan Mehta", initials: "RM", grade: "Grade 5", date: "11 Jun 2025 09:00 AM", color: "bg-blue-50 border-blue-200 text-blue-600", type: "New Admission" },
  { id: "ADM003", name: "Sneha Patel", initials: "SP", grade: "Grade 5", date: "12 Jun 2025 11:15 AM", color: "bg-violet-50 border-violet-200 text-violet-600", type: "New Admission" },
];

const MOCK_PROMOTIONS = [
  { id: "STU101", name: "Kiran Das", initials: "KD", from: "Grade 4 (A)", roll: "04", year: "2024-2025", color: "bg-amber-50 border-amber-200 text-amber-600" },
  { id: "STU102", name: "Meera Nair", initials: "MN", from: "Grade 4 (B)", roll: "12", year: "2024-2025", color: "bg-emerald-50 border-emerald-200 text-emerald-600" },
  { id: "STU103", name: "Arjun Reddy", initials: "AR", from: "Grade 4 (A)", roll: "07", year: "2024-2025", color: "bg-indigo-50 border-indigo-200 text-indigo-600" },
];

const CLASS_ENROLL_INFO = {
  grade: "Grade 5 (A)",
  year: "2025-2026",
  code: "G5-A",
  capacity: 40,
  currentStrength: 32,
};

const TABS = [
  { key: "students", label: "Students", icon: Users },
  { key: "teachers", label: "Subject Teachers", icon: Users2 },
  { key: "timetable", label: "Timetable", icon: CalendarDays },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
];

// ── Stat Card (icon + label inline at top, value + sub below, optional progress bar) ──
function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor, progress }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 min-w-0">
      <div className="flex items-center gap-2 min-w-0">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <p className="text-sm font-bold text-slate-700 truncate">{label}</p>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-extrabold text-slate-800 truncate">{value}</span>
        {sub && <span className={`text-xs font-semibold whitespace-nowrap ${subColor || "text-slate-400"}`}>{sub}</span>}
      </div>
      {progress !== undefined && (
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Enrollment Wizard Shell ─────────────────────────────────────────────────
function EnrollmentWizard({ onClose }) {
  const [step, setStep] = useState("candidates"); // "candidates" | "preview" | "success"
  const [selectionMode, setSelectionMode] = useState("manual");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const mockNewAdmissions = MOCK_NEW_ADMISSIONS;
  const mockPromotions = MOCK_PROMOTIONS;
  const classInfo = CLASS_ENROLL_INFO;

  const availableSeats = classInfo.capacity - classInfo.currentStrength - selectedIds.size;
  const selectedNewAdmissionsCount = mockNewAdmissions.filter(s => selectedIds.has(s.id)).length;
  const selectedPromotionsCount = mockPromotions.filter(s => selectedIds.has(s.id)).length;
  const allAdmissionsSelected = mockNewAdmissions.length > 0 && mockNewAdmissions.every(s => selectedIds.has(s.id));
  const allPromotionsSelected = mockPromotions.length > 0 && mockPromotions.every(s => selectedIds.has(s.id));

  // Map step keys to numeric index for the stepper
  const stepNumber = step === "candidates" ? 1 : step === "preview" ? 2 : 3;

  function handleToggleStudent(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleSelectAllAdmissions(e) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (e.target.checked) mockNewAdmissions.forEach(s => next.add(s.id));
      else mockNewAdmissions.forEach(s => next.delete(s.id));
      return next;
    });
  }

  function handleSelectAllPromotions(e) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (e.target.checked) mockPromotions.forEach(s => next.add(s.id));
      else mockPromotions.forEach(s => next.delete(s.id));
      return next;
    });
  }

  function handleAutoAllocate() {
    setSelectionMode("auto");
    const all = new Set([...mockNewAdmissions.map(s => s.id), ...mockPromotions.map(s => s.id)]);
    setSelectedIds(all);
  }

  function simulateGetCandidates() {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  }

  function handlePreviewAllocation() {
    if (selectedIds.size === 0) return;
    setStep("preview");
  }

  function handleConfirm() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("success");
    }, 1200);
  }

  function handleReset() {
    onClose();
  }

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden text-slate-700 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">

      {/* ── HEADER & STEPPER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {stepNumber === 1 ? 'Enroll Students' : stepNumber === 2 ? 'Preview Allocation' : 'Success'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {stepNumber === 1
              ? 'Select eligible students to enroll into the class.'
              : stepNumber === 2
                ? 'Review the selected students before confirming enrollment.'
                : 'Students allocation finalized.'}
          </p>
        </div>

        {/* 3-Step Stepper Progress Bar */}
        <div className="flex items-center gap-2">
          {/* Step 1 Candidates */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${stepNumber === 1
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
              : 'border border-slate-205 text-slate-400 bg-slate-50'
              }`}>1</div>
            <span className={`text-xs font-semibold ${stepNumber === 1 ? 'text-indigo-650 font-bold' : 'text-slate-400'}`}>Candidates</span>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 2 Preview */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${stepNumber === 2
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
              : 'border border-slate-205 text-slate-400 bg-slate-50'
              }`}>2</div>
            <span className={`text-xs font-semibold ${stepNumber === 2 ? 'text-indigo-650 font-bold' : 'text-slate-400'}`}>Preview</span>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 3 Confirm */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${stepNumber === 3
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
              : 'border border-slate-205 text-slate-400 bg-slate-50'
              }`}>3</div>
            <span className={`text-xs font-semibold ${stepNumber === 3 ? 'text-indigo-650 font-bold' : 'text-slate-400'}`}>Confirm</span>
          </div>
        </div>
      </div>

      {/* ── SHARED REUSABLE CLASS SECTION CARD ── */}
      {(stepNumber === 1 || stepNumber === 2) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-800">{classInfo.grade}</h2>
                <span className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-100">
                  Active
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{classInfo.code}</span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Academic Year {classInfo.year}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 pr-4 flex-wrap sm:flex-nowrap">
            <div className="text-center min-w-[70px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Capacity</span>
              <span className="text-xl font-bold text-slate-800">{classInfo.capacity}</span>
            </div>
            <div className="h-8 w-px bg-slate-150 hidden sm:block" />
            <div className="text-center min-w-[70px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Current Strength</span>
              <span className="text-xl font-bold text-slate-800">{classInfo.currentStrength}</span>
            </div>
            <div className="h-8 w-px bg-slate-150 hidden sm:block" />
            <div className="text-center min-w-[70px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Available Seats</span>
              <span className={`text-xl font-extrabold ${availableSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>{availableSeats}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      {step === "candidates" && (
        <Candidates
          selectionMode={selectionMode}
          setSelectionMode={setSelectionMode}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          loading={loading}
          mockNewAdmissions={mockNewAdmissions}
          mockPromotions={mockPromotions}
          allAdmissionsSelected={allAdmissionsSelected}
          allPromotionsSelected={allPromotionsSelected}
          selectedNewAdmissionsCount={selectedNewAdmissionsCount}
          selectedPromotionsCount={selectedPromotionsCount}
          handleSelectAllAdmissions={handleSelectAllAdmissions}
          handleSelectAllPromotions={handleSelectAllPromotions}
          handleToggleStudent={handleToggleStudent}
          handleAutoAllocate={handleAutoAllocate}
          simulateGetCandidates={simulateGetCandidates}
          handlePreviewAllocation={handlePreviewAllocation}
          onCancel={onClose}
        />
      )}

      {step === "preview" && (
        <Preview
          selectedIds={selectedIds}
          selectedPromotionsCount={selectedPromotionsCount}
          selectedNewAdmissionsCount={selectedNewAdmissionsCount}
          mockPromotions={mockPromotions}
          mockNewAdmissions={mockNewAdmissions}
          classInfo={CLASS_ENROLL_INFO}
          loading={loading}
          onBack={() => setStep("candidates")}
          onConfirm={handleConfirm}
        />
      )}

      {step === "success" && (
        <Success
          classInfo={CLASS_ENROLL_INFO}
          selectedIds={selectedIds}
          mockPromotions={mockPromotions}
          mockNewAdmissions={mockNewAdmissions}
          onReset={handleReset}
        />
      )}
    </div>
  );
}

// ── Main Myclass component ──────────────────────────────────────────────────
export function Myclass() {
  const [activeTab, setActiveTab] = useState("students");
  const [showEnrollment, setShowEnrollment] = useState(false);
  const { stats } = CLASS_INFO;

  const presentPct = Math.round((stats.presentToday / stats.enrolled) * 1000) / 10;
  const absentPct = Math.round((stats.absentToday / stats.enrolled) * 1000) / 10;
  const latePct = Math.round((stats.lateToday / stats.enrolled) * 1000) / 10;
  const capacityPct = Math.round((stats.enrolled / stats.capacity) * 100);

  if (showEnrollment) {
    return <EnrollmentWizard onClose={() => setShowEnrollment(false)} />;
  }

  return (
    <div className="flex flex-col gap-5 h-full overflow-y-auto pb-2 pr-1">
      {/* ── Header card ─────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-extrabold text-slate-800">{CLASS_INFO.name}</h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {CLASS_INFO.status}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-1.5 text-slate-500">
                <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Academic Year</span>
                <span className="font-bold text-slate-700">{CLASS_INFO.academicYear}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Standard</span>
                <span className="font-bold text-slate-700">{CLASS_INFO.standard}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Section</span>
                <span className="font-bold text-slate-700">{CLASS_INFO.section}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-400">Class Code</span>
                <span className="font-bold text-slate-700">{CLASS_INFO.classCode}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <span>Created By <span className="font-bold text-slate-500">Prithiviraaj (School Admin)</span></span>
              <span className="text-slate-300">•</span>
              <span>Created On {CLASS_INFO.createdOn}</span>
            </div>
          </div>

          {/* Class teacher card */}
          <div className="flex items-start gap-3 bg-slate-50/70 border border-slate-100 rounded-xl px-4 py-3 min-w-[220px]">
            <img
              src={CLASS_INFO.classTeacher.avatar}
              alt={CLASS_INFO.classTeacher.name}
              className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Class Teacher</span>
              <span className="text-sm font-bold text-slate-800 truncate">{CLASS_INFO.classTeacher.name}</span>
              <span className="text-xs text-slate-400 truncate">{CLASS_INFO.classTeacher.subject}</span>
              <a
                href={`mailto:${CLASS_INFO.classTeacher.email}`}
                className="text-xs text-indigo-500 hover:text-indigo-600 truncate flex items-center gap-1 mt-0.5"
              >
                <Mail className="w-3 h-3 shrink-0" />
                {CLASS_INFO.classTeacher.email}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Enroll Students", sub: "Add new students", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", action: () => setShowEnrollment(true) },
          { label: "Assign Teachers", sub: "Allocate subject teachers", icon: Users2, color: "text-blue-600", bg: "bg-blue-50", action: () => setActiveTab("teachers") },
          { label: "Attendance", sub: "Mark & view attendance", icon: CalendarCheck, color: "text-emerald-600", bg: "bg-emerald-50", action: () => setActiveTab("attendance") },
          { label: "Timetable", sub: "View class timetable", icon: BookOpen, color: "text-amber-600", bg: "bg-amber-50", action: () => setActiveTab("timetable") },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all text-left"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.bg}`}>
                <Icon className={`w-4.5 h-4.5 ${a.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700 truncate">{a.label}</p>
                <p className="text-xs text-slate-400 truncate">{a.sub}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Stat cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon={Users} iconBg="bg-indigo-50" iconColor="text-indigo-500" label="Enrolled Students" value={stats.enrolled} sub={`/ ${stats.capacity} Capacity`} progress={capacityPct} />
        <StatCard icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-500" label="Present Today" value={stats.presentToday} sub={`${presentPct}%`} subColor="text-emerald-500" />
        <StatCard icon={XCircle} iconBg="bg-rose-50" iconColor="text-rose-500" label="Absent Today" value={stats.absentToday} sub={`${absentPct}%`} subColor="text-rose-500" />
        <StatCard icon={Clock} iconBg="bg-amber-50" iconColor="text-amber-500" label="Late Today" value={stats.lateToday} sub={`${latePct}%`} subColor="text-amber-500" />
        <StatCard icon={BookOpen} iconBg="bg-violet-50" iconColor="text-violet-500" label="Subjects" value={stats.subjects} sub="Assigned" />
        <StatCard icon={CalendarDays} iconBg="bg-blue-50" iconColor="text-blue-500" label="Timetable Status" value={stats.timetableStatus} sub={stats.timetableUpdated} subColor="text-slate-400" />
      </div>

      {/* ── Tabs ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1.5 w-fit shadow-sm">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                isActive ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ─────────────────────────────────────────── */}
      <div className="flex-1">
        {activeTab === "students" && <Students onStartEnrollment={() => setShowEnrollment(true)} />}
        {activeTab === "teachers" && <SubjectTeachers />}
        {activeTab === "timetable" && <Timetable />}
        {activeTab === "attendance" && <Attendance />}
      </div>
    </div>
  );
}

export default Myclass;