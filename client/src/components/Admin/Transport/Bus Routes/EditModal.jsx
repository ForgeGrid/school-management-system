import React from "react";
import { X, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function EditModal({ editingRoute, setEditingRoute, onSubmit }) {
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
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 z-10 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex items-center justify-center text-indigo-600">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-850">Edit Route Details</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    Modify parameters for {editingRoute.code}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingRoute(null)}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-150 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="flex flex-col min-h-0">
              <div className="p-6 overflow-y-auto max-h-[380px] space-y-4 text-left">

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">Route Name *</label>
                    <input
                      type="text"
                      value={editingRoute.name}
                      onChange={(e) => setEditingRoute({ ...editingRoute, name: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">Route Code *</label>
                    <input
                      type="text"
                      value={editingRoute.code}
                      onChange={(e) => setEditingRoute({ ...editingRoute, code: e.target.value.toUpperCase() })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">Start Point *</label>
                    <input
                      type="text"
                      value={editingRoute.startPoint}
                      onChange={(e) => setEditingRoute({ ...editingRoute, startPoint: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">End Point *</label>
                    <input
                      type="text"
                      value={editingRoute.endPoint}
                      onChange={(e) => setEditingRoute({ ...editingRoute, endPoint: e.target.value })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">Number of Stops *</label>
                    <input
                      type="number"
                      min="1"
                      value={editingRoute.stops}
                      onChange={(e) => setEditingRoute({ ...editingRoute, stops: parseInt(e.target.value) || 0 })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">Distance (Km) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editingRoute.distance}
                      onChange={(e) => setEditingRoute({ ...editingRoute, distance: parseFloat(e.target.value) || 0 })}
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">
                    Assigned Buses (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={Array.isArray(editingRoute.buses) ? editingRoute.buses.join(", ") : editingRoute.buses}
                    onChange={(e) => setEditingRoute({ ...editingRoute, buses: e.target.value })}
                    className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-550 uppercase tracking-wide mb-1.5">Status</label>
                  <div className="flex gap-4">
                    {["Active", "Inactive", "Archived"].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm font-bold text-slate-700 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="edit-status"
                          checked={editingRoute.status === opt}
                          onChange={() => setEditingRoute({ ...editingRoute, status: opt })}
                          className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingRoute(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
