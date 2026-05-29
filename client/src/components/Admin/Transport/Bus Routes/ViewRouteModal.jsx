import React from "react";
import { X, Navigation } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ViewRouteModal({ viewRoute, onClose }) {
  return (
    <AnimatePresence>
      {viewRoute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100/50 flex items-center justify-center text-blue-600">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-850">{viewRoute.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                    {viewRoute.code} Details
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-150 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[350px] space-y-5">
              {/* Summary Grid */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50/60 p-4 border border-slate-100 rounded-2xl text-center">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Stops</span>
                  <span className="text-lg font-black text-slate-800 block mt-1">{viewRoute.stops} Stations</span>
                </div>
                <div className="border-x border-slate-200/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distance</span>
                  <span className="text-lg font-black text-slate-800 block mt-1">{viewRoute.distance} Km</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buses</span>
                  <span className="text-lg font-black text-blue-600 block mt-1">
                    {viewRoute.buses.length > 0 ? viewRoute.buses.join(", ") : "None"}
                  </span>
                </div>
              </div>

              {/* Stops Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Route Stop Timeline</h4>
                <div className="relative pl-7 space-y-6">
                  <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-indigo-100" />

                  {/* Start */}
                  <div className="relative">
                    <div className="absolute left-[-23px] top-0.5 w-[20px] h-[20px] rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-800">Start: {viewRoute.startPoint}</h5>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Departs: 07:15 AM</p>
                    </div>
                  </div>

                  {/* Intermediate Stops */}
                  {Array.from({ length: Math.max(1, viewRoute.stops - 2) }).map((_, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute left-[-23px] top-0.5 w-[20px] h-[20px] rounded-full bg-indigo-50 border-2 border-indigo-300 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-700">Intermediate Stop #{idx + 1}</h5>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">Estimated dropoff / boarding</p>
                      </div>
                    </div>
                  ))}

                  {/* End */}
                  <div className="relative">
                    <div className="absolute left-[-23px] top-0.5 w-[20px] h-[20px] rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    </div>
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-800">Destination: {viewRoute.endPoint}</h5>
                      <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Arrival at School Terminal: 08:00 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-bold text-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
