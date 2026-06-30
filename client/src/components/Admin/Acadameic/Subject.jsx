import { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Search,
  SlidersHorizontal,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

// ── Sample Data ───────────────────────────────────────────────────────────────
const SUBJECTS = [
  { id: 1, name: "Mathematics",     code: "MATH", description: "Study of numbers, shapes, and patterns.",         status: "Active" },
  { id: 2, name: "Physics",         code: "PHY",  description: "Study of matter, energy and the universe.",       status: "Active" },
  { id: 3, name: "Chemistry",       code: "CHEM", description: "Study of substances and chemical reactions.",     status: "Active" },
  { id: 4, name: "Biology",         code: "BIO",  description: "Study of living organisms and life processes.",   status: "Active" },
  { id: 5, name: "English",         code: "ENG",  description: "English language and literature.",                status: "Active" },
  { id: 6, name: "History",         code: "HIST", description: "Study of past events and civilizations.",         status: "Inactive" },
  { id: 7, name: "Geography",       code: "GEO",  description: "Study of the Earth and its environments.",        status: "Active" },
  { id: 8, name: "Computer Science",code: "CS",   description: "Fundamentals of computers and programming.",      status: "Inactive" },
  { id: 9, name: "Economics",       code: "ECO",  description: "Study of production, distribution and consumption.", status: "Active" },
  { id: 10,name: "Political Science",code:"POL",  description: "Study of government systems and political activity.", status: "Active" },
  { id: 11,name: "Accountancy",     code: "ACC",  description: "Principles of financial accounting.",             status: "Active" },
  { id: 12,name: "Business Studies",code: "BUS",  description: "Study of commerce and business management.",      status: "Active" },
  { id: 13,name: "Physical Education",code:"PE",  description: "Health, fitness and sports education.",           status: "Active" },
  { id: 14,name: "Fine Arts",       code: "ART",  description: "Visual arts, drawing and creative expression.",   status: "Active" },
  { id: 15,name: "Music",           code: "MUS",  description: "Theory and practice of music.",                  status: "Active" },
  { id: 16,name: "Sanskrit",        code: "SAN",  description: "Classical language and literature.",              status: "Active" },
  { id: 17,name: "Hindi",           code: "HIN",  description: "Hindi language and literature.",                  status: "Active" },
  { id: 18,name: "Tamil",           code: "TAM",  description: "Tamil language and literature.",                  status: "Active" },
  { id: 19,name: "French",          code: "FRE",  description: "French language and culture.",                    status: "Active" },
  { id: 20,name: "Environmental Science",code:"EVS",description:"Study of the natural environment.",             status: "Active" },
  { id: 21,name: "Psychology",      code: "PSY",  description: "Study of mind and human behaviour.",             status: "Active" },
  { id: 22,name: "Sociology",       code: "SOC",  description: "Study of society and social behaviour.",          status: "Active" },
  { id: 23,name: "Statistics",      code: "STAT", description: "Collection, analysis and interpretation of data.",status: "Active" },
  { id: 24,name: "Information Technology",code:"IT",description:"Applied computing and IT skills.",             status: "Active" },
  { id: 25,name: "Home Science",    code: "HS",   description: "Study of home management and nutrition.",         status: "Active" },
  { id: 26,name: "Drawing",         code: "DRW",  description: "Technical and freehand drawing skills.",          status: "Active" },
  { id: 27,name: "Moral Science",   code: "MS",   description: "Ethics, values and character education.",         status: "Inactive" },
  { id: 28,name: "Robotics",        code: "ROB",  description: "Introduction to robotics and automation.",        status: "Inactive" },
];

// ── Avatar colour palette (uses inline styles to avoid Tailwind v4 purge issues)
const AVATAR_PALETTE = [
  { bg: "#fef2f2", color: "#dc2626" },  // red
  { bg: "#f5f3ff", color: "#7c3aed" },  // purple
  { bg: "#fefce8", color: "#ca8a04" },  // yellow
  { bg: "#f0fdf4", color: "#16a34a" },  // green
  { bg: "#fff7ed", color: "#ea580c" },  // orange
  { bg: "#fdf2f8", color: "#db2777" },  // pink
  { bg: "#f0fdfa", color: "#0d9488" },  // teal
  { bg: "#ecfeff", color: "#0891b2" },  // cyan
  { bg: "#eef2ff", color: "#4f46e5" },  // indigo
  { bg: "#f7fee7", color: "#65a30d" },  // lime
  { bg: "#fffbeb", color: "#d97706" },  // amber
  { bg: "#ecfdf5", color: "#059669" },  // emerald
  { bg: "#eff6ff", color: "#2563eb" },  // blue
  { bg: "#f5f3ff", color: "#6d28d9" },  // violet
  { bg: "#fff1f2", color: "#e11d48" },  // rose
  { bg: "#f0f9ff", color: "#0284c7" },  // sky
];

const getAvatarStyle = (name) => {
  const code = (name?.[0]?.toUpperCase() ?? "A").charCodeAt(0) - 65;
  const palette = AVATAR_PALETTE[Math.abs(code) % AVATAR_PALETTE.length];
  return { backgroundColor: palette.bg, color: palette.color };
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, iconBg, iconColor, label, value, sub }) => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: iconBg }}
    >
      <span style={{ color: iconColor }}>{icon}</span>
    </div>
    <div>
      <p className="text-xs text-slate-400 font-medium mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  </div>
);

