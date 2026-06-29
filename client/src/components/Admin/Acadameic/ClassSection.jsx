
import React, { useState, useMemo } from "react";
import { OpenClass, CreateClassModal } from "./CreateClass";

// ─── Static data ────────────────────────────────────────────────────────────
const initialClasses = [
  { id: 1,  grade: "Grade 5",  section: "A", code: "G5-A",  year: "2025 – 2026", status: "Active",   teacher: "Priya N",   teacherRole: "Hindi Teacher",     teacherAvatar: null, students: 3,  capacity: 15, subjects: 6, attendance: 87.5, timetable: "Published",     createdAt: "13 Jun 2026" },
  { id: 2,  grade: "Grade 5",  section: "B", code: "G5-B",  year: "2025 – 2026", status: "Draft",    teacher: null,        teacherRole: null,                teacherAvatar: null, students: 0,  capacity: 15, subjects: 6, attendance: 0,    timetable: "Not Published", createdAt: "15 Jun 2026" },
  { id: 3,  grade: "Grade 6",  section: "A", code: "G6-A",  year: "2025 – 2026", status: "Active",   teacher: "Anita R",   teacherRole: "English Teacher",   teacherAvatar: null, students: 0,  capacity: 15, subjects: 7, attendance: 90.2, timetable: "Published",     createdAt: "10 Jun 2026" },
  { id: 4,  grade: "Grade 7",  section: "A", code: "G7-A",  year: "2025 – 2026", status: "Active",   teacher: "Divya S",   teacherRole: "SST Teacher",       teacherAvatar: null, students: 6,  capacity: 15, subjects: 7, attendance: 88.1, timetable: "Published",     createdAt: "11 Jun 2026" },
  { id: 5,  grade: "Grade 7",  section: "B", code: "G7-B",  year: "2025 – 2026", status: "Active",   teacher: "Karthik M", teacherRole: "Science Teacher",   teacherAvatar: null, students: 0,  capacity: 15, subjects: 7, attendance: 70.0, timetable: "Not Published", createdAt: "12 Jun 2026" },
  { id: 6,  grade: "Grade 8",  section: "A", code: "G8-A",  year: "2025 – 2026", status: "Active",   teacher: "Meena R",   teacherRole: "Computer Teacher",  teacherAvatar: null, students: 18, capacity: 15, subjects: 8, attendance: 91.3, timetable: "Published",     createdAt: "9 Jun 2026"  },
  { id: 7,  grade: "Grade 8",  section: "B", code: "G8-B",  year: "2025 – 2026", status: "Draft",    teacher: "Arun S",    teacherRole: "Maths Teacher",     teacherAvatar: null, students: 0,  capacity: 15, subjects: 8, attendance: 0,    timetable: "Not Published", createdAt: "9 Jun 2026"  },
  { id: 8,  grade: "Grade 9",  section: "A", code: "G9-A",  year: "2025 – 2026", status: "Active",   teacher: "Sneha T",   teacherRole: "Physics Teacher",   teacherAvatar: null, students: 12, capacity: 20, subjects: 9, attendance: 93.0, timetable: "Published",     createdAt: "8 Jun 2026"  },
  { id: 9,  grade: "Grade 10", section: "A", code: "G10-A", year: "2025 – 2026", status: "Active",   teacher: "Mohan L",   teacherRole: "Chemistry Teacher", teacherAvatar: null, students: 22, capacity: 22, subjects: 9, attendance: 85.0, timetable: "Published",     createdAt: "7 Jun 2026"  },
  { id: 10, grade: "Grade 10", section: "B", code: "G10-B", year: "2025 – 2026", status: "Active",   teacher: "Rekha B",   teacherRole: "Biology Teacher",   teacherAvatar: null, students: 0,  capacity: 23, subjects: 9, attendance: 65.0, timetable: "Not Published", createdAt: "7 Jun 2026"  },
  { id: 11, grade: "Grade 11", section: "A", code: "G11-A", year: "2025 – 2026", status: "Active",   teacher: "Suresh C",  teacherRole: "English Teacher",   teacherAvatar: null, students: 20, capacity: 25, subjects: 9, attendance: 89.5, timetable: "Published",     createdAt: "6 Jun 2026"  },
  { id: 12, grade: "Grade 12", section: "A", code: "G12-A", year: "2025 – 2026", status: "Active",   teacher: "Vijay P",   teacherRole: "Science Teacher",   teacherAvatar: null, students: 15, capacity: 25, subjects: 9, attendance: 92.0, timetable: "Published",     createdAt: "5 Jun 2026"  },
];

const PAGE_SIZE = 5;

