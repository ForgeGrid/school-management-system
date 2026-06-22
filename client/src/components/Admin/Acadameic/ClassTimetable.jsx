import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Printer } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PERIODS = [
  { label: "Period 1", time: "08:30 AM - 09:15 AM" },
  { label: "Period 2", time: "09:15 AM - 10:00 AM" },
  { label: "Period 3", time: "10:15 AM - 11:00 AM" },
  { label: "Period 4", time: "11:00 AM - 11:45 AM" },
  { label: "Period 5", time: "12:30 PM - 01:15 PM" },
  { label: "Period 6", time: "01:15 PM - 02:00 PM" },
  { label: "Period 7", time: "02:15 PM - 03:00 PM" },
];

const SUBJECT_COLORS = {
  English:         "bg-blue-50 text-blue-700",
  Maths:           "bg-emerald-50 text-emerald-700",
  Science:         "bg-purple-50 text-purple-700",
  Hindi:           "bg-amber-50 text-amber-700",
  "Social Science":"bg-rose-50 text-rose-700",
  Computer:        "bg-orange-50 text-orange-700",
  Art:             "bg-pink-50 text-pink-700",
  "Physical Education": "bg-cyan-50 text-cyan-700",
  Library:         "bg-teal-50 text-teal-700",
};

const MOCK_TIMETABLE = {
  Monday:    ["English|Priya N", "Maths|Rahul K", "Science|Karthik M", "Hindi|Priya N", "Social Science|Divya S", "Computer|Vijay P", null],
  Tuesday:   ["Maths|Rahul K", "Science|Karthik M", "English|Priya N", "Hindi|Priya N", "Computer|Vijay P", "Art|Meena R", null],
  Wednesday: ["Science|Karthik M", "Maths|Rahul K", "Social Science|Divya S", "English|Priya N", "Hindi|Priya N", "Physical Education|Arun S", null],
  Thursday:  ["Hindi|Priya N", "English|Priya N", "Maths|Rahul K", "Science|Karthik M", "Computer|Vijay P", "Library|Sangeetha L", null],
  Friday:    ["Social Science|Divya S", "Hindi|Priya N", "English|Priya N", "Maths|Rahul K", "Science|Karthik M", "Art|Meena R", null],
  Saturday:  ["Computer|Vijay P", "Physical Education|Arun S", "Social Science|Divya S", null, null, null, null],
};

export function Timetable({ timetable = MOCK_TIMETABLE, weekLabel = "09 Jun – 15 Jun 2025" }) {
  const [periodFilter, setPeriodFilter] = useState("All Periods");

  const visiblePeriods =
    periodFilter === "All Periods"
      ? PERIODS
      : PERIODS.filter((p) => p.label === periodFilter);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">Class Timetable</h3>
        <div className="flex items-center gap-2">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
          >
            <option>All Periods</option>
            {PERIODS.map((p) => (
              <option key={p.label}>{p.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-1 py-1">
            <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-slate-600 px-1">{weekLabel}</span>
            <button className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="text-left px-4 py-3 bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wide w-32 sticky left-0">
                Day / Period
              </th>
              {visiblePeriods.map((p) => (
                <th key={p.label} className="text-left px-4 py-3 bg-slate-50/80 min-w-[130px]">
                  <p className="text-xs font-bold text-slate-600">{p.label}</p>
                  <p className="text-[10px] font-medium text-slate-400 mt-0.5">{p.time}</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day} className="border-t border-slate-100">
                <td className="px-4 py-3 font-bold text-slate-600 bg-white sticky left-0">{day}</td>
                {visiblePeriods.map((p, idx) => {
                  const periodIndex = PERIODS.findIndex((pp) => pp.label === p.label);
                  const cell = timetable[day]?.[periodIndex];
                  if (!cell) {
                    return (
                      <td key={p.label} className="px-2 py-2 text-center text-slate-300">
                        –
                      </td>
                    );
                  }
                  const [subject, teacher] = cell.split("|");
                  const colorClass = SUBJECT_COLORS[subject] || "bg-slate-50 text-slate-600";
                  return (
                    <td key={p.label} className="px-2 py-2">
                      <div className={`rounded-lg px-2.5 py-2 ${colorClass}`}>
                        <p className="text-xs font-bold leading-tight">{subject}</p>
                        <p className="text-[11px] font-medium opacity-75 leading-tight mt-0.5">{teacher}</p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Timetable;
