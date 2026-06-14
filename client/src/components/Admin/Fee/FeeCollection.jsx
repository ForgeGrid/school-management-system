import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search, ChevronDown, Plus, Eye, Edit2, MoreVertical,
  Calendar, BarChart2, AlertTriangle, Filter,
  ChevronLeft, ChevronRight, GraduationCap, Clock, FileText, FileEdit, Archive
} from "lucide-react";
import FeeCreate from "./FeeCreate";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import {
  getAcademicFeeStructures,
  activateAcademicFeeStructure,
  archiveAcademicFeeStructure,
  setFilters,
  clearError,
  selectStructures,
  selectTotalCount,
  selectLoading,
  selectError,
  selectFilters,
} from "../../../redux/slice/academicFeeStructureSlice";
import { FontLoader } from "../../../fonts/plusJakartaSans";

const SC = {
  active:   { badge: "bg-green-50 border border-green-200 text-green-600",  dot: "bg-green-400" },
  draft:    { badge: "bg-amber-50 border border-amber-200 text-amber-600",  dot: "bg-amber-400" },
  archived: { badge: "bg-slate-50 border border-slate-200 text-slate-500",  dot: "bg-slate-400" },
};

// ── Select wrapper ──────────────────────────────────────────────────────────
const SelWrap = ({ label, value, onChange, opts }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="py-[7px] pl-2.5 pr-7 border border-slate-200 rounded-lg text-[12.5px] font-semibold text-slate-700 bg-white cursor-pointer"
      >
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
    </div>
  </div>
);