// ─── Icons ───────────────────────────────────────────────────────────────────
const ChevronDown = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronUp = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);
const SearchIcon = () => (
  <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
  </svg>
);
const ResetIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const DotsIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
  </svg>
);
const CalIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);
const UsersIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);
const BookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
const statusStyle = {
  Active:   { dot: "bg-green-500",  badge: "text-green-700"  },
  Draft:    { dot: "bg-amber-400",  badge: "text-amber-700"  },
  Inactive: { dot: "bg-slate-400",  badge: "text-slate-500"  },
};

function StatusBadge({ status }) {
  const s = statusStyle[status] || statusStyle.Inactive;
  return (
    <span className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${s.dot}`} />
      <span className={`text-sm font-medium ${s.badge}`}>{status}</span>
    </span>
  );
}

function TeacherCell({ teacher, teacherRole, teacherAvatar }) {
  if (!teacher) {
    return (
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p className="text-sm text-slate-400">Not Assigned</p>
          <p className="text-xs text-slate-300">–</p>
        </div>
      </div>
    );
  }

  const initials = teacher.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const colors = ["bg-violet-100 text-violet-700", "bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-amber-100 text-amber-700"];
  const color = colors[teacher.charCodeAt(0) % colors.length];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden ${!teacherAvatar ? color : ""}`}>
        {teacherAvatar
          ? <img src={teacherAvatar} alt={teacher} className="w-8 h-8 rounded-full object-cover" />
          : initials}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{teacher}</p>
        <p className="text-xs text-slate-400">{teacherRole}</p>
      </div>
    </div>
  );
}

