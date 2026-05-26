import React, { useState, useMemo } from "react";
import {
  ArrowLeft, Save, Check, Search, ChevronDown,
  Trash2, Info, AlertTriangle, Bus, MapPin,
  LayoutGrid, Calendar, Ruler, X, RotateCcw, Eye, MoreVertical
} from "lucide-react";

// ── Font and CSS Styling ────────────────────────────────────────────────────
const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .tfc-root * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
    .tfc-root input::placeholder { color: #94a3b8; font-weight: 500; font-size: 12.5px; }
    .tfc-root select { appearance: none; -webkit-appearance: none; -moz-appearance: none; }
    
    /* Specific Row Highlights based on Image 1 */
    .tfc-row-highlight { 
      border-left: 3px solid #f97316 !important; 
      background-color: #fef2f2 !important; 
    }
    .tfc-row-inactive { 
      background-color: #fffbeb !important; 
    }
    
    /* Input border for empty configuration row */
    .tfc-input-alert {
      border: 1.5px solid #fca5a5 !important;
      background-color: #fffdec !important;
      color: #b91c1c !important;
    }
    .tfc-input-alert::placeholder {
      color: #fca5a5 !important;
    }
  `}</style>
);

// ── Custom Rupee Icon Badge ──────────────────────────────────────────────────
const IconRupeeBadge = () => (
  <div className="w-8 h-8 rounded-full border-2 border-blue-200 bg-blue-50 flex items-center justify-center shrink-0">
    <span className="text-[13px] font-800 text-blue-600">₹</span>
  </div>
);

// ── Initial Mock Data ────────────────────────────────────────────────────────
const ROUTES_MAP = {
  "Route 3 - City Center": {
    name: "Route 3 - City Center",
    startPoint: "City Center",
    endPoint: "Sunrise Public School",
    distance: "18.6 km",
    stops: [
      { id: 1,  name: "City Center (Start Point)",       isEndpoint: "start", amount: "",     frequency: "Monthly", status: "N/A"      },
      { id: 2,  name: "Guindy",                           isEndpoint: false,   amount: "1200", frequency: "Monthly", status: "Active"   },
      { id: 3,  name: "Little Mount",                     isEndpoint: false,   amount: "1300", frequency: "Monthly", status: "Active"   },
      { id: 4,  name: "Saidapet",                         isEndpoint: false,   amount: "1400", frequency: "Monthly", status: "Active"   },
      { id: 5,  name: "Teynampet",                        isEndpoint: false,   amount: "",     frequency: "Monthly", status: "Active"   },
      { id: 6,  name: "Nandanam",                         isEndpoint: false,   amount: "1500", frequency: "Monthly", status: "Active"   },
      { id: 7,  name: "Alwarpet",                         isEndpoint: false,   amount: "1500", frequency: "Monthly", status: "Active"   },
      { id: 8,  name: "R.A. Puram",                       isEndpoint: false,   amount: "1600", frequency: "Monthly", status: "Active"   },
      { id: 9,  name: "Mandaveli",                        isEndpoint: false,   amount: "",     frequency: "Monthly", status: "Inactive" },
      { id: 10, name: "San Thome",                        isEndpoint: false,   amount: "1700", frequency: "Monthly", status: "Active"   },
      { id: 11, name: "Mylapore",                         isEndpoint: false,   amount: "",     frequency: "Monthly", status: "Active"   },
      { id: 12, name: "Sunrise Public School (End Point)",isEndpoint: "end",   amount: "",     frequency: "Monthly", status: "N/A"      },
    ]
  },
  "Route 1 - Green Park": {
    name: "Route 1 - Green Park",
    startPoint: "Green Park Terminal",
    endPoint: "Sunrise Public School",
    distance: "12.4 km",
    stops: [
      { id: 1,  name: "Green Park Terminal (Start Point)", isEndpoint: "start", amount: "",     frequency: "Monthly", status: "N/A"      },
      { id: 2,  name: "Sector 15 Cross",                  isEndpoint: false,   amount: "1000", frequency: "Monthly", status: "Active"   },
      { id: 3,  name: "Metro Station Gate 2",             isEndpoint: false,   amount: "1100", frequency: "Monthly", status: "Active"   },
      { id: 4,  name: "Ambattur",                         isEndpoint: false,   amount: "1200", frequency: "Monthly", status: "Active"   },
      { id: 5,  name: "Anna Nagar",                       isEndpoint: false,   amount: "1350", frequency: "Monthly", status: "Active"   },
      { id: 6,  name: "Sunrise Public School (End Point)",isEndpoint: "end",   amount: "",     frequency: "Monthly", status: "N/A"      },
    ]
  },
  "Route 2 - Lake View": {
    name: "Route 2 - Lake View",
    startPoint: "Lake View Campus",
    endPoint: "Sunrise Public School",
    distance: "15.2 km",
    stops: [
      { id: 1,  name: "Lake View Campus (Start Point)",   isEndpoint: "start", amount: "",     frequency: "Monthly", status: "N/A"      },
      { id: 2,  name: "Velachery",                        isEndpoint: false,   amount: "1400", frequency: "Monthly", status: "Active"   },
      { id: 3,  name: "Pallikaranai",                     isEndpoint: false,   amount: "1500", frequency: "Monthly", status: "Active"   },
      { id: 4,  name: "Medavakkam",                       isEndpoint: false,   amount: "",     frequency: "Monthly", status: "Active"   },
      { id: 5,  name: "Sunrise Public School (End Point)",isEndpoint: "end",   amount: "",     frequency: "Monthly", status: "N/A"      },
    ]
  }
};

const FREQUENCIES = ["Monthly", "Quarterly", "Annually", "One-time"];
const STATUS_OPTS  = ["Active", "Inactive", "Archived"];

export default function TransportFeeConfig({ onBack, onSave }) {
  // ── Route & Year selections ────────────────────────────────────────────────
  const [selectedRouteName, setSelectedRouteName] = useState("Route 3 - City Center");
  const [selectedYear, setSelectedYear] = useState("2025 - 2026");

  // Stops state for each route dynamically
  const [routeStops, setRouteStops] = useState({
    "Route 3 - City Center": ROUTES_MAP["Route 3 - City Center"].stops,
    "Route 1 - Green Park": ROUTES_MAP["Route 1 - Green Park"].stops,
    "Route 2 - Lake View": ROUTES_MAP["Route 2 - Lake View"].stops,
  });

  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Status");
  const [selected, setSelected]   = useState([]);
  const [fillAmt, setFillAmt]     = useState("");
  const [showFill, setShowFill]   = useState(false);
  const [saved, setSaved]         = useState(true);

  // ── Derived statistics ─────────────────────────────────────────────────────
  const activeRoute = ROUTES_MAP[selectedRouteName] || ROUTES_MAP["Route 3 - City Center"];
  const stops = routeStops[selectedRouteName] || [];
  const midStops = stops.filter(s => !s.isEndpoint);

  const filtered = useMemo(() => {
    return stops.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All Status" || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [stops, search, statusFilter]);

  const feesConfigured = midStops.filter(s => s.amount !== "" && s.status !== "Inactive" && s.status !== "Archived").length;
  const remaining      = midStops.filter(s => s.amount === "" && s.status === "Active").length;
  const inactiveCount  = midStops.filter(s => s.status === "Inactive" || s.status === "Archived").length;
  const estimatedTotal = midStops.reduce((sum, s) => {
    if (s.status === "Active" && s.amount !== "") return sum + parseInt(s.amount || 0);
    return sum;
  }, 0);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const updateStop = (id, field, value) => {
    setSaved(false);
    setRouteStops(prev => ({
      ...prev,
      [selectedRouteName]: prev[selectedRouteName].map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const deleteStop = (id) => {
    setSaved(false);
    setRouteStops(prev => ({
      ...prev,
      [selectedRouteName]: prev[selectedRouteName].filter(s => s.id !== id)
    }));
  };

  const toggleSelect = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    const midIds = filtered.filter(s => !s.isEndpoint).map(s => s.id);
    if (midIds.every(id => selected.includes(id))) setSelected([]);
    else setSelected(midIds);
  };

  const handleFillSame = () => {
    if (!fillAmt) { setShowFill(true); return; }
    setSaved(false);
    setRouteStops(prev => ({
      ...prev,
      [selectedRouteName]: prev[selectedRouteName].map(s =>
        !s.isEndpoint && (selected.length === 0 || selected.includes(s.id))
          ? { ...s, amount: fillAmt }
          : s
      )
    }));
    setShowFill(false);
    setFillAmt("");
  };

  const handleSave = () => {
    setSaved(true);
    if (onSave) onSave(stops);
  };

  // ── Helper Row status logic matching design ────────────────────────────────
  const isInactive    = (s) => s.status === "Inactive" || s.status === "Archived";
  const isHighlighted = (s) => !s.isEndpoint && s.amount === "" && s.status === "Active";

  return (
    <>
      <FontStyle />
      <div className="tfc-root flex flex-col h-full min-h-0 overflow-hidden bg-transparent text-slate-800">

        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 mb-4 p-1">
          <div className="flex flex-col">
            <div className="flex items-center gap-3.5 flex-wrap">
              <span className="text-[26px] font-900 text-slate-900 tracking-[-0.03em] leading-tight">
                Transport Fee Configuration
              </span>
              
              {/* Route Dropdown Selector styled as dark pill badge */}
              <div className="relative">
                <select
                  value={selectedRouteName}
                  onChange={(e) => {
                    setSelectedRouteName(e.target.value);
                    setSelected([]);
                  }}
                  className="pl-4 pr-9 py-1.5 bg-[#1e293b] hover:bg-[#0f172a] border border-[#1e293b] text-white font-700 text-[12px] rounded-full outline-none cursor-pointer transition-all appearance-none"
                >
                  {Object.keys(ROUTES_MAP).map(name => (
                    <option key={name} value={name} className="text-slate-900 font-medium bg-white">{`Route: ${name}`}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/70 pointer-events-none" />
              </div>

              {/* Academic Year Selector styled as outline pill badge */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="pl-4 pr-9 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-700 text-[12px] rounded-full outline-none cursor-pointer transition-all appearance-none"
                >
                  <option value="2025 - 2026" className="text-slate-900 font-medium">Academic Year: 2025 - 2026</option>
                  <option value="2026 - 2027" className="text-slate-900 font-medium">Academic Year: 2026 - 2027</option>
                  <option value="2024 - 2025" className="text-slate-900 font-medium">Academic Year: 2024 - 2025</option>
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <p className="text-[12.5px] text-slate-400 font-500 mt-1">Set stop-wise transport fees for the selected bus route.</p>
          </div>

        
        </div>

        {/* ── Main body: table + sidebar ── */}
        <div className="flex flex-1 gap-5 min-h-0 overflow-hidden pb-4">

          {/* ── Left: table area ── */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">

            {/* Route Info Bar */}
            <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3.5 flex flex-wrap gap-6 items-center shadow-sm shrink-0">
              {[
                { Icon: Bus, label: "Route Name", value: activeRoute.name, color: "text-blue-500", bg: "bg-blue-50" },
                { Icon: MapPin, label: "Start Point", value: activeRoute.startPoint, color: "text-emerald-500", bg: "bg-emerald-50" },
                { Icon: MapPin, label: "End Point", value: activeRoute.endPoint, color: "text-emerald-500", bg: "bg-emerald-50" },
                { Icon: LayoutGrid, label: "Total Stops", value: stops.length.toString(), color: "text-purple-500", bg: "bg-purple-50" },
                { Icon: Ruler, label: "Distance", value: activeRoute.distance, color: "text-blue-500", bg: "bg-blue-50" },
                { Icon: Calendar, label: "Academic Year", value: selectedYear, color: "text-amber-500", bg: "bg-amber-50" },
              ].map(({ Icon, label, value, color, bg }) => (
                <div key={label} className="flex items-center gap-2.5 min-w-[130px]">
                  <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-700 text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
                    <div className="text-[13px] font-700 text-slate-800 leading-tight">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Banner */}
            <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 shrink-0">
              <Info className="w-4.5 h-4.5 text-[#0061FF] shrink-0" />
              <span className="text-[12.5px] font-600 text-blue-700 italic">Existing transport fee rows have been loaded for this route.</span>
            </div>

            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap shrink-0">
              {/* Search with icon on the right */}
              <div className="relative flex-1 min-w-[180px] max-w-[240px]">
                <input
                  type="text"
                  placeholder="Search stops..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-[12.5px] font-500 text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 outline-none transition-all"
                />
                <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={e => setStatus(e.target.value)}
                  className="pl-4 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-[12.5px] font-600 text-slate-700 focus:border-blue-400 outline-none cursor-pointer transition-all"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Archived</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>

              {/* Fill same amount */}
              {showFill ? (
                <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-xl px-3 py-1.5 shadow-sm">
                  <span className="text-[12px] font-600 text-slate-600">₹</span>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={fillAmt}
                    onChange={e => setFillAmt(e.target.value)}
                    className="w-24 text-[12.5px] font-600 text-slate-800 outline-none"
                    autoFocus
                  />
                  <button onClick={handleFillSame} className="text-[11px] font-800 text-white bg-[#0061FF] px-3 py-1 rounded-lg cursor-pointer">Apply</button>
                  <button onClick={() => { setShowFill(false); setFillAmt(""); }} className="text-slate-450 hover:text-slate-600 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <button
                  onClick={() => setShowFill(true)}
                  className="flex items-center gap-1.5 text-[12.5px] font-700 text-[#0061FF] bg-white border border-blue-200 hover:bg-blue-50 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
                >
                  <Save className="w-3.5 h-3.5 text-blue-500" />
                  Fill Same Amount
                </button>
              )}

              {/* More Actions */}
              <div className="relative">
                <button className="flex items-center gap-1.5 text-[12.5px] font-700 text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-all cursor-pointer">
                  More Actions
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Stops Table */}
            <div className="flex-1 bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-0">
              {/* Header row */}
              <div className="grid grid-cols-[36px_40px_1fr_160px_180px_160px_90px] items-center px-5 py-3.5 border-b border-slate-100 bg-slate-50/50 select-none shrink-0">
                <input
                  type="checkbox"
                  checked={filtered.filter(s=>!s.isEndpoint).every(s=>selected.includes(s.id)) && filtered.filter(s=>!s.isEndpoint).length > 0}
                  onChange={toggleAll}
                  className="w-4.5 h-4.5 rounded border-slate-350 text-blue-600 cursor-pointer accent-blue-600"
                />
                <span className="text-[11px] font-800 text-slate-400 uppercase tracking-wider">#</span>
                <span className="text-[11px] font-800 text-slate-400 uppercase tracking-wider">Stop / Drop Point</span>
                <span className="text-[11px] font-800 text-slate-400 uppercase tracking-wider">Amount (₹) <span className="text-red-500 font-bold">*</span></span>
                <span className="text-[11px] font-800 text-slate-400 uppercase tracking-wider">Frequency <span className="text-red-500 font-bold">*</span></span>
                <span className="text-[11px] font-800 text-slate-400 uppercase tracking-wider">Status <span className="text-red-500 font-bold">*</span></span>
                <span className="text-[11px] font-800 text-slate-400 uppercase tracking-wider text-center">Actions</span>
              </div>

              {/* Scrollable table body */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {filtered.map((stop) => {
                  const isEnd     = !!stop.isEndpoint;
                  const inactive  = isInactive(stop);
                  const highlight = isHighlighted(stop);

                  return (
                    <div
                      key={stop.id}
                      className={`grid grid-cols-[36px_40px_1fr_160px_180px_160px_90px] items-center px-5 py-2.5 transition-all
                        ${highlight  ? "tfc-row-highlight" : ""}
                        ${inactive   ? "tfc-row-inactive"  : ""}
                        hover:bg-slate-50/50
                      `}
                    >
                      {/* Checkbox */}
                      <div>
                        {!isEnd ? (
                          <input
                            type="checkbox"
                            checked={selected.includes(stop.id)}
                            onChange={() => toggleSelect(stop.id)}
                            className="w-4.5 h-4.5 rounded border-slate-350 accent-blue-600 cursor-pointer"
                          />
                        ) : <span />}
                      </div>

                      {/* Row # */}
                      <span className="text-[12.5px] font-700 text-slate-400">{stop.id}</span>

                      {/* Stop name */}
                      <div className="flex items-center gap-2 pr-3">
                        <span className={`text-[13px] font-700 ${isEnd ? "text-slate-500 italic" : "text-slate-800"}`}>
                          {stop.name}
                        </span>
                      </div>

                      {/* Amount Input */}
                      <div className="pr-3">
                        {isEnd ? (
                          <span className="text-[13px] text-slate-400 font-bold ml-1">—</span>
                        ) : (
                          <input
                            type="text"
                            placeholder="Enter amount"
                            value={stop.amount}
                            onChange={e => updateStop(stop.id, "amount", e.target.value)}
                            className={`w-full px-3 py-1.5 border rounded-lg text-[13px] font-700 text-slate-850 outline-none transition-all
                              ${stop.amount === "" && stop.status === "Active"
                                ? "tfc-input-alert focus:border-red-400 focus:ring-1 focus:ring-red-400"
                                : "border-slate-200 bg-white placeholder:text-slate-350 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/10"
                              }`}
                          />
                        )}
                      </div>

                      {/* Frequency Selector */}
                      <div className="pr-3">
                        {isEnd ? (
                          <span className="text-[13px] text-slate-400 font-bold ml-1">—</span>
                        ) : (
                          <div className="relative">
                            <select
                              value={stop.frequency}
                              onChange={e => updateStop(stop.id, "frequency", e.target.value)}
                              className="w-full pl-3 pr-7 py-1.5 border border-slate-200 bg-white rounded-lg text-[13px] font-600 text-slate-700 outline-none cursor-pointer focus:border-blue-400 transition-all"
                            >
                              {FREQUENCIES.map(f => <option key={f}>{f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                          </div>
                        )}
                      </div>

                      {/* Status Badge Selector */}
                      <div className="pr-3">
                        {isEnd ? (
                          <span className="text-[11px] font-800 bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg">N/A</span>
                        ) : (
                          <div className="relative">
                            <select
                              value={stop.status}
                              onChange={e => updateStop(stop.id, "status", e.target.value)}
                              className={`w-full pl-3 pr-7 py-1.5 border rounded-lg text-[12.5px] font-800 outline-none cursor-pointer focus:border-blue-400 transition-all
                                ${stop.status === "Active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}
                                ${stop.status === "Inactive" ? "border-amber-250 bg-amber-50 text-amber-700" : ""}
                                ${stop.status === "Archived" ? "border-slate-200 bg-slate-100 text-slate-500" : ""}
                              `}
                            >
                              {STATUS_OPTS.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                          </div>
                        )}
                      </div>

                      {/* Reset / Delete Actions */}
                      <div className="flex items-center gap-3.5 justify-center">
                        {!isEnd && (
                          <>
                            <button
                              onClick={() => updateStop(stop.id, "amount", "")}
                              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-500 transition-all cursor-pointer"
                              title="Reset Amount"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteStop(stop.id)}
                              className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                              title="Delete Stop"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Table footer / legend */}
              <div className="border-t border-slate-100 px-5 py-3 flex items-center justify-between shrink-0 bg-slate-50/20 select-none">
                <span className="text-[11.5px] font-600 text-slate-450">
                  Showing 1 to {filtered.length} of {stops.length} stops
                </span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-700 text-slate-450 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                    Not configured
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-700 text-slate-450 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    Inactive
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] font-700 text-slate-450 uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    All good
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="w-[230px] shrink-0 flex flex-col gap-3.5 overflow-y-auto pr-0.5">

            {/* Route & Fee Summary box */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm">
              <h3 className="text-[13px] font-800 text-slate-900 tracking-[-0.01em] mb-3.5 uppercase">Route & Fee Summary</h3>

              <div className="mb-3.5 pb-3 border-b border-slate-100">
                <div className="text-[10px] font-700 text-slate-400 uppercase tracking-wider mb-0.5">Route Name</div>
                <div className="text-[13.5px] font-800 text-slate-800">{activeRoute.name}</div>
              </div>

              <div className="mb-4 pb-3 border-b border-slate-100">
                <div className="text-[10px] font-700 text-slate-400 uppercase tracking-wider mb-0.5">Academic Year</div>
                <div className="text-[13.5px] font-800 text-slate-800">{selectedYear}</div>
              </div>

              {/* Stats grid matching Image 1 exactly */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[9.5px] font-700 text-slate-400 uppercase tracking-wider mb-1">Total Stops</div>
                  <div className="text-[20px] font-800 text-blue-600 leading-none">{stops.length}</div>
                </div>
                <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-xl p-3">
                  <div className="text-[9.5px] font-700 text-emerald-600 uppercase tracking-wider mb-1">Fees Configured</div>
                  <div className="text-[20px] font-800 text-emerald-600 leading-none">{feesConfigured}</div>
                </div>
                <div className="bg-orange-50/40 border border-orange-100/50 rounded-xl p-3">
                  <div className="text-[9.5px] font-700 text-orange-500 uppercase tracking-wider mb-1">Remaining</div>
                  <div className="text-[20px] font-800 text-orange-500 leading-none">{remaining}</div>
                </div>
                <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
                  <div className="text-[9.5px] font-700 text-slate-400 uppercase tracking-wider mb-1">Inactive / Archived</div>
                  <div className="text-[20px] font-800 text-slate-500 leading-none">{inactiveCount}</div>
                </div>
              </div>

              {/* Estimated total Price Box */}
              <div className="border-t border-slate-100 pt-3.5">
                <div className="text-[10.5px] font-700 text-slate-450 uppercase tracking-wider mb-2 block">Estimated Total (Monthly)</div>
                <div className="flex items-center gap-3">
                  <IconRupeeBadge />
                  <span className="text-[24px] font-900 text-[#0061FF] tracking-[-0.03em] leading-none">
                    ₹ {estimatedTotal.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-600 mt-2">Based on active fee rows only.</p>
              </div>
            </div>

            {/* Save Status */}
            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <div className="text-[10.5px] font-700 text-slate-400 uppercase tracking-wider mb-2 block">Save Status</div>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${saved ? "bg-emerald-500" : "bg-orange-500"}`} />
                <span className={`text-[12.5px] font-800 ${saved ? "text-emerald-600" : "text-orange-600"}`}>
                  {saved ? "All changes saved" : "Unsaved changes"}
                </span>
              </div>
              {saved && (
                <p className="text-[10.5px] text-slate-400 font-550 mt-1">
                  Last saved: Today, 12:45 PM by Admin User
                </p>
              )}
            </div>

            {/* Important Note Box */}
            <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
                <span className="text-[12px] font-800 text-amber-700 uppercase tracking-wide">Important Note</span>
              </div>
              <p className="text-[11px] font-600 text-amber-700 leading-relaxed">
                This route has updated stops. Review the fee rows before saving.
              </p>
            </div>

            {/* After Saving Box */}
            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5">
                <Info className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span className="text-[12px] font-800 text-blue-700 uppercase tracking-wide">After Saving</span>
              </div>
              <p className="text-[11px] font-600 text-blue-700 leading-relaxed">
                Transport fees will be linked to this route and can be used during admissions.
              </p>
            </div>

          </div>
        </div>

        {/* ── Bottom Action Bar ── */}
        <div className="bg-white border-t border-slate-100 px-6 py-4 flex items-center justify-between gap-4 shrink-0 -mx-6 -mb-4 shadow-sm">
          <button
            onClick={() => onBack && onBack()}
            className="flex items-center gap-1.5 px-6 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-[13px] font-700 text-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSaved(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-slate-250 bg-white hover:bg-slate-50 rounded-xl text-[13px] font-700 text-slate-700 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#0061FF] hover:bg-blue-700 text-white rounded-xl text-[13px] font-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              Save Fees
            </button>
          </div>
        </div>

      </div>
    </>
  );
}