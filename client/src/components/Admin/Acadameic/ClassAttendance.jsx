import React, { useState, useMemo } from "react";
import { Pencil, MoreVertical, Calendar } from "lucide-react";

const MOCK_ATTENDANCE = [
  { id: 1, name: "Aarav Sharma", roll: "01", status: "Present", markedAt: "08:35 AM", remarks: "–", avatar: "https://i.pravatar.cc/64?img=12" },
  { id: 2, name: "Ananya Singh", roll: "02", status: "Absent",  markedAt: "08:35 AM", remarks: "–", avatar: "https://i.pravatar.cc/64?img=47" },
  { id: 3, name: "Vihaan Patel", roll: "03", status: "Present", markedAt: "08:35 AM", remarks: "–", avatar: "https://i.pravatar.cc/64?img=33" },
  { id: 4, name: "Myra Iyer",    roll: "04", status: "Late",    markedAt: "09:05 AM", remarks: "Reached late", avatar: "https://i.pravatar.cc/64?img=45" },
  { id: 5, name: "Arjun Kumar",  roll: "05", status: "Present", markedAt: "08:34 AM", remarks: "–", avatar: "https://i.pravatar.cc/64?img=14" },
  { id: 6, name: "Siya Reddy",   roll: "06", status: "Present", markedAt: "08:33 AM", remarks: "–", avatar: "https://i.pravatar.cc/64?img=49" },
  { id: 7, name: "Krish Mehta",  roll: "07", status: "Absent",  markedAt: "08:35 AM", remarks: "Sick leave", avatar: "https://i.pravatar.cc/64?img=15" },
  { id: 8, name: "Aadhya Nair",  roll: "08", status: "Present", markedAt: "08:35 AM", remarks: "–", avatar: "https://i.pravatar.cc/64?img=44" },
];

const STATUS_STYLES = {
  Present: "bg-emerald-50 text-emerald-600",
  Absent:  "bg-rose-50 text-rose-600",
  Late:    "bg-amber-50 text-amber-600",
};

const DOT_STYLES = {
  Present: "bg-emerald-500",
  Absent:  "bg-rose-500",
  Late:    "bg-amber-500",
};

function Donut({ present, absent, late }) {
  const total = present + absent + late || 1;
  const r = 40;
  const c = 2 * Math.PI * r;
  const segs = [
    { value: present, color: "#10b981" },
    { value: absent, color: "#ef4444" },
    { value: late, color: "#f59e0b" },
  ];
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="14" />
      {segs.map((s, i) => {
        const len = (s.value / total) * c;
        const dash = `${len} ${c - len}`;
        const circle = (
          <circle
            key={i}
            cx="50" cy="50" r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="14"
            strokeDasharray={dash}
            strokeDashoffset={-offset}
            strokeLinecap="round"
          />
        );
        offset += len;
        return circle;
      })}
    </svg>
  );
}

export function Attendance({ records = MOCK_ATTENDANCE, date = "Today, 10 Jun 2025" }) {
  const [rows] = useState(records);

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === "Present").length;
    const absent = rows.filter((r) => r.status === "Absent").length;
    const late = rows.filter((r) => r.status === "Late").length;
    const total = rows.length;
    const pct = total ? Math.round((present / total) * 1000) / 10 : 0;
    return { present, absent, late, total, pct };
  }, [rows]);

  return (
    <div className="flex flex-col gap-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-base font-bold text-slate-800">Attendance</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg bg-white">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {date}
          </div>
          <button className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Pencil className="w-3.5 h-3.5" />
            Mark Attendance
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-4">
          Attendance Summary ({date.split(",")[0]})
        </p>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-5">
            <Donut present={summary.present} absent={summary.absent} late={summary.late} />
            <div className="flex flex-col gap-1.5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-500">Present</span>
                <span className="font-bold text-slate-700">{summary.present} ({summary.total ? Math.round((summary.present/summary.total)*1000)/10 : 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-500">Absent</span>
                <span className="font-bold text-slate-700">{summary.absent} ({summary.total ? Math.round((summary.absent/summary.total)*1000)/10 : 0}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-500">Late</span>
                <span className="font-bold text-slate-700">{summary.late} ({summary.total ? Math.round((summary.late/summary.total)*1000)/10 : 0}%)</span>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-px h-16 bg-slate-100" />

          <div className="flex flex-1 justify-around w-full md:w-auto">
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1">Total Students</p>
              <p className="text-xl font-extrabold text-slate-800">{summary.total}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1">Present</p>
              <p className="text-xl font-extrabold text-emerald-600">{summary.present}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1">Absent</p>
              <p className="text-xl font-extrabold text-rose-600">{summary.absent}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1">Late</p>
              <p className="text-xl font-extrabold text-amber-600">{summary.late}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 font-semibold mb-1">Attendance %</p>
              <p className="text-xl font-extrabold text-emerald-600">{summary.pct}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wide">
                <th className="text-left px-5 py-3 w-10">#</th>
                <th className="text-left px-3 py-3">Student</th>
                <th className="text-left px-3 py-3">Roll No.</th>
                <th className="text-left px-3 py-3">Status</th>
                <th className="text-left px-3 py-3">Marked At</th>
                <th className="text-left px-3 py-3">Remarks</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className="border-t border-slate-100 hover:bg-indigo-50/30 transition-colors">
                  <td className="px-5 py-3 text-slate-400 font-medium">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2.5">
                      <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      <span className="font-semibold text-slate-700">{r.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{r.roll}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${DOT_STYLES[r.status]}`} />
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{r.markedAt}</td>
                  <td className="px-3 py-3 text-slate-400">{r.remarks}</td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
