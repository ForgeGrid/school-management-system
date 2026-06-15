import { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GraduationCap, Bus, Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  Percent,
  Receipt,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";

import {
  getAcademicFeeStructures,
  selectStructures,
  selectLoading as selectAcademicLoading,
  selectError as selectAcademicError,
} from "../../../redux/slice/academicFeeStructureSlice";

import {
  getAllBusRoutes,
  selectAllBusRoutes,
} from "../../../redux/slice/busRouteSlice";

import {
  getAllTransportFeeStructures,
  selectAllFeeStructures,
} from "../../../redux/slice/transportFeeStructureSlice";

const FREQ_DISPLAY = {
  monthly:    "Monthly",
  quarterly:  "Quarterly",
  yearly:     "Yearly",
  "term-wise":"Termly",
  "one-time": "One-time",
};

export function Step2AcademicFee({ form, onChange, goNext, goBack }) {
  const dispatch = useDispatch();

  const structures             = useSelector(selectStructures);
  const academicLoadingMap     = useSelector(selectAcademicLoading);
  const academicError          = useSelector(selectAcademicError);
  const allRoutes              = useSelector(selectAllBusRoutes)      || [];
  const allTransportStructures = useSelector(selectAllFeeStructures) || [];

  const activeRoutes = useMemo(() => allRoutes.filter((r) => r.status === "active"), [allRoutes]);

  const [academicYear, setAcademicYear] = useState(form.academicYear || "2025 - 2026");

 
  const grade = form.requestedGrade || form.grade || "";

  const [selectedStructureId, setSelectedStructureId] = useState(form.academicPlanId || null);

  // Transport local state
  const [selectedRouteId,    setSelectedRouteId]    = useState(form.transportRouteId || "");
  const [transportStop,      setTransportStop]      = useState(form.transportStop    || "");
  const [transportFee,       setTransportFee]       = useState(0);
  const [transportFrequency, setTransportFrequency] = useState("Monthly");
  const [transportStatus]                           = useState("Confirmed");

  // Adjustments
  const [discounts, setDiscounts] = useState(
    form.discounts?.length
      ? form.discounts
      : [
          { id: 1, type: "Scholarship",      amount: 2000 },
          { id: 2, type: "Sibling Discount", amount: 1000 },
        ]
  );
  const [charges, setCharges] = useState(
    form.additionalCharges?.length
      ? form.additionalCharges
      : [
          { id: 1, name: "Late Admission Fee", amount: 600 },
          { id: 2, name: "Activity Fee",       amount: 400 },
        ]
  );
  const [adjustmentsExpanded, setAdjustmentsExpanded] = useState(true);
  const [showFooter,          setShowFooter]           = useState(false);

  const scrollRef = useRef(null);

  // ── Fetch academic structures + bus routes once ──────────────────────────
  useEffect(() => {
    dispatch(getAcademicFeeStructures({ limit: 1000 }));
    dispatch(getAllBusRoutes({ limit: 100 }));
  }, [dispatch]);

  // ── Auto-select first active route when routes load ──────────────────────
  useEffect(() => {
    if (activeRoutes.length === 0) return;

    // If we already have a valid selectedRouteId, keep it
    if (selectedRouteId && activeRoutes.some((r) => r._id === selectedRouteId)) return;

    const matchedRoute =
      activeRoutes.find(
        (r) => r.routeName === form.transportRoute || r._id === form.transportRouteId
      ) || activeRoutes[0];

    setSelectedRouteId(matchedRoute._id);

    const stops = matchedRoute?.stops || [];
    const matchedStop =
      stops.find((s) => s === form.transportStop) || stops[0] || "";
    setTransportStop(matchedStop);
  }, [activeRoutes]); 

  // Fetch transport fee structures when route or year changes
  useEffect(() => {
    if (!form.transport_required || !academicYear || !selectedRouteId) return;
    dispatch(
      getAllTransportFeeStructures({
        academicYear,
        route_id: selectedRouteId,
        status:   "active",
        limit:    100,
      })
    );
  }, [dispatch, form.transport_required, academicYear, selectedRouteId]);

  //Derive active transport fee for the selected stop 
  const activeTransportFee = useMemo(() => {
    if (!transportStop || !selectedRouteId) return null;
    return (
      allTransportStructures.find(
        (s) =>
          (s.route_id?._id === selectedRouteId || s.route_id === selectedRouteId) &&
          s.dropPoint?.toLowerCase() === transportStop.toLowerCase() &&
          s.status === "active"
      ) || null
    );
  }, [allTransportStructures, selectedRouteId, transportStop]);

  //Sync transportFee & frequency from derived value 
  useEffect(() => {
    if (form.transport_required && activeTransportFee) {
      setTransportFee(activeTransportFee.amount || 0);
      setTransportFrequency(FREQ_DISPLAY[activeTransportFee.frequency] || "Monthly");
    } else if (form.transport_required) {
      setTransportFee(0);
      setTransportFrequency("Monthly");
    }
  }, [activeTransportFee, form.transport_required]);


  const filteredStructures = useMemo(
    () => structures.filter((s) => s.academicYear === academicYear && s.standard === grade),
    [structures, academicYear, grade]
  );

  // ── Auto-select active (or first) structure when filter changes ──────────
  useEffect(() => {
    if (filteredStructures.length === 0) {
      setSelectedStructureId(null);
      return;
    }
    const currentStillValid = filteredStructures.some((s) => s._id === selectedStructureId);
    if (currentStillValid) return;
    const active = filteredStructures.find((s) => s.status === "active");
    setSelectedStructureId(active?._id || filteredStructures[0]._id);
  }, [filteredStructures]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived objects ──────────────────────────────────────────────────────
  const selectedStructure =
    filteredStructures.find((s) => s._id === selectedStructureId) ||
    filteredStructures[0] ||
    null;

  const selectedRoute =
    activeRoutes.find((r) => r._id === selectedRouteId) ||
    activeRoutes[0] ||
    null;

  const heads = selectedStructure?.feeHeads || [];

  // ── Scroll / footer reveal ───────────────────────────────────────────────
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowFooter(scrollTop + clientHeight >= scrollHeight - 30);
  };

  useEffect(() => { checkScroll(); }, [selectedStructure, adjustmentsExpanded, discounts, charges]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const academicSubtotal       = heads.reduce((sum, h) => sum + (h.amount || 0), 0);
  const discountsTotal         = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const additionalChargesTotal = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const transportSubtotal      = form.transport_required ? transportFee : 0;
  const estimatedTotal         = academicSubtotal + transportSubtotal + additionalChargesTotal - discountsTotal;

  // ── Discount handlers ─────────────────────────────────────────────────────
  const handleDiscountChange = (index, field, value) => {
    setDiscounts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addDiscount    = () => setDiscounts((prev) => [...prev, { id: Date.now(), type: "Custom Discount", amount: 0 }]);
  const removeDiscount = (id) => setDiscounts((prev) => prev.filter((d) => d.id !== id));

  // ── Charge handlers ───────────────────────────────────────────────────────
  const handleChargeChange = (index, field, value) => {
    setCharges((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addCharge    = () => setCharges((prev) => [...prev, { id: Date.now(), name: "", amount: 0 }]);
  const removeCharge = (id) => setCharges((prev) => prev.filter((c) => c.id !== id));

  // ── Continue ──────────────────────────────────────────────────────────────
  const handleContinue = () => {
    onChange("academicPlanId")          ({ target: { value: selectedStructureId } });
    onChange("academicPlan")            ({ target: { value: selectedStructure ? `${selectedStructure.standard} - Academic Plan (${selectedStructure.academicYear})` : "" } });
    onChange("academicYear")            ({ target: { value: academicYear } });
    // ✅ FIX: always write grade back as form.requestedGrade so it stays in sync
    onChange("grade")                   ({ target: { value: grade } });
    onChange("transportRouteId")        ({ target: { value: selectedRouteId } });
    onChange("transportRoute")          ({ target: { value: selectedRoute?.routeName || "" } });
    onChange("transportStop")           ({ target: { value: transportStop } });
    onChange("transportFee")            ({ target: { value: transportFee } });
    onChange("transportFrequency")      ({ target: { value: transportFrequency } });
    onChange("transportFeeStructureId") ({ target: { value: activeTransportFee?._id || "" } });
    onChange("discounts")               ({ target: { value: discounts } });
    onChange("additionalCharges")       ({ target: { value: charges } });
    onChange("estimatedTotal")          ({ target: { value: estimatedTotal } });
    goNext();
  };

  const isLoadingStructures =
    academicLoadingMap?.getAll || academicLoadingMap?.getActive || false;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-blue-100/30 rounded-xl">
      {/* ── Scrollable main body ── */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex-1 overflow-y-auto px-6 py-6 hide-scrollbar"
      >
        {/* Page Header */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            Student Admission - Fee Plan Selection
          </h2>
          <p className="text-base text-slate-450 mt-1">
            Step 2 of 3 &bull; Confirm the academic and transport fee plan for this student
          </p>
        </div>

        {/* Callout Info Banner */}
        <div className="mb-6 bg-blue-100/55 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center justify-between text-base text-blue-700 shadow-2xs">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-550 shrink-0" />
            <span>
              Student: <strong className="font-semibold text-blue-900">{form.student_name || ""}</strong>
              <span className="mx-2 text-blue-300">|</span>
              Grade Requested: <strong className="font-semibold text-blue-900">{grade || "—"}</strong>
              <span className="mx-2 text-blue-300">|</span>
              Transport Required: <strong className="font-semibold text-blue-900">{form.transport_required ? "Yes" : "No"}</strong>
            </span>
          </div>
        </div>

        {/* API Error */}
        {academicError && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm text-rose-700 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {academicError}
          </div>
        )}

        {/* Upper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* ── Left: Academic Fee Plan ── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <GraduationCap className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Academic Fee Plan</h3>
                </div>
                <button type="button" className="text-slate-400 hover:text-slate-600 transition">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-5">
                Selected fee structure will be applied for the academic year.
              </p>

              {/* Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Academic Year</label>
                  <div className="relative">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
                    >
                      <option>2024 - 2025</option>
                      <option>2025 - 2026</option>
                      <option>2026 - 2027</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* ✅ FIX: Grade is READ-ONLY — locked to requestedGrade from Step 1.
                    The backend service enforces academicStructure.standard === requestedGrade,
                    so this field must never diverge. Show it as a disabled display field. */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">
                    Grade / Standard
                    <span className="ml-1.5 text-[10px] font-bold text-violet-500 bg-violet-50 border border-violet-100 px-1.5 py-0.5 rounded-full">
                      From Step 1
                    </span>
                  </label>
                  <div className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 flex items-center text-sm font-bold select-none">
                    {grade || <span className="text-slate-400 font-normal">Not set</span>}
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 font-medium">
                    Set in Step 1 · go back to change
                  </p>
                </div>

                {/* Fee Structure */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Fee Structure</label>
                  <div className="relative flex items-center">
                    {isLoadingStructures ? (
                      <div className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-sm text-slate-400 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </div>
                    ) : filteredStructures.length === 0 ? (
                      <div className="w-full h-11 px-3 rounded-lg border border-red-200 bg-red-50/40 flex items-center gap-2 text-sm text-red-500 font-semibold">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        No structure for {grade || "this grade"}
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedStructureId || ""}
                          onChange={(e) => setSelectedStructureId(e.target.value)}
                          className="w-full h-11 pl-3 pr-20 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-bold"
                        >
                          {filteredStructures.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.standard} - Academic Plan ({s.academicYear})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                        {selectedStructure?.status === "active" && (
                          <span className="absolute right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 pointer-events-none">
                            Active
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Heads Table */}
              {isLoadingStructures ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm font-semibold">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading fee heads...
                </div>
              ) : heads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5" />
                  {grade
                    ? `No fee structure found for ${grade} in ${academicYear}.`
                    : "No fee heads found for this structure."}
                  {grade && (
                    <button
                      type="button"
                      onClick={goBack}
                      className="mt-1 text-xs text-blue-600 underline underline-offset-2 hover:text-blue-800 transition"
                    >
                      Go back to Step 1 to change the grade
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="py-2.5 text-sm font-bold text-slate-400">Fee Head</th>
                        <th className="py-2.5 text-sm font-bold text-slate-400 text-right pr-6">Amount (₹)</th>
                        <th className="py-2.5 text-sm font-bold text-slate-400 text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {heads.map((head, i) => {
                        const isMandatory = head.mandatory !== false;
                        const freqLabel =
                          FREQ_DISPLAY[head.frequency] ||
                          (head.frequency
                            ? head.frequency.charAt(0).toUpperCase() + head.frequency.slice(1)
                            : "");
                        return (
                          <tr key={i} className="hover:bg-slate-50/45 transition-colors">
                            <td className="py-3">
                              <div className="font-semibold text-slate-700 text-sm">{head.name}</div>
                              <div className="text-xs text-slate-400 font-semibold">{freqLabel}</div>
                            </td>
                            <td className="py-3 text-right font-bold text-slate-750 text-sm pr-6">
                              ₹ {(head.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${
                                isMandatory
                                  ? "bg-green-50 text-green-650 border-green-100"
                                  : "bg-blue-50 text-blue-650 border-blue-100"
                              }`}>
                                {isMandatory ? "Mandatory" : "Optional"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Academic Subtotal */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 mb-3.5 shadow-2xs">
                <span className="text-sm font-bold text-blue-700">Academic Subtotal</span>
                <span className="text-base font-black text-blue-700">₹ {academicSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Info className="w-4 h-4 text-blue-405 shrink-0" />
                <span>Mandatory fee heads are applicable for all students. Optional fee heads may vary.</span>
              </div>
            </div>
          </div>

          {/* ── Right: Transport Fee Plan ── */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <Bus className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Transport Fee Plan</h3>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-5">Selected route and drop point for this student.</p>

              {form.transport_required ? (
                <div className="mb-5 bg-green-50/50 border border-green-150 rounded-xl p-4 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-green-800">Transport is required for this student</div>
                    <div className="text-xs text-green-600 font-semibold mt-0.5">Selected transport plan is shown below.</div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-700">Transport is not requested</div>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">Go back to step 1 to request transport.</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Route */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Route</label>
                  <div className="relative flex items-center">
                    <select
                      value={selectedRouteId || ""}
                      onChange={(e) => {
                        const newRouteId = e.target.value;
                        setSelectedRouteId(newRouteId);
                        const route = activeRoutes.find((r) => r._id === newRouteId);
                        setTransportStop(route?.stops?.[0] || "");
                      }}
                      disabled={!form.transport_required}
                      className="w-full h-11 pl-3 pr-20 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-bold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Route</option>
                      {activeRoutes.map((r) => (
                        <option key={r._id} value={r._id}>{r.routeName}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                    {form.transport_required && selectedRouteId && (
                      <span className="absolute right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 pointer-events-none">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Drop Point */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Drop Point / Stop</label>
                  <div className="relative">
                    <select
                      value={transportStop || ""}
                      onChange={(e) => setTransportStop(e.target.value)}
                      disabled={!form.transport_required || !selectedRouteId}
                      className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Drop Point / Stop</option>
                      {selectedRoute?.stops?.map((stop) => (
                        <option key={stop} value={stop}>{stop}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Fee + Frequency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Transport Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-sm text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={transportFee}
                        onChange={(e) => setTransportFee(parseFloat(e.target.value) || 0)}
                        disabled={!form.transport_required}
                        className="w-full h-11 pl-7 pr-3 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Frequency</label>
                    <div className="relative">
                      <select
                        value={transportFrequency}
                        onChange={(e) => setTransportFrequency(e.target.value)}
                        disabled={!form.transport_required}
                        className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Termly</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Status</label>
                  <div className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${
                      form.transport_required
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    }`}>
                      {form.transport_required ? transportStatus : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transport Subtotal */}
            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 shadow-2xs">
                <span className="text-sm font-bold text-blue-700">Transport Subtotal</span>
                <span className="text-base font-black text-blue-700">₹ {transportSubtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col gap-5">

          {/* Adjustments */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
            <button
              type="button"
              onClick={() => setAdjustmentsExpanded(!adjustmentsExpanded)}
              className="w-full flex items-center justify-between px-6 py-4 bg-slate-50/40 border-b border-slate-200/60 hover:bg-slate-50/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-800">Additional Adjustments</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Add discounts, concessions, or additional charges if applicable.</p>
                </div>
              </div>
              {adjustmentsExpanded
                ? <ChevronUp className="w-5 h-5 text-slate-400" />
                : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {adjustmentsExpanded && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                {/* Discounts */}
                <div className="border-r border-slate-100 pr-0 md:pr-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-md bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
                      <Percent className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">Discounts</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <span className="text-xs font-semibold text-slate-400 flex-1">Discount Type</span>
                    <span className="text-xs font-semibold text-slate-400 w-20 text-left pl-1">Amount (₹)</span>
                    <span className="w-8" />
                  </div>
                  <div className="space-y-3 mb-4">
                    {discounts.map((discount, index) => (
                      <div key={discount.id} className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <select
                            value={discount.type}
                            onChange={(e) => handleDiscountChange(index, "type", e.target.value)}
                            className="w-full h-10 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
                          >
                            <option value="Scholarship">Scholarship</option>
                            <option value="Sibling Discount">Sibling Discount</option>
                            <option value="Staff Discount">Staff Discount</option>
                            <option value="Custom Discount">Custom Discount</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-3 w-4 h-4 text-slate-400" />
                        </div>
                        <div className="relative w-20 shrink-0">
                          <span className="absolute left-2.5 top-2.5 text-sm text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={discount.amount}
                            onChange={(e) => handleDiscountChange(index, "amount", parseFloat(e.target.value) || 0)}
                            className="w-full h-10 pl-5 pr-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDiscount(discount.id)}
                          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-rose-100 hover:border-rose-250 text-rose-500 hover:bg-rose-50/50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addDiscount}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-sm font-bold text-slate-605 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Discount
                  </button>
                </div>

                {/* Additional Charges */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">Additional Charges</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <span className="text-xs font-semibold text-slate-400 flex-1">Charge Name</span>
                    <span className="text-xs font-semibold text-slate-400 w-20 text-left pl-1">Amount (₹)</span>
                    <span className="w-8" />
                  </div>
                  <div className="space-y-3 mb-4">
                    {charges.map((charge, index) => (
                      <div key={charge.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={charge.name}
                          placeholder="Charge name"
                          onChange={(e) => handleChargeChange(index, "name", e.target.value)}
                          className="flex-1 min-w-0 h-10 px-3 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                        />
                        <div className="relative w-20 shrink-0">
                          <span className="absolute left-2.5 top-2.5 text-sm text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={charge.amount}
                            onChange={(e) => handleChargeChange(index, "amount", parseFloat(e.target.value) || 0)}
                            className="w-full h-10 pl-5 pr-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCharge(charge.id)}
                          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-rose-100 hover:border-rose-250 text-rose-500 hover:bg-rose-50/50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addCharge}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-sm font-bold text-slate-605 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Charge
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fee Plan Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Fee Plan Summary <span className="text-slate-400 font-normal text-sm">(Estimated)</span>
                </h3>
              </div>

              <div className="space-y-4 text-sm mb-5 font-semibold text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Academic Subtotal</span>
                  <span className="font-bold text-slate-705">₹ {academicSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transport Fee</span>
                  <span className="font-bold text-slate-705">₹ {transportSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Additional Charges</span>
                  <span className="font-bold text-green-600">+ ₹ {additionalChargesTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discounts</span>
                  <span className="font-bold text-rose-500">- ₹ {discountsTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-slate-800">Estimated Total</span>
                  <span className="text-2xl font-black text-blue-650">₹ {estimatedTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3.5 text-xs text-blue-700 leading-relaxed mt-auto font-semibold">
              <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
              <span>Final payable amount will be confirmed in the review step.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ maxHeight: showFooter ? "80px" : "0px", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div
          style={{ transform: showFooter ? "translateY(0)" : "translateY(100%)", opacity: showFooter ? 1 : 0, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease" }}
          className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white"
        >
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Step 1
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const { avatarFile, ...safe } = form;
                localStorage.setItem("studentAdmissionDraft", JSON.stringify(safe));
              }}
              className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedStructureId || isLoadingStructures}
              className="flex items-center gap-2 h-10 px-6 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Next Step
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