// ── Action Menu ───────────────────────────────────────────────────────────────
const ActionMenu = ({ onEdit, onDelete, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20 min-w-[140px]"
    >
      <button
        onClick={onEdit}
        className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <Pencil className="w-3.5 h-3.5" /> Edit
      </button>
      <button
        onClick={onDelete}
        className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Subject() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Status");
  const [page, setPage]           = useState(1);
  // Default page size set to 5 for now (pagination kept minimal until backend wiring)
  const [perPage, setPerPage]     = useState(5);
  const [showPerPage, setShowPerPage] = useState(false);
  const [openMenu, setOpenMenu]   = useState(null);

  const perPageRef = useRef(null);

  // Close per-page dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (perPageRef.current && !perPageRef.current.contains(e.target)) setShowPerPage(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const total    = SUBJECTS.length;
  const active   = SUBJECTS.filter(s => s.status === "Active").length;
  const inactive = SUBJECTS.filter(s => s.status === "Inactive").length;

  // Filter
  const filtered = SUBJECTS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const clearFilters = () => { setSearch(""); setStatus("All Status"); setPage(1); };
  const handleSearch = (v) => { setSearch(v); setPage(1); };
  const handleStatus = (v) => { setStatus(v); setPage(1); };

  return (
    <div className="flex flex-col gap-6  h-full ">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Subjects</h1>
          <p className="text-sm text-slate-400 mt-0.5">Manage all subjects available in your school.</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Subject
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<BookOpen className="w-6 h-6" />}
          iconBg="#eef2ff"
          iconColor="#6366f1"
          label="Total Subjects"
          value={total}
          sub="All subjects in your school"
        />
        <StatCard
          icon={<CheckCircle2 className="w-6 h-6" />}
          iconBg="#f0fdf4"
          iconColor="#22c55e"
          label="Active Subjects"
          value={active}
          sub="Currently active"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          iconBg="#fff7ed"
          iconColor="#f97316"
          label="Inactive Subjects"
          value={inactive}
          sub="Currently inactive"
        />
      </div>

      {/* ── Filters + Table Card ── */}
      <div className="bg-white border border-slate-200 rounded-xl -mt-4">
        {/* Filters bar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Search by name, code or description..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Status filter */}
          <div className="relative">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={e => handleStatus(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all bg-white min-w-[150px] cursor-pointer"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Clear */}
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-4 h-4" /> Clear Filters
          </button>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto -mt-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-slate-100 bg-slate-50/60">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide w-10">#</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">Subject Name <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">Code <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Description</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  <span className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-600 transition-colors">Status <ArrowUpDown className="w-3.5 h-3.5" /></span>
                </th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-slate-300" />
                      <span>No subjects match your filters.</span>
                    </div>
                  </td>
                </tr>
              ) : paged.map((s, i) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-indigo-50/30 transition-colors">
                  <td className="px-5 py-3.5 text-slate-400 text-xs font-medium">{(page - 1) * perPage + i + 1}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={getAvatarStyle(s.name)}
                      >
                        {s.name[0]}
                      </span>
                      <span className="font-semibold text-slate-700">{s.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      {s.code}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{s.description}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                      ${s.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-orange-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Active" ? "bg-emerald-500" : "bg-orange-400"}`} />
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 relative">
                      <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-indigo-500 hover:bg-indigo-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {openMenu === s.id && (
                        <ActionMenu
                          onEdit={() => { setOpenMenu(null); }}
                          onDelete={() => { setOpenMenu(null); }}
                          onClose={() => setOpenMenu(null)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Showing {filtered.length === 0 ? 0 : (page - 1) * perPage + 1} to {Math.min(page * perPage, filtered.length)} of {filtered.length} subjects
          </p>

          <div className="flex items-center gap-1.5">
            {/* Prev */}
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors
                      ${page === p
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                  >
                    {p}
                  </button>
                )
              )}

            {/* Next */}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Per page dropdown */}
            <div className="relative ml-2" ref={perPageRef}>
              <button
                onClick={() => setShowPerPage(v => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {perPage} / page <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {showPerPage && (
                <div className="absolute bottom-full mb-1 right-0 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden z-20">
                  {[5, 10, 20, 50].map(n => (
                    <button
                      key={n}
                      onClick={() => { setPerPage(n); setPage(1); setShowPerPage(false); }}
                      className={`block w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors ${perPage === n ? "text-indigo-600 bg-indigo-50/50" : "text-slate-600"}`}
                    >
                      {n} / page
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}