import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bus, MapPin, Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const initialRoutes = [
  { id: 1, name: "Route A", description: "City Center Loop", stops: ["School Gate", "Sector 12", "City Park", "Sector 15"], driver: "Amit Kumar", vehicle: "KA-09-1234", status: "Running" },
  { id: 2, name: "Route B", description: "North Suburbs", stops: ["School Gate", "Metro Gate 2", "North Crossing"], driver: "Gurpreet Singh", vehicle: "KA-09-5678", status: "Running" },
  { id: 3, name: "Route C", description: "South Campus Express", stops: ["School Gate", "Hospital Road", "South Terminal"], driver: "Ramesh Sen", vehicle: "KA-09-9012", status: "Stopped" },
];

export default function BusRoutes() {
  const [routes, setRoutes] = useState(initialRoutes);
  const [selected, setSelected] = useState(null);

  const handleDelete = (id) => {
    setRoutes(r => r.filter(x => x.id !== id));
    toast.success("Route removed.");
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Bus Routes</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{routes.length} routes configured</p>
        </div>
        <button
          onClick={() => toast.info("Route creator coming soon!")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Route
        </button>
      </div>

      <div className="flex-1 flex gap-5 overflow-hidden">
        {/* Route list */}
        <div className="w-64 flex flex-col gap-2.5 overflow-y-auto pr-1 shrink-0">
          {routes.map(route => (
            <motion.div
              key={route.id}
              whileHover={{ x: 3 }}
              onClick={() => setSelected(route)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${selected?.id === route.id ? "bg-indigo-50 border-indigo-200 shadow-sm" : "bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/40"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
                    <Bus className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-sm text-slate-800">{route.name}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 transition-colors ${selected?.id === route.id ? "text-indigo-600" : "text-slate-300"}`} />
              </div>
              <p className="text-xs text-slate-400 font-medium mt-1.5 ml-8">{route.description}</p>
              <span className={`ml-8 mt-2 inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${route.status === "Running" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500"}`}>
                {route.status}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Detail panel */}
        <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-y-auto">
          {selected ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">{selected.name}</h2>
                  <p className="text-sm text-slate-500 font-medium">{selected.description}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toast.info("Edit mode...")} className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 border border-slate-200 transition-all cursor-pointer">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-500 border border-slate-200 transition-all cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Driver</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selected.driver}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Vehicle Reg.</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selected.vehicle}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-600 mb-3 uppercase tracking-wider">Stops</h3>
                <div className="relative pl-5">
                  {selected.stops.map((stop, i) => (
                    <div key={stop} className="flex items-center gap-3 mb-3 relative">
                      {i < selected.stops.length - 1 && (
                        <div className="absolute left-[-10px] top-4 h-full border-l-2 border-dashed border-indigo-200" />
                      )}
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 z-10 ml-[-14px] ${i === 0 ? "bg-indigo-500" : i === selected.stops.length - 1 ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <span className="text-sm font-semibold text-slate-700">{stop}</span>
                      {i === 0 && <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">Start</span>}
                      {i === selected.stops.length - 1 && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">End</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 opacity-50">
              <MapPin className="w-10 h-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-400">Select a route to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
