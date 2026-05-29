import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown, Plus, LayoutGrid, Bus, AlertTriangle, Info,
  Search, Filter, RotateCcw, Eye, MoreVertical,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import {
  getAllTransportFeeStructures,
  selectAllFeeStructures,
  selectFeeStructureLoading,
  selectFeeStructureNotif,
  clearNotification as clearFeeNotif,
} from "../../../redux/slice/transportFeeStructureSlice";

import {
  getAllBusRoutes,
  archiveBusRoute,
  activateBusRoute,
  selectAllBusRoutes,
  selectBusRouteLoading,
  selectBusRouteNotif,
  clearNotification as clearRouteNotif,
} from "../../../redux/slice/busRouteSlice";

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
const IconMoneyBag = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 11c1.5 0 2.5.8 2.5 2s-1 2-2.5 2v-4z" />
    <path d="M5 11c-1.5 0-2.5.8-2.5 2s1 2 2.5 2v-4z" />
    <path d="M12 6c-3 0-5.5 1.5-6 4v4c0 3 2 5 6 5s6-2 6-5v-4c-.5-2.5-3-4-6-4z" />
    <path d="M12 2c-1.5 0-2 .5-2 1.5S10.5 5 12 5s2-.5 2-1.5S13.5 2 12 2z" />
    <path d="M12 9v7M14.5 11.5H10a1.5 1.5 0 0 0 0 3h3a1.5 1.5 0 0 1 0 3H9" />
  </svg>
);

const IconFileText = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

const ITEMS_PER_PAGE = 5;
const ACADEMIC_YEARS = ["2024 - 2025", "2025 - 2026", "2026 - 2027"];

