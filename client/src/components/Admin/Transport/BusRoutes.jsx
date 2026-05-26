import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {MapPin, Bus, Plus, Map, Eye, Pencil,MoreVertical, Archive, Search,ChevronLeft, ChevronRight,} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import ViewRouteModal from "./Bus Routes/ViewRouteModal";
import EditModal from "./Bus Routes/EditModal";
import SearchFilterBar from "./Bus Routes/SearchFilterBar";
import CreateRoute from "./Bus Routes/CreateRoute";

import {
  getAllBusRoutes,
  updateBusRoute,
  activateBusRoute,
  archiveBusRoute,
  clearNotification,
  selectAllBusRoutes,
  selectBusRouteNotif,
  selectBusRouteLoading,
} from "../../../redux/slice/busRouteSlice";


const statusColors = {
  active:   "bg-emerald-50 text-emerald-600 border-emerald-100",
  inactive: "bg-amber-50 text-amber-600 border border-amber-200/60",
  archived: "bg-slate-100 text-slate-500 border-slate-200",
};

const statusLabel = {
  active:   "Active",
  inactive: "Inactive",
  archived: "Archived",
};

const statCardColors = {
  blue:    { bg: "bg-blue-50/70",    border: "border-blue-100/30",    text: "text-blue-600" },
  emerald: { bg: "bg-emerald-50/70", border: "border-emerald-100/30", text: "text-emerald-600" },
  purple:  { bg: "bg-purple-50/70",  border: "border-purple-100/30",  text: "text-purple-600" },
  amber:   { bg: "bg-amber-50/70",   border: "border-amber-100/30",   text: "text-amber-600" },
};

const ITEMS_PER_PAGE = 6;



