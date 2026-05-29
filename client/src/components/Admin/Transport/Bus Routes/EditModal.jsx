import React from "react";
import { X, Pencil, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Backend valid statuses are lowercase: "active" | "inactive" | "archived"
const STATUS_OPTIONS = [
  { value: "active",   label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "archived", label: "Archived" },
];

export default function EditModal({ editingRoute, setEditingRoute, onSubmit, isLoading }) {
  if (!editingRoute) return null;

  // ── Buses helpers ──
  const handleBusChange = (idx, field, val) =>
    setEditingRoute((prev) => {
      const buses = prev.buses.map((b, i) => (i === idx ? { ...b, [field]: val } : b));
      return { ...prev, buses };
    });

  const handleAddBus = () =>
    setEditingRoute((prev) => ({
      ...prev,
      buses: [...(prev.buses || []), { busNo: "", plateNumber: "" }],
    }));

  const handleRemoveBus = (idx) =>
    setEditingRoute((prev) => ({
      ...prev,
      buses: prev.buses.filter((_, i) => i !== idx),
    }));

  // ── Stops helpers ──
  const handleStopChange = (idx, val) =>
    setEditingRoute((prev) => {
      const stops = prev.stops.map((s, i) => (i === idx ? val : s));
      return { ...prev, stops };
    });

  const handleAddStop = () =>
    setEditingRoute((prev) => ({ ...prev, stops: [...(prev.stops || []), ""] }));

  const handleRemoveStop = (idx) =>
    setEditingRoute((prev) => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== idx),
    }));

  const buses = editingRoute.buses || [];
  const stops = editingRoute.stops || [];

  return (
    <AnimatePresence>
      {editingRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEditingRoute(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-850">Edit Route</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    {editingRoute.routeName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingRoute(null)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-150 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="flex flex-col min-h-0">
              <div className="p-6 overflow-y-auto space-y-5 text-left">

                {/* Route Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">
                    Route Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingRoute.routeName || ""}
                    onChange={(e) => setEditingRoute({ ...editingRoute, routeName: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                    required
                  />
                </div>

                {/* Start / End */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">
                      Start Point <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingRoute.startPoint || ""}
                      onChange={(e) => setEditingRoute({ ...editingRoute, startPoint: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">
                      End Point <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingRoute.endPoint || ""}
                      onChange={(e) => setEditingRoute({ ...editingRoute, endPoint: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Distance + Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">
                      Distance (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingRoute.distanceKm ?? ""}
                      onChange={(e) => setEditingRoute({ ...editingRoute, distanceKm: parseFloat(e.target.value) || 0 })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">
                      Status
                    </label>
                    <select
                      value={editingRoute.status || "active"}
                      onChange={(e) => setEditingRoute({ ...editingRoute, status: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Buses */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Buses</label>
                    <button
                      type="button"
                      onClick={handleAddBus}
                      className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Bus
                    </button>
                  </div>
                  <div className="space-y-2">
                    {buses.map((bus, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Bus No."
                          value={bus.busNo ?? ""}
                          onChange={(e) => handleBusChange(idx, "busNo", e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Plate No."
                          value={bus.plateNumber ?? ""}
                          onChange={(e) => handleBusChange(idx, "plateNumber", e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBus(idx)}
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {buses.length === 0 && (
                      <p className="text-[11px] text-slate-400 font-semibold italic">No buses assigned.</p>
                    )}
                  </div>
                </div>

                {/* Stops */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-550 uppercase tracking-wide">Stops</label>
                    <button
                      type="button"
                      onClick={handleAddStop}
                      className="flex items-center gap-1 text-[11px] font-extrabold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add Stop
                    </button>
                  </div>
                  <div className="space-y-2">
                    {stops.map((stop, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          placeholder={`Stop ${idx + 1}`}
                          value={stop}
                          onChange={(e) => handleStopChange(idx, e.target.value)}
                          className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {stops.length === 0 && (
                      <p className="text-[11px] text-slate-400 font-semibold italic">No stops added.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Saving…
                    </>
                  ) : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
