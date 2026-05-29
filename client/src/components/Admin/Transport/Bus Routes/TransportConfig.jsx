import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, Save, Check, ChevronDown } from "lucide-react";
import { toast } from "sonner";

import TransportFeeMain from "../TransportFeeMain";
import TransportFeeSidebar from "../TransportFeeSidebar";

import {
    getAllTransportFeeStructures,
    bulkUpdateTransportFeeStructures,
    selectAllFeeStructures,
    selectFeeStructureLoading,
    selectFeeStructureNotif,
    clearNotification as clearFeeNotif,
} from "../../../../redux/slice/transportFeeStructureSlice";

import {
    getAllBusRoutes,
    removeStopFromRoute,
    selectAllBusRoutes,
    selectBusRouteLoading,
} from "../../../../redux/slice/busRouteSlice";

// ---------------------------------------------------------------------------
const ACADEMIC_YEARS = ["2024 - 2025", "2025 - 2026", "2026 - 2027"];

const FREQ_MAP = {
    Monthly: "monthly",
    Quarterly: "quarterly",
    Yearly: "yearly",
};

const FREQ_DISPLAY = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
};

// ---------------------------------------------------------------------------
const buildStopRows = (route, feeStructures, academicYear) => {
    if (!route) return [];

    const feeMap = new Map();
    feeStructures
        .filter((f) => {
            const fRouteId = typeof f.route_id === "object" ? f.route_id?._id : f.route_id;
            return fRouteId === route._id && f.academicYear === academicYear;
        })
        .forEach((f) => feeMap.set(f.dropPoint.toLowerCase(), f));

    const rows = [];
    let idx = 0;

    rows.push({
        id: "row-start",
        name: route.startPoint,
        isEndpoint: "start",
        amount: "",
        frequency: "Monthly",
        status: "Active",
        _feeId: null,
    });

    (route.stops ?? []).forEach((stopName) => {
        idx++;
        const fee = feeMap.get(stopName.toLowerCase());
        rows.push({
            id: `row-${idx}`,
            name: stopName,
            isEndpoint: false,
            amount: fee ? String(fee.amount) : "",
            frequency: fee ? (FREQ_DISPLAY[fee.frequency] ?? "Monthly") : "Monthly",
            status: fee
                ? fee.status === "active"
                    ? "Active"
                    : fee.status === "inactive"
                        ? "Inactive"
                        : "Archived"
                : "Active",
            _feeId: fee?._id ?? null,
        });
    });

    rows.push({
        id: "row-end",
        name: route.endPoint,
        isEndpoint: "end",
        amount: "",
        frequency: "Monthly",
        status: "Active",
        _feeId: null,
    });

    return rows;
};

