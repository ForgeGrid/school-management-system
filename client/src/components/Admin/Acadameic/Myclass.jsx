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
  Plus,
} from "lucide-react";

import { Students } from "./Students";
import { SubjectTeachers } from "./SubjectTeachers";
import { Timetable } from "./ClassTimetable";
import { Attendance } from "./ClassAttendance";

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

const TABS = [
  { key: "students", label: "Students", icon: Users },
  { key: "teachers", label: "Subject Teachers", icon: Users2 },
  { key: "timetable", label: "Timetable", icon: CalendarDays },
  { key: "attendance", label: "Attendance", icon: ClipboardCheck },
];

function StatCard({ icon: Icon, iconBg, iconColor, label, value, sub, subColor, progress }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-2 min-w-0">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <p className="text-xs font-semibold text-slate-400 truncate">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold text-slate-800">{value}</span>
        {sub && <span className={`text-xs font-bold ${subColor || "text-slate-400"}`}>{sub}</span>}
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

export function Myclass() {
  const [activeTab, setActiveTab] = useState("students");
  const { stats } = CLASS_INFO;

  const presentPct = Math.round((stats.presentToday / stats.enrolled) * 1000) / 10;
  const absentPct = Math.round((stats.absentToday / stats.enrolled) * 1000) / 10;
  const latePct = Math.round((stats.lateToday / stats.enrolled) * 1000) / 10;
  const capacityPct = Math.round((stats.enrolled / stats.capacity) * 100);

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
          { label: "Enroll Students", sub: "Add new students", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", action: () => setActiveTab("students") },
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
        <StatCard
          icon={Users}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-500"
          label="Enrolled Students"
          value={stats.enrolled}
          sub={`/ ${stats.capacity} Capacity`}
          progress={capacityPct}
        />
        <StatCard
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-500"
          label="Present Today"
          value={stats.presentToday}
          sub={`${presentPct}%`}
          subColor="text-emerald-500"
        />
        <StatCard
          icon={XCircle}
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
          label="Absent Today"
          value={stats.absentToday}
          sub={`${absentPct}%`}
          subColor="text-rose-500"
        />
        <StatCard
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Late Today"
          value={stats.lateToday}
          sub={`${latePct}%`}
          subColor="text-amber-500"
        />
        <StatCard
          icon={BookOpen}
          iconBg="bg-violet-50"
          iconColor="text-violet-500"
          label="Subjects"
          value={stats.subjects}
          sub="Assigned"
        />
        <StatCard
          icon={CalendarDays}
          iconBg="bg-blue-50"
          iconColor="text-blue-500"
          label="Timetable Status"
          value={stats.timetableStatus}
          sub={stats.timetableUpdated}
          subColor="text-slate-400"
        />
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
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:text-indigo-600 hover:bg-slate-50"
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
        {activeTab === "students" && <Students />}
        {activeTab === "teachers" && <SubjectTeachers />}
        {activeTab === "timetable" && <Timetable />}
        {activeTab === "attendance" && <Attendance />}
      </div>
    </div>
  );
}

export default Myclass;