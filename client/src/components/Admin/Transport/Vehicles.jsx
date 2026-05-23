import React, { useState } from "react";
import { Truck, Plus, Pencil, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const initialVehicles = [
  { id: 1, regNo: "KA-09-1234", model: "Tata Starbus", capacity: 40, year: 2021, fuelType: "Diesel", lastService: "2026-04-10", status: "Active" },
  { id: 2, regNo: "KA-09-5678", model: "Ashok Leyland", capacity: 50, year: 2019, fuelType: "Diesel", lastService: "2026-03-22", status: "Active" },
  { id: 3, regNo: "KA-09-9012", model: "Force Traveller", capacity: 26, year: 2022, fuelType: "CNG", lastService: "2026-05-01", status: "In Service" },
  { id: 4, regNo: "KA-09-3456", model: "Eicher Skyline", capacity: 36, year: 2018, fuelType: "Diesel", lastService: "2026-02-14", status: "Needs Service" },
];

export default function Vehicles() {
  const [vehicles, setVehicles] = useState(initialVehicles);

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Vehicles</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{vehicles.length} vehicles in fleet</p>
        </div>
        <button
          onClick={() => toast.info("Vehicle registration coming soon!")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-1">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-1.5 h-full ${v.status === "Active" || v.status === "In Service" ? "bg-emerald-500" : "bg-amber-500"}`} />
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">{v.model}</h3>
                  <span className="text-xs text-slate-400 font-mono font-semibold">{v.regNo}</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => toast.info(`Editing ${v.regNo}`)} className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 border border-slate-100 transition-all cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => { setVehicles(vs => vs.filter(x => x.id !== v.id)); toast.success("Vehicle removed."); }} className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-100 transition-all cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3">
              {[
                { label: "Capacity", value: `${v.capacity} seats` },
                { label: "Fuel", value: v.fuelType },
                { label: "Year", value: v.year },
              ].map(d => (
                <div key={d.label} className="bg-slate-50 rounded-xl p-2.5 text-center border border-slate-100">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">{d.label}</span>
                  <span className="text-xs font-bold text-slate-700 mt-0.5 block">{d.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400">Last Service: <span className="text-slate-600">{v.lastService}</span></span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${v.status === "Needs Service" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"}`}>
                {v.status === "Needs Service" ? <AlertTriangle className="w-2.5 h-2.5" /> : <CheckCircle className="w-2.5 h-2.5" />}
                {v.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