// ── Main component ──────────────────────────────────────────────────────────
export default function AcademicFeeStructures() {
  const dispatch = useDispatch();

  // Redux state
  const structures  = useSelector(selectStructures);
  const totalCount  = useSelector(selectTotalCount);
  const loading     = useSelector(selectLoading);
  const error       = useSelector(selectError);
  const filters     = useSelector(selectFilters);

  // Local UI state (no data, purely view concerns)
  const [view, setView]                 = useState("list");
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [openMenuId, setOpenMenuId]     = useState(null);

  const [search,  setSearch]  = useState("");
  const [yearF,   setYearF]   = useState("All Years");
  const [gradeF,  setGradeF]  = useState("All Standards");
  const [statF,   setStatF]   = useState("All Status");
  const [sortBy,  setSortBy]  = useState("Last Updated");
  const [acYear,  setAcYear]  = useState("2025 - 2026");
  const [page,    setPage]    = useState(1);
  const PER = 8;

  // ── Fetch on mount and when server-side filters change ──
  const fetchStructures = useCallback(() => {
    const params = {};
    if (yearF  !== "All Years")     params.academicYear = yearF;
    if (gradeF !== "All Standards") params.standard     = gradeF;
    if (statF  !== "All Status")    params.status       = statF.toLowerCase();
    params.page  = page;
    params.limit = PER;
    dispatch(getAcademicFeeStructures(params));
  }, [dispatch, yearF, gradeF, statF, page]);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  // Show redux errors as toasts
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // ── Derived counts from current page data ──
  const activeN   = structures.filter(r => r.status === "active").length;
  const draftN    = structures.filter(r => r.status === "draft").length;
  const archivedN = structures.filter(r => r.status === "archived").length;

  // ── Client-side search filter (on top of server results) ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return structures;
    return structures.filter(r =>
      (r.standard?.toLowerCase().includes(q) || r.academicYear?.includes(q))
    );
  }, [search, structures]);

  const totalPg = Math.max(1, Math.ceil(totalCount / PER));
  const paged   = filtered; // server already paginates; show all returned items

  const statCards = [
    { Icon: GraduationCap, iconBg: "bg-blue-50",   iconColor: "text-blue-600",  label: "Total Structures",    val: totalCount,  sub: "All fee structures",  subColor: "text-slate-400" },
    { Icon: FileText,      iconBg: "bg-emerald-50", iconColor: "text-green-600", label: "Active Structures",   val: activeN,     sub: "Currently active",    subColor: "text-green-600" },
    { Icon: FileEdit,      iconBg: "bg-amber-50",   iconColor: "text-amber-600", label: "Draft Structures",    val: draftN,      sub: "Pending activation",  subColor: "text-amber-600" },
    { Icon: Archive,       iconBg: "bg-slate-100",  iconColor: "text-slate-500", label: "Archived Structures", val: archivedN,   sub: "Historical records",  subColor: "text-slate-400" },
  ];

  const infoCards = [
    { Icon: Calendar,      iconBg: "bg-blue-50",    iconColor: "text-blue-600",   label: "Current Academic Year",         val: acYear,      sub: null },
    { Icon: Clock,         iconBg: "bg-violet-50",  iconColor: "text-violet-600", label: "Recently Updated",              val: structures[0]?.standard ?? "—", sub: structures[0] ? "Latest record" : null },
    { Icon: BarChart2,     iconBg: "bg-emerald-50", iconColor: "text-green-600",  label: "Most Used Standard",            val: "Grade 10",  sub: null },
    { Icon: AlertTriangle, iconBg: "bg-amber-50",   iconColor: "text-amber-600",  label: "Structures Pending Activation", val: String(draftN), sub: "Draft structures" },
  ];

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleSave = () => {
    // After create/edit, re-fetch the list
    fetchStructures();
  };

  const handleActivate = async (rec) => {
    setOpenMenuId(null);
    const res = await dispatch(activateAcademicFeeStructure(rec._id));
    if (activateAcademicFeeStructure.fulfilled.match(res)) {
      toast.success("Structure activated successfully");
    }
  };

  const handleArchive = async (rec) => {
    setOpenMenuId(null);
    const res = await dispatch(archiveAcademicFeeStructure(rec._id));
    if (archiveAcademicFeeStructure.fulfilled.match(res)) {
      toast.success("Structure archived successfully");
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ── Format helpers ───────────────────────────────────────────────────────

  const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const totalAmount = (feeHeads = []) =>
    feeHeads.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  const mandatoryCount = (feeHeads = []) =>
    feeHeads.filter(h => h.mandatory).length;

  // ── Views ────────────────────────────────────────────────────────────────

  if (view === "create" || view === "edit") {
    return (
      <FeeCreate
        onBack={() => setView("list")}
        onSave={handleSave}
        initialData={selectedStructure}
      />
    );
  }

  return (
    <>
      <FontLoader />
      <div className="afs flex flex-col h-full min-h-0 gap-3 text-slate-800 pb-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 tracking-tight m-0">Academic Fee Structures</h1>
            <p className="text-[13px] text-slate-500 font-medium mt-1 mb-0">
              Manage and organize academic fee structures across standards and academic years.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Academic Year selector */}
            <div className="relative flex items-center">
              <Calendar size={14} className="absolute left-3 pointer-events-none text-blue-600" />
              <span className="absolute left-8 text-[12.5px] font-semibold text-slate-600 pointer-events-none">
                Academic Year:
              </span>
              <select
                value={acYear}
                onChange={e => { setAcYear(e.target.value); setYearF(e.target.value); setPage(1); }}
                className="py-2 pr-8 pl-[125px] border border-slate-300 rounded-[10px] text-[12.5px] font-bold text-slate-900 bg-white cursor-pointer appearance-none"
              >
                <option>2025 - 2026</option>
                <option>2024 - 2025</option>
                <option>2026 - 2027</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 pointer-events-none text-slate-500" />
            </div>

            {/* Create button */}
            <button
              onClick={() => { setSelectedStructure(null); setView("create"); }}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-[10px] text-[13px] font-bold border-none"
            >
              <Plus size={14} strokeWidth={2.5} />
              Create Fee Structure
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-4 gap-2.5 shrink-0">
          {statCards.map(({ Icon, iconBg, iconColor, label, val, sub, subColor }) => (
            <div key={label} className="bg-white border border-slate-200 rounded-2xl p-6 flex items-center gap-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className={`w-[50px] h-[50px] rounded-[10px] ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={24} className={iconColor} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
                <div className="text-[22px] font-extrabold text-slate-900 leading-none">{val}</div>
                <div className={`text-[10.5px] font-semibold mt-0.5 ${subColor}`}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

   

        {/* ── Table card ── */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex-1 min-h-0 flex flex-col">

          {/* Toolbar */}
          <div className="px-3.5 py-2 border-b border-slate-100 flex items-end gap-2.5 flex-wrap shrink-0">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
              <input
                type="text"
                placeholder="Search by standard, academic year, or fee structure..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full py-2 pl-8 pr-3 border border-slate-200 rounded-lg text-[12px] text-slate-700 font-medium bg-white"
              />
            </div>

            <SelWrap label="Academic Year"    value={yearF}  onChange={v => { setYearF(v);  setPage(1); }} opts={["All Years","2025 - 2026","2024 - 2025","2023 - 2024"]} />
            <SelWrap label="Standard / Grade" value={gradeF} onChange={v => { setGradeF(v); setPage(1); }} opts={["All Standards","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"]} />
            <SelWrap label="Status"           value={statF}  onChange={v => { setStatF(v);  setPage(1); }} opts={["All Status","Active","Draft","Archived"]} />
            <SelWrap label="Sort By"          value={sortBy} onChange={setSortBy}                         opts={["Last Updated","Amount","Grade"]} />

            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-transparent">x</span>
              <button className="flex items-center gap-1.5 px-3 py-[7px] border border-slate-200 rounded-lg text-[12.5px] font-semibold text-slate-700 bg-white">
                <Filter size={13} className="text-slate-500" /> Filters
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-y-auto flex-1">
            {loading.getAll ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                <span className="text-[13px] font-semibold">Loading structures...</span>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50 border-b border-slate-200">
                    {[
                      { label: "Academic Year",       align: "left" },
                      { label: "Standard / Grade",    align: "left" },
                      { label: "Total Fee Heads",     align: "center" },
                      { label: "Mandatory Fee Heads", align: "center" },
                      { label: "Total Amount",        align: "center" },
                      { label: "Status",              align: "left" },
                      { label: "Last Updated",        align: "left" },
                      { label: "Actions",             align: "left" },
                    ].map(({ label, align }) => (
                      <th
                        key={label}
                        className={`px-3.5 py-2 text-[10px] font-bold text-slate-500 whitespace-nowrap tracking-widest uppercase text-${align}`}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.map((rec, idx) => {
                    const statusKey = rec.status?.toLowerCase();
                    const s = SC[statusKey] || SC.archived;
                    const feeHeads   = rec.feeHeads || [];
                    const totalAmt   = totalAmount(feeHeads);
                    const mandCount  = mandatoryCount(feeHeads);
                    const updatedAt  = rec.updatedAt || rec.createdAt;
                    const updatedBy  = rec.updatedBy?.name || rec.createdBy?.name || "Admin User";

                    return (
                      <tr
                        key={rec._id}
                        className={`bg-white hover:bg-slate-50 transition-colors duration-100 ${idx < paged.length - 1 ? "border-b border-slate-100" : ""}`}
                      >
                        {/* Academic Year */}
                        <td className="px-3.5 py-2 text-[13px] font-bold text-slate-900">{rec.academicYear}</td>

                        {/* Grade */}
                        <td className="px-3.5 py-2">
                          <div className="text-[13.5px] font-extrabold text-slate-900">{rec.standard}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{feeHeads.length} Fee Heads</div>
                        </td>

                        {/* Total Fee Heads */}
                        <td className="px-3.5 py-2 text-center text-[13.5px] font-bold text-slate-700">{feeHeads.length}</td>

                        {/* Mandatory Fee Heads */}
                        <td className="px-3.5 py-2 text-center text-[13.5px] font-bold text-slate-700">{mandCount}</td>

                        {/* Amount */}
                        <td className="px-3.5 py-2 text-center text-[13.5px] font-bold text-slate-900">
                          ₹ {totalAmt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </td>

                        {/* Status */}
                        <td className="px-3.5 py-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${s.badge}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                          </span>
                          {rec.status === "draft" && (
                            <div className="text-[10.5px] text-slate-400 mt-0.5">Pending activation</div>
                          )}
                        </td>

                        {/* Last Updated */}
                        <td className="px-3.5 py-2">
                          <div className="text-[12.5px] font-semibold text-slate-600">{formatDate(updatedAt)}</div>
                          <div className="text-[11px] text-slate-400 font-medium mt-0.5">{formatTime(updatedAt)}</div>
                          <div className="text-[11px] text-slate-400 font-medium">{updatedBy}</div>
                        </td>

                        {/* Actions */}
                        <td className="px-3.5 py-2 relative">
                          <div className="flex items-center gap-1.5">
                            {/* View */}
                            <button
                              onClick={() => { setSelectedStructure(rec); setView("edit"); }}
                              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
                              title="View Structure"
                            >
                              <Eye size={13} className="text-slate-500" />
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => { setSelectedStructure(rec); setView("edit"); }}
                              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
                              title="Edit Structure"
                            >
                              <Edit2 size={13} className="text-slate-500" />
                            </button>

                            {/* More */}
                            <button
                              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === rec._id ? null : rec._id); }}
                              className="w-8 h-8 rounded-full border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"
                              title="More Actions"
                            >
                              <MoreVertical size={13} className="text-slate-500" />
                            </button>

                            {/* Dropdown */}
                            {openMenuId === rec._id && (
                              <div
                                onClick={e => e.stopPropagation()}
                                className="absolute right-4 top-12 bg-white border border-slate-300 rounded-xl shadow-lg z-50 w-36 flex flex-col py-1"
                              >
                                <button
                                  onClick={() => handleActivate(rec)}
                                  disabled={loading.activate}
                                  className="w-full px-3 py-2 border-none bg-transparent text-left text-[12px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {loading.activate ? "Activating..." : "Activate"}
                                </button>
                                <button
                                  onClick={() => handleArchive(rec)}
                                  disabled={loading.archive}
                                  className="w-full px-3 py-2 border-none bg-transparent text-left text-[12px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  {loading.archive ? "Archiving..." : "Archive"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {!loading.getAll && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Search size={30} className="mb-2.5 opacity-25" />
                <p className="text-[14px] font-semibold">No records found</p>
                <p className="text-[12px] font-medium mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 shrink-0">
            {/* Left legend */}
            <div className="flex items-center gap-3.5 text-[12px] text-slate-500 font-medium">
              <span>Showing {paged.length} of {totalCount} structures</span>
              {[
                { l: "Active",   dot: "bg-green-400", n: activeN },
                { l: "Draft",    dot: "bg-amber-400", n: draftN },
                { l: "Archived", dot: "bg-slate-400", n: archivedN },
              ].map(({ l, dot, n }) => (
                <span key={l} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
                  {l}: {n}
                </span>
              ))}
              <span>· Total: {totalCount}</span>
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 border border-slate-200 rounded-[7px] bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={13} className="text-slate-500" />
              </button>

              {Array.from({ length: totalPg }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-[7px] text-[12px] font-bold border cursor-pointer
                    ${page === p
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "bg-white border-slate-200 text-slate-700"}`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPg, p + 1))}
                disabled={page === totalPg}
                className="w-7 h-7 border border-slate-200 rounded-[7px] bg-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={13} className="text-slate-500" />
              </button>

              <span className="text-[12px] text-slate-400 ml-1.5 font-medium">{PER} / page</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}