export default function BusRoutes() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.getme?.user);

  const routes      = useSelector(selectAllBusRoutes);
  const notification = useSelector(selectBusRouteNotif);
  const isFetching   = useSelector(selectBusRouteLoading("getAllBusRoutes"));
  const isArchiving  = useSelector(selectBusRouteLoading("archiveBusRoute"));
  const isActivating = useSelector(selectBusRouteLoading("activateBusRoute"));
  const isUpdating   = useSelector(selectBusRouteLoading("updateBusRoute"));

  // ── Local UI state ────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery]     = useState("");
  const [statusFilter, setStatusFilter]   = useState("All");
  const [sortBy, setSortBy]               = useState("Newest");
  const [currentPage, setCurrentPage]     = useState(1);
  const [activeActionMenuId, setActiveActionMenuId] = useState(null);
  const [viewRoute, setViewRoute]         = useState(null);
  const [editingRoute, setEditingRoute]   = useState(null);
  const [isCreating, setIsCreating]       = useState(false);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.school_id) {
      dispatch(getAllBusRoutes());
    }
  }, [dispatch, user?.school_id]);

  // ── Sync Redux notifications → sonner toasts ──────────────────────────────
  useEffect(() => {
    if (!notification) return;
    if (notification.type === "success") toast.success(notification.message);
    else                                  toast.error(notification.message);
    dispatch(clearNotification());
  }, [notification, dispatch]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    totalRoutes:   routes.length,
    activeRoutes:  routes.filter(r => r.status === "active").length,
    totalStops:    routes.reduce((s, r) => s + (r.stops?.length ?? 0), 0),
    assignedBuses: routes.reduce((s, r) => s + (r.buses?.length ?? 0), 0),
  }), [routes]);

  // ── Filter + Sort ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return routes
      .filter(r => {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          r.routeName?.toLowerCase().includes(q) ||
          r.startPoint?.toLowerCase().includes(q) ||
          r.endPoint?.toLowerCase().includes(q);
        const matchesStatus =
          statusFilter === "All" ||
          r.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "Newest")          return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "Oldest")          return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === "Stops (High)")    return (b.stops?.length ?? 0) - (a.stops?.length ?? 0);
        if (sortBy === "Distance (High)") return (b.distanceKm ?? 0) - (a.distanceKm ?? 0);
        if (sortBy === "Name A-Z")        return a.routeName?.localeCompare(b.routeName);
        return 0;
      });
  }, [routes, searchQuery, statusFilter, sortBy]);

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endRange   = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSearchChange = (val) => { setSearchQuery(val); setCurrentPage(1); };
  const handleStatusChange = (val) => { setStatusFilter(val); setCurrentPage(1); };
  const handleResetFilters = () => {
    setStatusFilter("All"); setSortBy("Newest");
    setSearchQuery(""); setCurrentPage(1);
  };

  // Edit — calls PATCH /update/:routeId
  const handleEditRoute = useCallback(async (e) => {
    e.preventDefault();
    if (!editingRoute.routeName || !editingRoute.startPoint || !editingRoute.endPoint || !editingRoute.distanceKm) {
      toast.error("Please fill in all required fields.");
      return;
    }
    const result = await dispatch(updateBusRoute({
      routeId:    editingRoute._id,
      routeName:  editingRoute.routeName,
      startPoint: editingRoute.startPoint,
      endPoint:   editingRoute.endPoint,
      distanceKm: editingRoute.distanceKm,
      stops:      editingRoute.stops,
      buses:      editingRoute.buses,
      status:     editingRoute.status,
    }));
    if (updateBusRoute.fulfilled.match(result)) setEditingRoute(null);
  }, [dispatch, editingRoute]);

  // Archive — calls PATCH /:routeId/archive
  const handleArchiveRoute = useCallback(async (routeId) => {
    await dispatch(archiveBusRoute(routeId));
    setActiveActionMenuId(null);
  }, [dispatch]);

  // Activate — calls PATCH /:routeId/activate
  const handleActivateRoute = useCallback(async (routeId) => {
    await dispatch(activateBusRoute(routeId));
    setActiveActionMenuId(null);
  }, [dispatch]);

  // CreateRoute's onSave — after success the slice already added it to the list
  const handleRouteCreated = useCallback(() => {
    setIsCreating(false);
  }, []);

  // ── Create view ───────────────────────────────────────────────────────────
  if (isCreating) {
    return (
      <CreateRoute
        onCancel={() => setIsCreating(false)}
        onSave={handleRouteCreated}
      />
    );
  }

  // ── Missing School Fallback ───────────────────────────────────────────────
  if (!user?.school_id) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white border border-slate-200 rounded-2xl shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Map className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">No School Associated</h2>
        <p className="text-slate-500 mt-2 max-w-md">
          You cannot manage bus routes because your account is not linked to any school. Please contact your system administrator.
        </p>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-0 bg-transparent text-slate-800">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Bus Routes</h1>
          <p className="text-sm text-slate-450 font-semibold mt-1">
            Create and manage school transport routes with stops, buses, and route details.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreating(true)}
          className="flex items-center justify-center gap-2 bg-[#0061FF] hover:bg-blue-700 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-3" />
          Create Route
        </motion.button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 shrink-0">
        {[
          { label: "Total Routes",   value: stats.totalRoutes,   sub: "All routes in system", icon: Map,    color: "blue"    },
          { label: "Active Routes",  value: stats.activeRoutes,  sub: "Currently active",     icon: Bus,    color: "emerald" },
          { label: "Total Stops",    value: stats.totalStops,    sub: "Across all routes",    icon: MapPin, color: "purple"  },
          { label: "Assigned Buses", value: stats.assignedBuses, sub: "Across all routes",    icon: Bus,    color: "amber"   },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg hover:shadow-slate-100/50 transition-all group relative overflow-hidden">
            <div className={`w-12 h-12 rounded-2xl ${statCardColors[color]?.bg} border ${statCardColors[color]?.border} flex items-center justify-center ${statCardColors[color]?.text} shrink-0 group-hover:scale-110 transition-all duration-300`}>
              <Icon className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">{label}</span>
              <span className="text-3xl font-black text-slate-900 leading-none mt-1 block">
                {isFetching ? <span className="text-slate-300 animate-pulse">—</span> : value}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-1 block">{sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search / Filter Bar ── */}
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={handleSearchChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusChange}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onResetFilters={handleResetFilters}
      />

      {/* ── Table ── */}
      <div className="flex-1 bg-white border border-indigo-200 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-0 relative">

        {/* Full-table loading overlay */}
        {isFetching && (
          <div className="absolute inset-0 z-30 bg-white/70 flex items-center justify-center rounded-2xl">
            <svg className="w-8 h-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        )}

        <div className="flex-1 overflow-auto min-h-0">
          <table className="table-fixed text-left border-collapse min-w-[1050px]">
            <thead>
              <tr className="border-b border-slate-100 uppercase tracking-wider select-none text-[11px] font-bold text-slate-450 bg-slate-50/50">
                {["Route Name","Start Point","End Point","Stops","Distance (Km)","Buses","Status","Actions"].map((h, i) => (
                  <th key={h} className={`sticky top-0 z-10 bg-slate-50/95 backdrop-blur-xs py-4 px-5 font-bold whitespace-nowrap shadow-xs ${
                    i === 3 || i === 4 || i === 6 ? "text-center" : i === 7 ? "text-right" : "text-left"
                  } ${i === 0 ? "w-[24%]" : i === 1 || i === 2 ? "w-[15%]" : i === 3 ? "w-[7%]" : i === 4 ? "w-[10%]" : i === 5 ? "w-[11%]" : i === 6 ? "w-[10%]" : "w-[8%]"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {paginated.length > 0 ? paginated.map((route) => {
                const stopCount = route.stops?.length ?? 0;
                const status    = route.status ?? "inactive";

                return (
                  <tr key={route._id} className="hover:bg-slate-50/40 transition-colors group/row">

                    {/* Route Name */}
                    <td className="py-4 px-5 whitespace-nowrap overflow-hidden text-ellipsis">
                      <div className="flex flex-col">
                        <button onClick={() => setViewRoute(route)} className="text-[13.5px] font-extrabold text-blue-600 hover:text-blue-800 transition-colors text-left hover:underline select-none">
                          {route.routeName}
                        </button>
                        <span className="text-[10.5px] font-bold text-slate-400 mt-0.5 tracking-wide">
                          {route.startPoint} → {route.endPoint}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5"><span className="text-sm font-semibold text-slate-700">{route.startPoint}</span></td>
                    <td className="py-4 px-5"><span className="text-sm font-semibold text-slate-700">{route.endPoint}</span></td>

                    <td className="py-4 px-5 text-center">
                      <span className="text-sm font-bold text-slate-800 bg-slate-100/60 px-2 py-1 rounded-lg">{stopCount}</span>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className="text-sm font-bold text-slate-755">{route.distanceKm ?? "—"} km</span>
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                        {route.buses?.length > 0
                          ? route.buses.map((b, idx) => (
                              <span key={idx} className="bg-blue-50 text-blue-600 border border-blue-100/30 px-2 py-0.5 rounded text-[11px] font-bold font-mono">
                                #{b?.busNo} · {b?.plateNumber}
                              </span>
                            ))
                          : <span className="text-slate-400 text-xs font-semibold italic">Unassigned</span>
                        }
                      </div>
                    </td>

                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border ${statusColors[status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                        {statusLabel[status] ?? status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right relative">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewRoute(route)} className="p-2 rounded-lg bg-slate-50/60 hover:bg-blue-50 border border-slate-100/80 hover:border-blue-200 text-slate-400 hover:text-blue-600 transition-all cursor-pointer" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setEditingRoute(route)} className="p-2 rounded-lg bg-slate-50/60 hover:bg-indigo-50 border border-slate-100/80 hover:border-indigo-200 text-slate-400 hover:text-indigo-600 transition-all cursor-pointer" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setActiveActionMenuId(activeActionMenuId === route._id ? null : route._id)}
                            className="p-2 rounded-lg bg-slate-50/60 hover:bg-slate-100 border border-slate-100/80 hover:border-slate-300 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          <AnimatePresence>
                            {activeActionMenuId === route._id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenuId(null)} />
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.12 }}
                                  className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-150 rounded-xl shadow-xl z-20 overflow-hidden py-1"
                                >
                                  {/* Activate — only when archived or inactive */}
                                  {status !== "active" && (
                                    <button
                                      onClick={() => handleActivateRoute(route._id)}
                                      disabled={isActivating}
                                      className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <Bus className="w-3.5 h-3.5 text-emerald-400" />
                                      {isActivating ? "Activating…" : "Activate Route"}
                                    </button>
                                  )}

                                  {/* Archive — only when active */}
                                  {status === "active" && (
                                    <button
                                      onClick={() => handleArchiveRoute(route._id)}
                                      disabled={isArchiving}
                                      className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                      <Archive className="w-3.5 h-3.5 text-slate-400" />
                                      {isArchiving ? "Archiving…" : "Archive Route"}
                                    </button>
                                  )}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
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
                      <h3 className="text-base font-extrabold text-slate-850">No bus routes found</h3>
                      <p className="text-xs text-slate-400 font-semibold mt-1">Try broadening your search keywords.</p>
                      <button onClick={handleResetFilters} className="mt-4 px-4 py-2 text-xs font-extrabold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer">
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className="py-4 px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 select-none shrink-0 bg-white">
          <span className="text-[13px] font-bold text-slate-400">
            Showing <span className="text-slate-700 font-extrabold">{startRange}</span> to{" "}
            <span className="text-slate-700 font-extrabold">{endRange}</span> of{" "}
            <span className="text-slate-700 font-extrabold">{totalItems}</span> routes
          </span>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all ${currentPage === 1 ? "border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"}`}>
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className={`h-9 w-9 rounded-lg font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${currentPage === page ? "bg-[#0061FF] text-white shadow-xs" : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"}`}>
                  {page}
                </button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-all ${currentPage === totalPages ? "border-slate-100 text-slate-300 bg-slate-50/50 cursor-not-allowed" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600 cursor-pointer"}`}>
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* ── View Modal ── */}
      <ViewRouteModal viewRoute={viewRoute} onClose={() => setViewRoute(null)} />

      {/* ── Edit Modal ── */}
      <EditModal
        editingRoute={editingRoute}
        setEditingRoute={setEditingRoute}
        onSubmit={handleEditRoute}
        isLoading={isUpdating}
      />
    </div>
  );
}