import React, { useState } from "react";
import { User, Phone, MapPin, Star, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const initialDrivers = [
  { id: 1, name: "Amit Kumar", phone: "+91 98765 43210", license: "KA0320190012345", route: "Route A", experience: 8, rating: 4.8, status: "On Duty" },
  { id: 2, name: "Gurpreet Singh", phone: "+91 98765 54321", license: "KA0320180056789", route: "Route B", experience: 11, rating: 4.6, status: "On Duty" },
  { id: 3, name: "Ramesh Sen", phone: "+91 98765 65432", license: "KA0320150098765", route: "Route C", experience: 15, rating: 4.9, status: "Off Duty" },
  { id: 4, name: "Sunil Mehta", phone: "+91 98765 76543", license: "KA0320210023456", route: "Unassigned", experience: 3, rating: 4.2, status: "Available" },
];

const statusColors = {
  "On Duty": "bg-emerald-50 text-emerald-600 border-emerald-100",
  "Off Duty": "bg-slate-100 text-slate-500 border-slate-200",
  "Available": "bg-cyan-50 text-cyan-600 border-cyan-100",
};

export default function Drivers() {
  const [drivers, setDrivers] = useState(initialDrivers);

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Drivers</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">{drivers.length} drivers on record</p>
        </div>
        <button
          onClick={() => toast.info("Driver registration coming soon!")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Driver
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map(d => (
            <div key={d.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black text-base uppercase shrink-0">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800">{d.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ${statusColors[d.status]}`}>
                      {d.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => toast.info(`Edit driver ${d.name}`)} className="p-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 border border-slate-100 transition-all cursor-pointer">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => { setDrivers(ds => ds.filter(x => x.id !== d.id)); toast.success("Driver removed."); }} className="p-1.5 rounded-lg bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-100 transition-all cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="font-semibold">{d.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="font-semibold">{d.route}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="font-semibold">License: <span className="font-mono text-slate-700">{d.license}</span></span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400">{d.experience} yrs experience</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-sm font-black text-slate-700">{d.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