const statusBadgeClass = {
  Configured: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Partial:    "bg-amber-50 text-amber-600 border border-amber-200",
  Pending:    "bg-red-50 text-red-500 border border-red-200",
  Archived:   "bg-slate-100 text-slate-500 border border-slate-200",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const deriveFeeStatus = (route, routeFees = []) => {
  // If the route itself is archived, reflect that
  if (route.status === "archived") return "Archived";

  const billableCount = route.stops?.length ?? 0;
  if (billableCount === 0) return "Pending";

  const activeFees   = routeFees.filter((f) => f.status === "active").length;
  const archivedFees = routeFees.filter((f) => f.status === "archived").length;

  if (activeFees === 0 && archivedFees > 0) return "Archived";
  if (activeFees === 0)                      return "Pending";
  if (activeFees >= billableCount)            return "Configured";
  return "Partial";
};

const formatDate = (dateString) => {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function TransportFeeOverview({ onConfigureRoute }) {
  const dispatch = useDispatch();
  const user     = useSelector((s) => s.getme?.user);

  // ── Redux ─────────────────────────────────────────────────────────────────
  const routes         = useSelector(selectAllBusRoutes);
  const feeStructures  = useSelector(selectAllFeeStructures);
  const isFetchingRoutes = useSelector(selectBusRouteLoading("getAllBusRoutes"));
  const isFetchingFees   = useSelector(selectFeeStructureLoading("getAll"));
  const feeNotif         = useSelector(selectFeeStructureNotif);
  const busRouteNotif    = useSelector(selectBusRouteNotif);
  const isLoading        = isFetchingRoutes || isFetchingFees;

  // ── UI state ──────────────────────────────────────────────────────────────
  const [selectedYearGlobal,  setSelectedYearGlobal]  = useState(ACADEMIC_YEARS[1]);
  const [overviewSearch,      setOverviewSearch]       = useState("");
  const [overviewYearFilter,  setOverviewYearFilter]   = useState("All Years");
  const [overviewStatusFilter,setOverviewStatusFilter] = useState("All Status");
  const [overviewSortBy,      setOverviewSortBy]       = useState("Last Updated");
  const [currentPage,         setCurrentPage]          = useState(1);
  const [openMenuId,          setOpenMenuId]           = useState(null);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest("[data-menu]")) setOpenMenuId(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.school_id) return;
    dispatch(getAllBusRoutes({ limit: 100 }));
    dispatch(getAllTransportFeeStructures({ limit: 100 }));
  }, [dispatch, user?.school_id]);

  // ── Re-fetch fees when year changes ──────────────────────────────────────
  useEffect(() => {
    if (!user?.school_id) return;
    dispatch(getAllTransportFeeStructures({
      academicYear: selectedYearGlobal,
      limit: 100,
    }));
  }, [selectedYearGlobal, dispatch, user?.school_id]);

  // ── Fee notifications → toasts ────────────────────────────────────────────
  useEffect(() => {
    if (!feeNotif) return;
    if (feeNotif.type === "success") toast.success(feeNotif.message);
    else                              toast.error(feeNotif.message);
    dispatch(clearFeeNotif());
  }, [feeNotif, dispatch]);

  // ── Bus route notifications → toasts ─────────────────────────────────────
  useEffect(() => {
    if (!busRouteNotif) return;
    if (busRouteNotif.type === "success") toast.success(busRouteNotif.message);
    else                                   toast.error(busRouteNotif.message);
    dispatch(clearRouteNotif());
  }, [busRouteNotif, dispatch]);

  // ── Build per-route rows ──────────────────────────────────────────────────
  const routeRows = useMemo(() => {
    return routes.map((route) => {
      const routeFees = feeStructures.filter((f) => {
        const feeRouteId =
          typeof f.route_id === "object" ? f.route_id?._id : f.route_id;
        return feeRouteId === route._id;
      });

      const yearFees   = routeFees.filter((f) => f.academicYear === selectedYearGlobal);
      const activeFees = yearFees.filter((f) => f.status === "active");
      const feeStatus  = deriveFeeStatus(route, yearFees); // pass full route
      const frequency  = activeFees[0]?.frequency ?? "—";
      const lastUpdated = route.updatedAt ?? route.createdAt;

      return {
        _id:             route._id,
        routeName:       route.routeName,
        startPoint:      route.startPoint,
        endPoint:        route.endPoint,
        routeStatus:     route.status, // "active" | "archived" — raw backend value
        academicYear:    selectedYearGlobal,
        totalStops:      route.stops?.length ?? 0,
        configuredStops: activeFees.length,
        frequency,
        status:          feeStatus,
        lastUpdated,
        _route:          route,
      };
    });
  }, [routes, feeStructures, selectedYearGlobal]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalRoutes:              routes.length,
    configuredFeeStructures:  routeRows.filter((r) => r.status === "Configured").length,
    pendingFeeConfigurations: routeRows.filter((r) => r.status === "Pending").length,
    activeFeeRecords:         feeStructures.filter((f) => f.status === "active").length,
  }), [routes, routeRows, feeStructures]);

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const q = overviewSearch.toLowerCase();
    return routeRows
      .filter((r) => {
        const matchSearch =
          !q ||
          r.routeName?.toLowerCase().includes(q) ||
          r.startPoint?.toLowerCase().includes(q) ||
          r.endPoint?.toLowerCase().includes(q) ||
          r.academicYear?.toLowerCase().includes(q);
        const matchYear   = overviewYearFilter   === "All Years"   || r.academicYear === overviewYearFilter;
        const matchStatus = overviewStatusFilter === "All Status"  || r.status === overviewStatusFilter;
        return matchSearch && matchYear && matchStatus;
      })
      .sort((a, b) => {
        if (overviewSortBy === "Route Name")
          return a.routeName?.localeCompare(b.routeName);
        return new Date(b.lastUpdated) - new Date(a.lastUpdated);
      });
  }, [routeRows, overviewSearch, overviewYearFilter, overviewStatusFilter, overviewSortBy]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredRows.length / ITEMS_PER_PAGE) || 1;
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRows.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRows, currentPage]);

  const startRange = filteredRows.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRange   = Math.min(currentPage * ITEMS_PER_PAGE, filteredRows.length);

  // ── Legend counts ─────────────────────────────────────────────────────────
  const legendCounts = useMemo(() => ({
    Configured: routeRows.filter((r) => r.status === "Configured").length,
    Partial:    routeRows.filter((r) => r.status === "Partial").length,
    Pending:    routeRows.filter((r) => r.status === "Pending").length,
    Archived:   routeRows.filter((r) => r.status === "Archived").length,
  }), [routeRows]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setOverviewSearch("");
    setOverviewYearFilter("All Years");
    setOverviewStatusFilter("All Status");
    setOverviewSortBy("Last Updated");
    setCurrentPage(1);
  }, []);

  const handleSearchChange = (val) => { setOverviewSearch(val);       setCurrentPage(1); };
  const handleYearChange   = (val) => { setOverviewYearFilter(val);   setCurrentPage(1); };
  const handleStatusChange = (val) => { setOverviewStatusFilter(val); setCurrentPage(1); };

  const handleArchive = useCallback((routeId) => {
    dispatch(archiveBusRoute(routeId));
    setOpenMenuId(null);
  }, [dispatch]);

  const handleActivate = useCallback((routeId) => {
    dispatch(activateBusRoute(routeId));
    setOpenMenuId(null);
  }, [dispatch]);

  // ---------------------------------------------------------------------------
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-slate-800 gap-5 pb-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Transport Fees</h1>
          <p className="text-sm text-slate-400 font-semibold mt-1">
            Manage and monitor stop-wise transport fee structures for all bus routes.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <select
              value={selectedYearGlobal}
              onChange={(e) => setSelectedYearGlobal(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold text-[13px] rounded-xl outline-none cursor-pointer hover:bg-slate-50 transition-all appearance-none"
            >
              {ACADEMIC_YEARS.map((y) => (
                <option key={y} value={y}>Academic Year: {y}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          <button
            onClick={() => onConfigureRoute?.(null)}
            className="flex items-center gap-2 bg-[#0061FF] hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/10 cursor-pointer transition-all"
          >
            <LayoutGrid className="w-4 h-4" />
            Configure Fees
          </button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        {[
          { label: "Total Routes",               value: stats.totalRoutes,               sub: "All routes in system",       icon: Bus,           bg: "bg-blue-50/80 border-blue-100/30",       text: "text-blue-600"    },
          { label: "Configured Fee Structures",  value: stats.configuredFeeStructures,   sub: "Routes with complete setup", icon: IconMoneyBag,  bg: "bg-emerald-50/80 border-emerald-100/30", text: "text-emerald-600" },
          { label: "Pending Fee Configurations", value: stats.pendingFeeConfigurations,  sub: "Routes missing fee setup",   icon: AlertTriangle, bg: "bg-orange-50/80 border-orange-100/30",  text: "text-amber-600"   },
          { label: "Active Fee Records",         value: stats.activeFeeRecords,          sub: "Total active fee rows",      icon: IconFileText,  bg: "bg-purple-50/80 border-purple-100/30",  text: "text-purple-600"  },
        ].map(({ label, value, sub, icon: Icon, bg, text }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-5 hover:shadow-lg hover:shadow-slate-100/30 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl ${bg} border flex items-center justify-center ${text} shrink-0 group-hover:scale-105 transition-all duration-300`}>
              <Icon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[12.5px] font-bold text-slate-800 leading-none block">{label}</span>
              <span className="text-[26px] font-black text-slate-900 mt-1.5 block leading-none">
                {isLoading ? <span className="text-slate-300 animate-pulse">—</span> : value}
              </span>
              <span className="text-[10.5px] font-semibold text-slate-400 mt-1.5 block leading-none">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap shrink-0">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by route name, stop, or academic year..."
            value={overviewSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
          />
        </div>

        <div className="relative">
          <select
            value={overviewYearFilter}
            onChange={(e) => handleYearChange(e.target.value)}
            className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 focus:border-blue-400 outline-none cursor-pointer transition-all appearance-none"
          >
            <option value="All Years">All Years</option>
            {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={overviewStatusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 focus:border-blue-400 outline-none cursor-pointer transition-all appearance-none"
          >
            <option value="All Status">All Status</option>
            <option value="Configured">Configured</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
            <option value="Archived">Archived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={overviewSortBy}
            onChange={(e) => setOverviewSortBy(e.target.value)}
            className="pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-700 focus:border-blue-400 outline-none cursor-pointer transition-all appearance-none"
          >
            <option>Last Updated</option>
            <option>Route Name</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-[13px] font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Reset
        </button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-0 relative">

        {isLoading && (
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center rounded-2xl">
            <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}

        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10.5px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                {["Route Name", "Academic Year", "Total Stops", "Configured Stops", "Fee Frequency", "Fee Status", "Last Updated", "Actions"].map((h, i) => (
                  <th key={h} className={`sticky top-0 z-10 bg-slate-50/95 py-3 px-5 font-bold whitespace-nowrap ${
                    i === 2 || i === 3 || i === 5 ? "text-center" : i === 7 ? "text-right" : "text-left"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length > 0 ? paginated.map((r) => {
                const safePct = r.totalStops > 0
                  ? Math.min(100, Math.round((r.configuredStops / r.totalStops) * 100))
                  : 0;

                const pctColor =
                  safePct === 100 ? "text-emerald-600 font-bold" :
                  safePct > 0     ? "text-amber-500 font-bold"   :
                                    "text-red-500 font-bold";

                const isArchived = r.routeStatus === "archived";

                return (
                  <tr
                    key={r._id}
                    className={`hover:bg-slate-50/50 transition-colors ${isArchived ? "opacity-60" : ""}`}
                  >
                    {/* Route Name */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isArchived
                            ? "bg-slate-100 border border-slate-200 text-slate-400"
                            : "bg-blue-50 border border-blue-100 text-[#0061FF]"
                        }`}>
                          <Bus className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-[13.5px] font-bold text-slate-800 leading-tight flex items-center gap-2">
                            {r.routeName}
                            {isArchived && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-md border border-slate-200">
                                Archived
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 tracking-wide mt-0.5 uppercase">
                            {r.startPoint} → {r.endPoint}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Academic Year */}
                    <td className="py-3.5 px-5">
                      <span className="text-[13px] font-semibold text-slate-600">{r.academicYear}</span>
                    </td>

                    {/* Total Stops */}
                    <td className="py-3.5 px-5 text-center">
                      <span className="text-[13px] font-bold text-slate-800 bg-slate-50 px-2.5 py-1 rounded-lg">
                        {r.totalStops}
                      </span>
                    </td>

                    {/* Configured Stops */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`text-[13px] ${pctColor}`}>
                        {r.configuredStops} / {r.totalStops} ({safePct}%)
                      </span>
                    </td>

                    {/* Fee Frequency */}
                    <td className="py-3.5 px-5">
                      <span className="text-[13px] font-semibold text-slate-700 capitalize">{r.frequency}</span>
                    </td>

                    {/* Fee Status Badge */}
                    <td className="py-3.5 px-5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide ${
                        statusBadgeClass[r.status] ?? "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-5">
                      <span className="text-[12px] font-medium text-slate-500">{formatDate(r.lastUpdated)}</span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => onConfigureRoute?.(r._route)}
                          className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 text-slate-400 hover:text-[#0061FF] transition-all cursor-pointer"
                          title="View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onConfigureRoute?.(r._route)}
                          className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-blue-50 border border-blue-200 text-[#0061FF] hover:text-blue-700 text-[11.5px] font-bold rounded-lg cursor-pointer transition-all shadow-sm"
                        >
                          <Plus className="w-3 h-3 stroke-3" />
                          Configure Fees
                        </button>

                        {/* 3-dot dropdown */}
                        <div className="relative" data-menu>
                          <button
                            onClick={() => setOpenMenuId(openMenuId === r._id ? null : r._id)}
                            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer hover:bg-slate-100 transition-all"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {openMenuId === r._id && (
                            <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/60 overflow-hidden">

                              {/* Archive / Activate toggle based on routeStatus */}
                              {isArchived ? (
                                <button
                                  onClick={() => handleActivate(r._id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Activate Route
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleArchive(r._id)}
                                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                    <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  Archive Route
                                </button>
                              )}

                              <div className="h-px bg-slate-100 mx-3" />

                              <button
                                onClick={() => { onConfigureRoute?.(r._route); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[12.5px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Configure Fees
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <div className="max-w-md mx-auto flex flex-col items-center">
                      <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                        <Search className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-800">No routes found</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Try broadening your search or filters.</p>
                      <button onClick={handleReset} className="mt-4 px-4 py-2 text-xs font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer">
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Footer ── */}
        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between shrink-0 bg-slate-50/30">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-[12px] font-semibold text-slate-400">
              Showing <span className="text-slate-700 font-extrabold">{startRange}</span>–<span className="text-slate-700 font-extrabold">{endRange}</span> of <span className="text-slate-700 font-extrabold">{filteredRows.length}</span> routes
            </span>
            {[
              { label: "Configured", color: "bg-emerald-500" },
              { label: "Partial",    color: "bg-amber-400"   },
              { label: "Pending",    color: "bg-red-400"     },
              { label: "Archived",   color: "bg-slate-400"   },
            ].map(({ label, color }) => (
              <span key={label} className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label} ({legendCounts[label]})
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 select-none">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className={`h-7 w-7 rounded-md border flex items-center justify-center text-xs font-bold transition-all ${
                currentPage === 1
                  ? "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-7 w-7 rounded-md font-bold text-xs flex items-center justify-center cursor-pointer transition-all ${
                    currentPage === page
                      ? "bg-[#0061FF] text-white shadow-sm"
                      : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`h-7 w-7 rounded-md border flex items-center justify-center text-xs font-bold transition-all ${
                currentPage === totalPages
                  ? "border-slate-100 text-slate-300 bg-slate-50 cursor-not-allowed"
                  : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}