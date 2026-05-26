import React, { useState, useMemo } from "react";
import {
  MapPin, Bus, Plus, Trash2, Pencil, X, Check, FileText,
  Map, DollarSign, HelpCircle, Save, ArrowLeft, ArrowRightLeft
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function CreateRoute({ onCancel, onSave }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [distance, setDistance] = useState("");

  // Assigned Buses state: array of objects { id, number, plate }
  const [buses, setBuses] = useState([
    { id: "bus-1", number: "101", plate: "UP16AB1234" },
    { id: "bus-2", number: "102", plate: "UP16CD5678" }
  ]);

  // Route Stops state: array of objects { id, name }
  const [stops, setStops] = useState([
    { id: "stop-1", name: "Mall Road" },
    { id: "stop-2", name: "Green Park Colony" },
    { id: "stop-3", name: "Old Bus Stand" }
  ]);

  // Actions for Buses
  const handleAddBus = () => {
    const newId = `bus-${Date.now()}`;
    setBuses([...buses, { id: newId, number: "", plate: "" }]);
  };

  const handleUpdateBus = (id, field, value) => {
    setBuses(buses.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleRemoveBus = (id) => {
    if (buses.length <= 1) {
      toast.error("At least one bus registration field is required.");
      return;
    }
    setBuses(buses.filter(b => b.id !== id));
  };

  // Actions for Stops
  const handleAddStop = () => {
    const newId = `stop-${Date.now()}`;
    setStops([...stops, { id: newId, name: "" }]);
  };

  const handleUpdateStop = (id, value) => {
    setStops(stops.map(s => s.id === id ? { ...s, name: value } : s));
  };

  const handleRemoveStop = (id) => {
    setStops(stops.filter(s => s.id !== id));
  };

  // Swap Start and End Points
  const handleSwapEndpoints = () => {
    const temp = startPoint;
    setStartPoint(endPoint);
    setEndPoint(temp);
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!name.trim()) {
      toast.error("Route name is required.");
      return;
    }
    if (!startPoint.trim() || !endPoint.trim()) {
      toast.error("Start and End points are required.");
      return;
    }
    if (!distance || parseFloat(distance) <= 0) {
      toast.error("Please enter a valid route distance.");
      return;
    }

    // Filter out incomplete buses and stops
    const finalBuses = buses.map(b => parseInt(b.number.trim())).filter(num => !isNaN(num));
    const finalStopsCount = stops.filter(s => s.name.trim() !== "").length;

    const newRouteData = {
      id: Date.now(),
      code: `RT-0${Math.floor(Math.random() * 90 + 10)}`,
      name: name.trim(),
      startPoint: startPoint.trim(),
      endPoint: endPoint.trim(),
      stops: finalStopsCount,
      distance: parseFloat(distance),
      buses: finalBuses,
      status: status,
      createdAt: new Date().toISOString()
    };

    onSave(newRouteData);
    toast.success("Bus route created successfully!");
  };

  return (
    <div className="flex-1 flex flex-col gap-6 bg-transparent text-slate-800 pb-10 overflow-y-auto pr-2 min-h-0">

      {/* ── Top Header Block ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0 bg-white/40 p-1 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Bus Route</h1>
          </div>
          <p className="text-xs text-slate-450 font-semibold mt-1 pl-7">
            Configure transport route details, assigned buses, and route stops.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast.success("Draft saved successfully!")}
            className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-3xs"
          >
            <FileText className="w-3.5 h-3.5" />
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 bg-[#0061FF] hover:bg-blue-700 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-3" />
            Save Route
          </button>
        </div>
      </div>

      {/* ── Main Form Sections ── */}
      <div className="space-y-6">

        {/* Section 1: Route Information */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs text-left">
          <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-full bg-[#0061FF] text-white text-xs font-extrabold flex items-center justify-center">1</span>
            <h2 className="text-base font-black text-slate-850 tracking-tight">Route Information</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Route Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Route 3 - City Center to School"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                />
                <span className="text-[11px] text-slate-400 font-medium mt-1.5 block italic">This route name must be unique within the school.</span>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Route Status <span className="text-red-500">*</span></label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all outline-none cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <span className="text-[11px] text-slate-400 font-medium mt-1.5 block italic">Set the current status of this route.</span>
              </div>
            </div>

            {/* Start & End Points with Bus Icon */}
            <div className="flex flex-col md:flex-row items-end gap-0 relative mb-6">
              {/* Start Point - narrower */}
              <div className="w-full md:w-[220px] shrink-0">
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Start Point <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="City Center"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                />
                <span className="text-[11px] text-slate-400 font-medium mt-1.5 block italic">Where the bus route starts.</span>
              </div>

              {/* Bus Icon with longer dashed lines - flex-1 so it expands */}
              <div className="relative flex-1 flex items-center justify-center shrink-0 pb-[22px]">
                {/* Left dashed line */}
                <div className="absolute bottom-[37px] left-0 right-1/2 mr-[26px] border-b-2 border-dashed border-blue-200" />
                {/* Right dashed line */}
                <div className="absolute bottom-[37px] left-1/2 right-0 ml-[26px] border-b-2 border-dashed border-blue-200" />
                <button
                  type="button"
                  onClick={handleSwapEndpoints}
                  className="relative z-10 w-[52px] h-[52px] rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-all cursor-pointer"
                  title="Swap Points"
                >
                  <Bus className="w-5 h-5 text-blue-400" />
                </button>
              </div>

              {/* End Point - narrower */}
              <div className="w-full md:w-[220px] shrink-0">
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  End Point <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Sunrise Public School"
                  value={endPoint}
                  onChange={(e) => setEndPoint(e.target.value)}
                  className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
                />
                <span className="text-[11px] text-slate-400 font-medium mt-1.5 block italic">Where the bus route ends.</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Distance (Km) <span className="text-red-500">*</span></label>
              <input
                type="number"
                step="0.1"
                placeholder="18.6"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="block w-full md:w-1/2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500/20 transition-all outline-none"
              />
              <span className="text-[11px] text-slate-400 font-medium mt-1.5 block italic">Total distance of the route in kilometers.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Assigned Buses */}
        {/* Section 2: Assigned Buses */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs text-left">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#0061FF] text-white text-xs font-extrabold flex items-center justify-center shrink-0">2</span>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Assigned Buses</h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Assign one or more buses to operate on this route.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddBus}
              className="flex items-center gap-1.5 text-sm font-extrabold text-[#0061FF] bg-white hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-300 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Bus
            </button>
          </div>

          <div className="space-y-4">
            {buses.map((bus) => (
              <div key={bus.id} className="flex items-center gap-4 border border-slate-800/10 rounded-2xl px-5 py-4 bg-white">

                {/* Bus Icon */}
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Bus className="w-4.5 h-4.5 text-blue-500" />
                </div>

                {/* Bus Number */}
                <div className="flex-1">
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                    Bus Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="101"
                    value={bus.number}
                    onChange={(e) => handleUpdateBus(bus.id, "number", e.target.value)}
                    className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>

                {/* Plate Number */}
                <div className="flex-1">
                  <label className="block text-[12px] font-bold text-slate-700 mb-1.5">
                    Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="UP16AB1234"
                    value={bus.plate}
                    onChange={(e) => handleUpdateBus(bus.id, "plate", e.target.value)}
                    className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleRemoveBus(bus.id)}
                  className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0 mt-5"
                  title="Remove Bus"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Route Stops */}
        {/* Section 3: Route Stops */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs text-left">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#0061FF] text-white text-xs font-extrabold flex items-center justify-center shrink-0">3</span>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Route Stops</h2>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Add and organize stops in the order the bus will travel.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddStop}
              className="flex items-center gap-1.5 text-sm font-extrabold text-[#0061FF] bg-white hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-300 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Stop
            </button>
          </div>

          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-10 bottom-10 w-0.5 border-l-2 border-dashed border-slate-200 z-0" />

            <div className="space-y-3">

              {/* Start Point Row */}
              <div className="relative flex items-center gap-4">
                {/* Node */}
                <div className="relative z-10 shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-200">
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-2xl px-5 py-3.5 bg-white">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-md tracking-wide">Start</span>
                    <span className="text-sm font-bold text-slate-800">{startPoint ? `${startPoint} (Start Point)` : "City Center (Start Point)"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg">Start Point</span>
                </div>
              </div>

              {/* Mid Stops */}
              {stops.map((stop, idx) => (
                <div key={stop.id} className="relative flex items-center gap-4">
                  {/* Node */}
                  <div className="relative z-10 shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#0061FF] flex items-center justify-center shadow-md shadow-blue-200">
                      <span className="text-[11px] font-extrabold text-white">{idx + 1}</span>
                    </div>
                  </div>
                  {/* Card */}
                  <div className="flex-1 flex items-center gap-4 border border-slate-200 rounded-2xl px-5 py-3 bg-white">
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Stop Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Stop Location Name"
                        value={stop.name}
                        onChange={(e) => handleUpdateStop(stop.id, e.target.value)}
                        className="block w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                        title="Edit Stop"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(stop.id)}
                        className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-all cursor-pointer"
                        title="Delete Stop"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                        title="More options"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <circle cx="10" cy="4" r="1.5" />
                          <circle cx="10" cy="10" r="1.5" />
                          <circle cx="10" cy="16" r="1.5" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* End Point Row */}
              <div className="relative flex items-center gap-4">
                {/* Node */}
                <div className="relative z-10 shrink-0">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md shadow-red-200">
                    <MapPin className="w-5 h-5 text-white fill-white" />
                  </div>
                </div>
                {/* Card */}
                <div className="flex-1 flex items-center justify-between border border-slate-200 rounded-2xl px-5 py-3.5 bg-white">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase bg-red-50 text-red-500 border border-red-200 px-2 py-0.5 rounded-md tracking-wide">End</span>
                    <span className="text-sm font-bold text-slate-800">{endPoint ? `${endPoint} (End Point)` : "Sunrise Public School (End Point)"}</span>
                  </div>
                  <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">End Point</span>
                </div>
              </div>

            </div>
          </div>

          {/* Total Stops Count */}
          <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#0061FF] bg-blue-50/60 border border-blue-100 px-5 py-3 rounded-xl">
            <svg className="w-4 h-4 text-[#0061FF]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Total Stops: {stops.filter(s => s.name.trim() !== "").length}</span>
          </div>
        </div>


       {/* ── Sections 4 & 5 Side by Side ── */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

  {/* Section 4: Route Preview */}
  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs text-left">
    <div className="flex items-center gap-3 mb-5">
      <span className="w-7 h-7 rounded-full bg-[#0061FF] text-white text-xs font-extrabold flex items-center justify-center shrink-0">4</span>
      <h2 className="text-base font-black text-slate-900 tracking-tight">Route Preview</h2>
    </div>

    <div className="flex gap-4">
      {/* Stats List */}
      <div className="flex-1 space-y-3.5">
        <div className="flex items-center gap-3">
          <Bus className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold w-20 shrink-0">Route Name</span>
          <span className="text-xs font-extrabold text-slate-800 truncate">{name || "Route 3 - City Center to School"}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold w-20 shrink-0">Total Stops</span>
          <span className="text-xs font-extrabold text-slate-800">{stops.filter(s => s.name.trim() !== "").length}</span>
        </div>
        <div className="flex items-center gap-3">
          <Bus className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-400 font-semibold w-20 shrink-0">Total Buses</span>
          <span className="text-xs font-extrabold text-slate-800">{buses.filter(b => b.number.trim() !== "").length}</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/><path d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101"/></svg>
          <span className="text-xs text-slate-400 font-semibold w-20 shrink-0">Distance</span>
          <span className="text-xs font-extrabold text-slate-800">{distance ? `${distance} km` : "--"}</span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
          <span className="text-xs text-slate-400 font-semibold w-20 shrink-0">Status</span>
          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${
            status === "Active"
              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
              : "text-amber-600 bg-amber-50 border-amber-200"
          }`}>{status}</span>
        </div>
      </div>

      {/* Map Graphic */}
      <div className="w-[130px] shrink-0 rounded-2xl bg-emerald-50/60 border border-emerald-100/60 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 120 120" className="w-full h-full p-2" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          {[20,40,60,80,100].map(v => (
            <g key={v}>
              <line x1={v} y1="10" x2={v} y2="110" stroke="#d1fae5" strokeWidth="1"/>
              <line x1="10" y1={v} x2="110" y2={v} stroke="#d1fae5" strokeWidth="1"/>
            </g>
          ))}
          {/* Route path */}
          <path d="M30 85 C 50 85, 55 45, 85 35" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4"/>
          {/* Start pin - green */}
          <circle cx="30" cy="85" r="8" fill="#10B981"/>
          <circle cx="30" cy="85" r="4" fill="white"/>
          <circle cx="30" cy="85" r="2" fill="#10B981"/>
          {/* End pin - red */}
          <ellipse cx="85" cy="33" rx="9" ry="9" fill="#EF4444"/>
          <circle cx="85" cy="33" r="4" fill="white"/>
          <circle cx="85" cy="33" r="2" fill="#EF4444"/>
          <line x1="85" y1="42" x2="85" y2="50" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
          {/* Bus */}
          <g transform="translate(54,57) rotate(-30)">
            <rect x="-9" y="-5" width="18" height="11" rx="3" fill="#3b82f6"/>
            <rect x="-6" y="-3" width="5" height="4" rx="1" fill="white" opacity="0.9"/>
            <rect x="1" y="-3" width="5" height="4" rx="1" fill="white" opacity="0.9"/>
            <circle cx="-5" cy="6" r="2.5" fill="#1e293b"/>
            <circle cx="5" cy="6" r="2.5" fill="#1e293b"/>
          </g>
        </svg>
      </div>
    </div>
  </div>

  {/* Section 5: Transport Fees */}
  <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-3xs text-left">
    <div className="flex items-center gap-3 mb-5">
      <span className="w-7 h-7 rounded-full bg-[#0061FF] text-white text-xs font-extrabold flex items-center justify-center shrink-0">5</span>
      <h2 className="text-base font-black text-slate-900 tracking-tight">Transport Fees</h2>
    </div>

    {/* Warning Card */}
    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3.5 mb-4">
      <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center shrink-0">
        <span className="text-amber-500 font-black text-base">₹</span>
      </div>
      <div>
        <h4 className="text-sm font-extrabold text-amber-600 mb-1">Transport Fees Not Configured</h4>
        <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">You can configure stop-wise transport fee structures after saving this route.</p>
      </div>
    </div>

    {/* Configure Button */}
    <button
      type="button"
      onClick={() => toast.info("Configure fees after route creation")}
      className="w-full flex items-center justify-center gap-2 border border-blue-200 text-[#0061FF] hover:bg-blue-50 text-sm font-extrabold py-3 rounded-xl transition-all cursor-pointer mb-3"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4H9m6 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      Configure Transport Fees
      <span className="ml-1">→</span>
    </button>

    {/* Footer note */}
    <div className="flex items-start gap-2 text-[11px] text-slate-400 font-semibold">
      <svg className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>Transport fees are managed separately and linked to this route.</span>
    </div>
  </div>

</div>

{/* ── Bottom Action Row ── */}
<div className="bg-white border border-slate-100 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
  <button
    type="button"
    onClick={onCancel}
    className="px-8 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-extrabold text-slate-700 transition-all cursor-pointer"
  >
    Cancel
  </button>
  <div className="flex items-center gap-3">
    <button
      type="button"
      onClick={() => toast.success("Draft saved successfully!")}
      className="flex items-center gap-2 px-6 py-3 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-sm font-extrabold text-slate-700 transition-all cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1-4H9m6 0a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
      Save Draft
    </button>
    <button
      type="button"
      onClick={handleSubmit}
      className="flex items-center gap-2 px-7 py-3 bg-[#0061FF] hover:bg-blue-700 text-white rounded-xl text-sm font-extrabold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>
      Save Route
    </button>
  </div>
</div>

      </div>


    </div>
  );
}