// ---------------------------------------------------------------------------
export default function TransportFeeConfig({ initialRoute = null, onBack }) {
    const dispatch = useDispatch();
    const user = useSelector((s) => s.getme?.user);

    const routes = useSelector(selectAllBusRoutes);
    const feeStructures = useSelector(selectAllFeeStructures);
    const isFetchingRoutes = useSelector(selectBusRouteLoading("getAllBusRoutes"));
    const isSaving = useSelector(selectFeeStructureLoading("bulkUpdate"));
    const isRemovingStop = useSelector(selectBusRouteLoading("removeStopFromRoute"));
    const feeNotif = useSelector(selectFeeStructureNotif);

    const [selectedRouteId, setSelectedRouteId] = useState(initialRoute?._id ?? "");
    const [selectedYear, setSelectedYear] = useState(ACADEMIC_YEARS[1]);
    const [stopRows, setStopRows] = useState([]);
    const [saved, setSaved] = useState(true);
    const [configSearch, setConfigSearch] = useState("");
    const [configStatusFilter, setConfigStatusFilter] = useState("All Status");
    const [showFill, setShowFill] = useState(false);
    const [fillAmt, setFillAmt] = useState("");
    const [configSelected, setConfigSelected] = useState([]);
    const [deletingStopId, setDeletingStopId] = useState(null);

    // Prevents row rebuild on unrelated Redux fee updates
    const [lastBuiltKey, setLastBuiltKey] = useState("");

    // ── Active route ──────────────────────────────────────────────────────────
    const activeRoute = useMemo(() => {
        if (selectedRouteId) return routes.find((r) => r._id === selectedRouteId) ?? null;
        return initialRoute ?? routes[0] ?? null;
    }, [routes, selectedRouteId, initialRoute]);

    // ── Fetch routes on mount ─────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.school_id) return;
        if (routes.length === 0) dispatch(getAllBusRoutes({ limit: 100 }));
    }, [dispatch, user?.school_id, routes.length]);

    // ── Sync selectedRouteId once routes load ─────────────────────────────────
    useEffect(() => {
        if (!selectedRouteId && routes.length > 0) {
            const fallback = initialRoute?._id ?? routes[0]?._id ?? "";
            setSelectedRouteId(fallback);
        }
    }, [routes, selectedRouteId, initialRoute]);

    // ── Fetch fees when route / year changes ──────────────────────────────────
    useEffect(() => {
        if (!user?.school_id || !activeRoute?._id) return;
        dispatch(getAllTransportFeeStructures({
            route_id: activeRoute._id,
            academicYear: selectedYear,
            limit: 100,
        }));
    }, [dispatch, user?.school_id, activeRoute?._id, selectedYear]);

    // ── Rebuild rows ONLY when route or year actually changes ─────────────────
    useEffect(() => {
        if (!activeRoute) return;
        const key = `${activeRoute._id}-${selectedYear}`;
        if (key === lastBuiltKey) return; // guard: skip if same route+year
        const rows = buildStopRows(activeRoute, feeStructures, selectedYear);
        setStopRows(rows);
        setConfigSelected([]);
        setSaved(true);
        setLastBuiltKey(key);
    }, [activeRoute, feeStructures, selectedYear, lastBuiltKey]);

    // ── Notifications → toasts ────────────────────────────────────────────────
    useEffect(() => {
        if (!feeNotif) return;
        if (feeNotif.type === "success") {
            toast.success(feeNotif.message);
            setSaved(true);
        } else {
            toast.error(feeNotif.message);
        }
        dispatch(clearFeeNotif());
    }, [feeNotif, dispatch]);

    // ── Derived stats ─────────────────────────────────────────────────────────
    const midStops = useMemo(
        () => stopRows.filter((s) => !s.isEndpoint),
        [stopRows]
    );

    const feesConfigured = useMemo(
        () => midStops.filter((s) => s.amount !== "" && s.status === "Active").length,
        [midStops]
    );

    const remainingCount = useMemo(
        () => midStops.filter((s) => s.amount === "" && s.status === "Active").length,
        [midStops]
    );

    const inactiveCount = useMemo(
        () => midStops.filter((s) => s.status === "Inactive").length,
        [midStops]
    );

    const estimatedTotal = useMemo(
        () => midStops.reduce((sum, s) => {
            if (s.status !== "Active" || s.amount === "") return sum;
            return sum + (parseFloat(s.amount) || 0);
        }, 0),
        [midStops]
    );

    // ── Filtered rows — endpoints always pass through ─────────────────────────
    const filteredStops = useMemo(() => {
        const q = configSearch.toLowerCase();
        return stopRows.filter((s) => {
            if (s.isEndpoint) return true; // always keep, hidden in table
            const matchSearch = !q || s.name.toLowerCase().includes(q);
            const matchStatus =
                configStatusFilter === "All Status" || s.status === configStatusFilter;
            return matchSearch && matchStatus;
        });
    }, [stopRows, configSearch, configStatusFilter]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const updateStop = useCallback((id, field, value) => {
        setStopRows((prev) =>
            prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
        );
        setSaved(false);
    }, []);

    // Delete stop — calls backend via removeStopFromRoute, then removes locally
    const deleteStop = useCallback(async (id) => {
        if (!activeRoute) return;

        const stop = stopRows.find((s) => s.id === id);
        if (!stop) return;

        const confirmDelete = window.confirm(
            `Remove stop "${stop.name}" from this route? This cannot be undone.`
        );
        if (!confirmDelete) return;

        setDeletingStopId(id);
        try {
            const result = await dispatch(
                removeStopFromRoute({
                    routeId: activeRoute._id,
                    stopName: stop.name,
                })
            ).unwrap();

            // On success — remove locally and clear from selection
            setStopRows((prev) => prev.filter((s) => s.id !== id));
            setConfigSelected((prev) => prev.filter((x) => x !== id));

            // Update lastBuiltKey so the route rebuild doesn't wipe our state
            // The Redux route list is updated by the slice automatically
            toast.success(`Stop "${stop.name}" removed successfully.`);
        } catch (err) {
            toast.error(err ?? "Failed to remove stop.");
        } finally {
            setDeletingStopId(null);
        }
    }, [dispatch, activeRoute, stopRows]);

    const toggleSelect = useCallback((id) => {
        setConfigSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }, []);

    const toggleAll = useCallback(() => {
        const ids = filteredStops.filter((s) => !s.isEndpoint).map((s) => s.id);
        const allSelected = ids.length > 0 && ids.every((id) => configSelected.includes(id));
        setConfigSelected(allSelected ? [] : ids);
    }, [filteredStops, configSelected]);

    const handleFillSame = useCallback(() => {
        if (!fillAmt || isNaN(parseFloat(fillAmt))) {
            toast.error("Please enter a valid amount.");
            return;
        }
        const targetIds =
            configSelected.length > 0 ? configSelected : midStops.map((s) => s.id);
        setStopRows((prev) =>
            prev.map((s) =>
                !s.isEndpoint && targetIds.includes(s.id) ? { ...s, amount: fillAmt } : s
            )
        );
        setSaved(false);
        setShowFill(false);
        setFillAmt("");
        toast.success(`₹${fillAmt} applied to ${targetIds.length} stop(s).`);
    }, [fillAmt, configSelected, midStops]);

    const handleSave = useCallback(async () => {
        if (!activeRoute) return;
        const invalid = midStops.filter((s) => s.status === "Active" && s.amount === "");
        if (invalid.length > 0) {
            toast.error(`${invalid.length} stop(s) are missing an amount.`);
            return;
        }
        const stops = midStops.map((s) => ({
            dropPoint: s.name,
            amount: parseFloat(s.amount) || 0,
            frequency: FREQ_MAP[s.frequency] ?? "monthly",
            status:
                s.status === "Active"
                    ? "active"
                    : s.status === "Inactive"
                        ? "inactive"
                        : "archived",
        }));
        dispatch(
            bulkUpdateTransportFeeStructures({
                routeId: activeRoute._id,
                academicYear: selectedYear,
                frequency: FREQ_MAP[midStops[0]?.frequency ?? "Monthly"] ?? "monthly",
                stops,
            })
        );
    }, [dispatch, activeRoute, midStops, selectedYear]);

    const handleRouteChange = useCallback((routeId) => {
        if (!saved && !window.confirm("You have unsaved changes. Switch route anyway?")) return;
        setSelectedRouteId(routeId);
        setConfigSearch("");
        setConfigStatusFilter("All Status");
        setConfigSelected([]);
        setLastBuiltKey("");
    }, [saved]);

    // ── No routes yet 
    if (!activeRoute && !isFetchingRoutes) {
        return (
            <div className="flex items-center justify-center h-full text-slate-500 font-semibold">
                No routes found. Please create a bus route first.
            </div>
        );
    }

    const selectValue = activeRoute?._id ?? "";

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-slate-800">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-8 p-1">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-3xl font-bold text-slate-900 leading-tight">
                            Transport Fee Configuration
                        </span>

                        {/* Route Dropdown */}
                        <div className="relative p-2">
                            <select
                                value={selectValue}
                                onChange={(e) => handleRouteChange(e.target.value)}
                                disabled={isFetchingRoutes}
                                className="pl-3.5 pr-8 py-1 bg-black text-white font-medium text-[12px] rounded-xs outline-none cursor-pointer appearance-none disabled:opacity-50"
                            >
                                {routes.length === 0 && (
                                    <option value="">Loading routes…</option>
                                )}
                                {routes.map((r) => (
                                    <option key={r._id} value={r._id}>
                                        Route: {r.routeName}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                        </div>
                    </div>

                    <p className="text-[16px] text-slate-400">
                        Set stop-wise transport fees for the selected bus route.
                    </p>
                </div>

                {/* Save + Back */}
                <div className="flex items-center gap-3 shrink-0 mt-1">
                    <button
                        onClick={handleSave}
                        disabled={isSaving || saved}
                        className="flex items-center gap-1.5 bg-[#0061FF] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                    >
                        {isSaving ? (
                            <>
                                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                                Saving…
                            </>
                        ) : saved ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Save className="w-3.5 h-3.5" />
                                Save Changes
                            </>
                        )}
                    </button>

                    <button
                        onClick={onBack}
                        className="flex items-center gap-1.5 border border-blue-300/30 p-3 text-slate-600 hover:text-slate-900 text-[15px] font-medium shrink-0"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Route Details
                    </button>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="flex gap-4 flex-1 min-h-0 overflow-y-auto -mt-6">

                <div className="flex-1 min-w-0 overflow-y-auto">
                    {activeRoute ? (
                        <TransportFeeMain
                            activeRoute={{
                                routeName: activeRoute.routeName,
                                startPoint: activeRoute.startPoint,
                                endPoint: activeRoute.endPoint,
                                distance: activeRoute.distanceKm
                                    ? `${activeRoute.distanceKm} km`
                                    : "—",
                            }}
                            selectedYearGlobal={selectedYear}
                            stops={midStops}
                            filteredStops={filteredStops}
                            configSearch={configSearch}
                            setConfigSearch={setConfigSearch}
                            configStatusFilter={configStatusFilter}
                            setConfigStatusFilter={setConfigStatusFilter}
                            showFill={showFill}
                            setShowFill={setShowFill}
                            fillAmt={fillAmt}
                            setFillAmt={setFillAmt}
                            configSelected={configSelected}
                            toggleSelect={toggleSelect}
                            toggleAll={toggleAll}
                            handleFillSame={handleFillSame}
                            updateStop={updateStop}
                            deleteStop={deleteStop}
                            deletingStopId={deletingStopId}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-40 text-slate-400 font-semibold">
                            <svg className="w-6 h-6 animate-spin mr-2 text-blue-400" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Loading route data…
                        </div>
                    )}
                </div>

                <div className="w-80 shrink-0 overflow-y-auto">
                    {activeRoute && (
                        <TransportFeeSidebar
                            activeRoute={{
                                routeName: activeRoute.routeName,
                                startPoint: activeRoute.startPoint,
                                endPoint: activeRoute.endPoint,
                            }}
                            selectedYearGlobal={selectedYear}
                            midStops={midStops}
                            feesConfigured={feesConfigured}
                            remainingCount={remainingCount}
                            inactiveCount={inactiveCount}
                            estimatedTotal={estimatedTotal}
                            saved={saved}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}