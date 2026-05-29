import React, { useState } from "react";
import {
  Download, FileText, ChevronDown, DollarSign,
  CheckCircle2, AlertCircle, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .fee-rep * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
    .fee-bar { transition: width 0.8s cubic-bezier(0.4,0,0.2,1); }
  `}</style>
);

const MONTHLY_DATA = [
  { month: "Jan", collected: 420000, pending: 80000 },
  { month: "Feb", collected: 390000, pending: 110000 },
  { month: "Mar", collected: 510000, pending: 60000 },
  { month: "Apr", collected: 480000, pending: 70000 },
  { month: "May", collected: 560000, pending: 40000 },
  { month: "Jun", collected: 620000, pending: 30000 },
  { month: "Jul", collected: 590000, pending: 50000 },
];

const FEE_BREAKDOWN = [
  { type: "Tuition Fee", total: 2800000, collected: 2520000, percent: 90, color: "#6366f1" },
  { type: "Exam Fee",    total: 240000,  collected: 180000,  percent: 75, color: "#f97316" },
  { type: "Lab Fee",     total: 160000,  collected: 140000,  percent: 87, color: "#10b981" },
  { type: "Sports Fee",  total: 120000,  collected: 108000,  percent: 90, color: "#f59e0b" },
  { type: "Library Fee", total: 80000,   collected: 72000,   percent: 90, color: "#3b82f6" },
];

const CLASS_SUMMARY = [
  { grade: "Grade 8",  students: 120, totalFee: 1440000, collected: 1296000, percent: 90 },
  { grade: "Grade 9",  students: 130, totalFee: 1560000, collected: 1326000, percent: 85 },
  { grade: "Grade 10", students: 140, totalFee: 1680000, collected: 1428000, percent: 85 },
  { grade: "Grade 11", students: 110, totalFee: 1540000, collected: 1309000, percent: 85 },
  { grade: "Grade 12", students: 100, totalFee: 1400000, collected: 1260000, percent: 90 },
];

const maxMonthly = Math.max(...MONTHLY_DATA.map(d => d.collected + d.pending));

export default function FeeReports() {
  const [year, setYear]     = useState("2025 - 2026");
  const [period, setPeriod] = useState("This Year");

  const totalFee       = FEE_BREAKDOWN.reduce((s, f) => s + f.total, 0);
  const totalCollected = FEE_BREAKDOWN.reduce((s, f) => s + f.collected, 0);
  const totalPending   = totalFee - totalCollected;
  const collectionPct  = Math.round((totalCollected / totalFee) * 100);

  const kpis = [
    { label: "Total Fees Billed",    value: `₹${(totalFee / 100000).toFixed(1)}L`,       sub: "Across all categories",          icon: DollarSign,   ibg: "bg-blue-100",    it: "text-blue-600",    vt: "text-blue-700",    trend: "+8%",  up: true  },
    { label: "Amount Collected",     value: `₹${(totalCollected / 100000).toFixed(1)}L`, sub: `${collectionPct}% collection rate`, icon: CheckCircle2, ibg: "bg-emerald-100", it: "text-emerald-600", vt: "text-emerald-700", trend: "+12%", up: true  },
    { label: "Pending Amount",       value: `₹${(totalPending / 100000).toFixed(1)}L`,   sub: "Yet to be collected",            icon: Clock,        ibg: "bg-amber-100",   it: "text-amber-600",   vt: "text-amber-700",   trend: "-5%",  up: false },
    { label: "Overdue / Defaulters", value: "23",                                         sub: "Students with overdue fees",    icon: AlertCircle,  ibg: "bg-red-100",     it: "text-red-500",     vt: "text-red-600",     trend: "-3",   up: false },
  ];

  return (
    <>
      <FontStyle />
      <div className="fee-rep flex flex-col h-full min-h-0 gap-4 text-slate-800 overflow-y-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Fee Reports & Analytics</h1>
            <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Comprehensive fee collection insights and trends</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <select value={year} onChange={e => setYear(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[12px] rounded-xl outline-none cursor-pointer appearance-none">
                <option>2025 - 2026</option><option>2024 - 2025</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={period} onChange={e => setPeriod(e.target.value)}
                className="pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[12px] rounded-xl outline-none cursor-pointer appearance-none">
                <option>This Year</option><option>This Term</option><option>This Month</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-600 text-[12.5px] font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
              <Download className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {kpis.map(({ label, value, sub, icon: Icon, ibg, it, vt, trend, up }) => (
            <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md hover:shadow-slate-100/60 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${ibg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${it} stroke-[2.2]`} />
                </div>
                <span className={`flex items-center gap-0.5 text-[11.5px] font-bold px-2 py-0.5 rounded-full ${up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                  {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{trend}
                </span>
              </div>
              <div className={`text-[20px] font-extrabold leading-none ${vt}`}>{value}</div>
              <div className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wide mt-2">{label}</div>
              <div className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 shrink-0">

          {/* Monthly bar chart */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-bold text-slate-800">Monthly Collection Trend</h3>
                <p className="text-[11.5px] text-slate-400 font-medium mt-0.5">Collected vs Pending per month</p>
              </div>
              <div className="flex items-center gap-3 text-[11.5px] font-semibold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />Collected</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-300 inline-block" />Pending</span>
              </div>
            </div>
            <div className="flex items-end gap-3 h-36">
              {MONTHLY_DATA.map(d => {
                const collPct = Math.round((d.collected / maxMonthly) * 100);
                const pendPct = Math.round((d.pending   / maxMonthly) * 100);
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col justify-end gap-0.5" style={{ height: "120px" }}>
                      <div className="fee-bar w-full bg-amber-200 rounded-t-sm" style={{ height: `${pendPct}%` }} />
                      <div className="fee-bar w-full bg-indigo-500 rounded-t-sm" style={{ height: `${collPct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection rate donut */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col">
            <h3 className="text-[14px] font-bold text-slate-800 mb-1">Overall Collection Rate</h3>
            <p className="text-[11.5px] text-slate-400 font-medium mb-5">Year {year}</p>
            <div className="flex flex-col items-center flex-1 justify-center gap-4">
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#6366f1" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 40 * collectionPct / 100} ${2 * Math.PI * 40}`}
                    strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[24px] font-extrabold text-indigo-600 leading-none">{collectionPct}%</span>
                  <span className="text-[10px] font-semibold text-slate-400 mt-0.5">Collected</span>
                </div>
              </div>
              <div className="w-full space-y-2">
                <div className="flex justify-between text-[12px] font-semibold">
                  <span className="text-slate-500">Collected</span>
                  <span className="text-indigo-600 font-bold">₹{(totalCollected / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between text-[12px] font-semibold">
                  <span className="text-slate-500">Pending</span>
                  <span className="text-amber-500 font-bold">₹{(totalPending / 100000).toFixed(1)}L</span>
                </div>
                <div className="flex justify-between text-[12px] font-semibold">
                  <span className="text-slate-500">Total Billed</span>
                  <span className="text-slate-700 font-bold">₹{(totalFee / 100000).toFixed(1)}L</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee type breakdown */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm shrink-0">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4">Fee Type Breakdown</h3>
          <div className="space-y-3">
            {FEE_BREAKDOWN.map(f => (
              <div key={f.type} className="flex items-center gap-4">
                <div className="w-28 text-[12px] font-semibold text-slate-600 shrink-0">{f.type}</div>
                <div className="flex-1 h-6 bg-slate-100 rounded-full overflow-hidden">
                  <div className="fee-bar h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${f.percent}%`, backgroundColor: f.color }}>
                    <span className="text-[10px] font-bold text-white">{f.percent}%</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12.5px] font-bold text-slate-700">₹{(f.collected / 100000).toFixed(1)}L</div>
                  <div className="text-[10.5px] text-slate-400 font-medium">of ₹{(f.total / 100000).toFixed(1)}L</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Class-wise summary table */}
        <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm shrink-0">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-slate-800">Class-wise Fee Summary</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-500 text-[12px] font-semibold rounded-lg hover:bg-slate-50 cursor-pointer">
              <FileText className="w-3.5 h-3.5" /> Full Report
            </button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                {["Class / Grade","Students","Total Fees","Collected","Pending","Collection %"].map(h => (
                  <th key={h} className="px-5 py-3 text-[11.5px] font-bold text-slate-500 uppercase tracking-wide text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASS_SUMMARY.map(c => {
                const pending = c.totalFee - c.collected;
                return (
                  <tr key={c.grade} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-3.5 text-[13px] font-bold text-slate-800">{c.grade}</td>
                    <td className="px-5 py-3.5 text-[12.5px] text-slate-600 font-medium">{c.students}</td>
                    <td className="px-5 py-3.5 text-[12.5px] font-bold text-slate-700">₹{(c.totalFee / 100000).toFixed(2)}L</td>
                    <td className="px-5 py-3.5 text-[12.5px] font-bold text-emerald-600">₹{(c.collected / 100000).toFixed(2)}L</td>
                    <td className="px-5 py-3.5 text-[12.5px] font-bold text-amber-500">₹{(pending / 100000).toFixed(2)}L</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${c.percent}%` }} />
                        </div>
                        <span className="text-[12px] font-bold text-indigo-600 shrink-0">{c.percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}