// ─── Grade Group Row ─────────────────────────────────────────────────────────
function GradeGroup({ grade, sections, isExpanded, onToggle, onOpenClass }) {
  const activeCount  = sections.filter(s => s.status === "Active").length;
  const draftCount   = sections.filter(s => s.status === "Draft").length;
  const totalStudents = sections.reduce((a, s) => a + s.students, 0);
  const totalCapacity = sections.reduce((a, s) => a + s.capacity, 0);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Grade header row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50 transition-colors text-left"
      >
        {/* Book icon */}
        <BookIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />

        {/* Grade name */}
        <span className="text-base font-bold text-slate-800 w-24 flex-shrink-0">{grade}</span>

        {/* Section count + status pills */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-slate-400">{sections.length} Section{sections.length !== 1 ? "s" : ""}</span>
          {activeCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {activeCount} Active
            </span>
          )}
          {draftCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {draftCount} Draft
            </span>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Aggregate stats — only when collapsed */}
        {!isExpanded && (
          <div className="flex items-center gap-6 mr-4">
            <span className="flex items-center gap-1.5 text-sm text-slate-500">
              <UsersIcon className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-slate-700">{totalStudents} / {totalCapacity}</span>
              <span className="text-slate-400">Students</span>
            </span>
            <span className="text-sm text-slate-500">
              <span className="font-semibold text-slate-700">{totalCapacity}</span>
              <span className="text-slate-400 ml-1">Capacity</span>
            </span>
          </div>
        )}

        {/* Chevron */}
        <span className="text-slate-400 flex-shrink-0">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </span>
      </button>

      {/* Expanded: section table */}
      {isExpanded && (
        <div className="border-t border-slate-100">
          {/* Table header */}
          <div className="grid px-5 py-2.5 bg-slate-50/70 border-b border-slate-100"
            style={{ gridTemplateColumns: "3rem 1.8fr 2fr 1fr 1fr 1fr 1fr 9rem" }}>
            {["", "Class / Code", "Class Teacher", "Students", "Capacity", "Status", "Created On", "Actions"].map((h, i) => (
              <span key={i} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</span>
            ))}
          </div>

          {/* Section rows */}
          {sections.map((cls) => (
            <div
              key={cls.id}
              className="grid items-center px-5 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50 transition-colors"
              style={{ gridTemplateColumns: "3rem 1.8fr 2fr 1fr 1fr 1fr 1fr 9rem" }}
            >
              {/* Section letter badge */}
              <div>
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                  {cls.section}
                </span>
              </div>

              {/* Class / Code */}
              <div>
                <p className="text-sm font-semibold text-slate-800">{grade} ({cls.section})</p>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{cls.code}</p>
              </div>

              {/* Teacher */}
              <TeacherCell teacher={cls.teacher} teacherRole={cls.teacherRole} teacherAvatar={cls.teacherAvatar} />

              {/* Students */}
              <span className="flex items-center gap-1.5 text-sm text-slate-600">
                <UsersIcon className="w-4 h-4 text-indigo-400" />
                {cls.students} / {cls.capacity}
              </span>

              {/* Capacity */}
              <span className="text-sm text-slate-600">{cls.capacity}</span>

              {/* Status */}
              <StatusBadge status={cls.status} />

              {/* Created on */}
              <span className="text-sm text-slate-400">{cls.createdAt}</span>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenClass(cls)}
                  className="flex-1 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg px-3 py-1.5 hover:bg-indigo-50 transition-colors whitespace-nowrap"
                >
                  Open Class
                </button>
                <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors flex-shrink-0">
                  <DotsIcon />
                </button>
              </div>
            </div>
          ))}

          {/* Show Grade Summary footer */}
          <button className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50/50 transition-colors border-t border-slate-100">
            Show Grade Summary <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ClassSection() {
  const [allClasses, setAllClasses]     = useState(initialClasses);
  const [expandedGrades, setExpandedGrades] = useState({ "Grade 5": true }); // first grade open by default
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [gradeFilter, setGradeFilter]   = useState("All Grades");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [openClass, setOpenClass]       = useState(null);
  const [showCreate, setShowCreate]     = useState(false);

  // Filter classes
  const filtered = useMemo(() => allClasses.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q
      || c.grade.toLowerCase().includes(q)
      || c.code.toLowerCase().includes(q)
      || (c.teacher || "").toLowerCase().includes(q);
    const matchGrade  = gradeFilter  === "All Grades"  || c.grade === gradeFilter;
    const matchStatus = statusFilter === "All Status"  || c.status === statusFilter;
    return matchSearch && matchGrade && matchStatus;
  }), [allClasses, search, gradeFilter, statusFilter]);

  // Group by grade
  const gradeGroups = useMemo(() => {
    const map = {};
    filtered.forEach(c => {
      if (!map[c.grade]) map[c.grade] = [];
      map[c.grade].push(c);
    });
    // sort grades naturally
    return Object.entries(map).sort((a, b) => {
      const num = s => parseInt(s[0].replace(/\D/g, ""), 10) || 0;
      return num(a) - num(b);
    });
  }, [filtered]);

  // Pagination over grade groups
  const totalPages  = Math.ceil(gradeGroups.length / PAGE_SIZE);
  const pagedGroups = gradeGroups.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const uniqueGrades = [...new Set(allClasses.map(c => c.grade))].sort((a, b) => {
    return parseInt(a.replace(/\D/g, "")) - parseInt(b.replace(/\D/g, ""));
  });

  const toggleGrade = (grade) =>
    setExpandedGrades(prev => ({ ...prev, [grade]: !prev[grade] }));

  const handleCreated = (newClass) => setAllClasses(prev => [newClass, ...prev]);

  if (openClass) {
    return <OpenClass cls={openClass} onBack={() => setOpenClass(null)} />;
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Class Sections</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage all class sections across the school.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <CalIcon className="w-4 h-4 text-indigo-500" />
            <span className="text-slate-400">Academic Year</span>
            <span className="font-semibold text-slate-700">2025 – 2026</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon /> Create Class Section
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 flex-1 min-w-[220px] shadow-sm">
          <SearchIcon />
          <input
            className="text-sm text-slate-600 outline-none bg-transparent w-full placeholder-slate-400"
            placeholder="Search by grade, section or class code..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          value={gradeFilter}
          onChange={e => { setGradeFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          <option>All Grades</option>
          {uniqueGrades.map(g => <option key={g}>{g}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
        >
          {["All Status", "Active", "Draft", "Inactive"].map(o => <option key={o}>{o}</option>)}
        </select>

        <select className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors">
          <option>All Class Teachers</option>
        </select>

        <button
          onClick={() => { setSearch(""); setGradeFilter("All Grades"); setStatusFilter("All Status"); setPage(1); }}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 border border-slate-200 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
        >
          <ResetIcon /> Reset
        </button>
      </div>

      {/* ── Grade Groups List ── */}
      <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-0.5">
        {pagedGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
            No class sections match your filters.
          </div>
        ) : (
          pagedGroups.map(([grade, sections]) => (
            <GradeGroup
              key={grade}
              grade={grade}
              sections={sections}
              isExpanded={!!expandedGrades[grade]}
              onToggle={() => toggleGrade(grade)}
              onOpenClass={setOpenClass}
            />
          ))
        )}
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between flex-shrink-0 pt-1">
        <p className="text-sm text-slate-400">
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, gradeGroups.length)} to{" "}
          {Math.min(page * PAGE_SIZE, gradeGroups.length)} of {gradeGroups.length} grades
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >‹</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                n === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
            >{n}</button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >›</button>
        </div>
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

export default ClassSection;
