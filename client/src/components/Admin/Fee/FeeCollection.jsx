import React, { useState, useMemo } from "react";
import {
  Search, ChevronDown, Download, Plus, ArrowUpDown,
  Users, AlertCircle, Clock, DollarSign, Eye, Edit2, Trash2
} from "lucide-react";

const FontStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    .fee-coll * { font-family: 'Plus Jakarta Sans', sans-serif; box-sizing: border-box; }
  `}</style>
);

const RECORDS = [
  { id: "FEE-001", student: "Aarav Sharma",  class: "Grade 10-A", rollNo: "1001", feeType: "Tuition Fee",  amount: 12000, paid: 12000, balance: 0,     dueDate: "2025-07-01", status: "Paid"    },
  { id: "FEE-002", student: "Diya Patel",    class: "Grade 12-B", rollNo: "1205", feeType: "Tuition Fee",  amount: 14000, paid: 7000,  balance: 7000,  dueDate: "2025-07-01", status: "Partial" },
  { id: "FEE-003", student: "Kabir Singh",   class: "Grade 9-C",  rollNo: "0912", feeType: "Exam Fee",     amount: 3000,  paid: 0,     balance: 3000,  dueDate: "2025-06-25", status: "Overdue" },
  { id: "FEE-004", student: "Ananya Rao",    class: "Grade 11-A", rollNo: "1103", feeType: "Lab Fee",      amount: 5000,  paid: 5000,  balance: 0,     dueDate: "2025-07-05", status: "Paid"    },
  { id: "FEE-005", student: "Rohan Gupta",   class: "Grade 10-B", rollNo: "1014", feeType: "Tuition Fee",  amount: 12000, paid: 0,     balance: 12000, dueDate: "2025-08-01", status: "Pending" },
  { id: "FEE-006", student: "Meera Reddy",   class: "Grade 8-A",  rollNo: "0803", feeType: "Sports Fee",   amount: 2000,  paid: 2000,  balance: 0,     dueDate: "2025-07-10", status: "Paid"    },
  { id: "FEE-007", student: "Arjun Nair",    class: "Grade 12-A", rollNo: "1201", feeType: "Tuition Fee",  amount: 14000, paid: 0,     balance: 14000, dueDate: "2025-06-20", status: "Overdue" },
  { id: "FEE-008", student: "Priya Verma",   class: "Grade 9-A",  rollNo: "0901", feeType: "Library Fee",  amount: 1500,  paid: 1500,  balance: 0,     dueDate: "2025-07-15", status: "Paid"    },
  { id: "FEE-009", student: "Dev Malhotra",  class: "Grade 11-B", rollNo: "1109", feeType: "Tuition Fee",  amount: 13000, paid: 6500,  balance: 6500,  dueDate: "2025-07-01", status: "Partial" },
  { id: "FEE-010", student: "Sana Khan",     class: "Grade 10-C", rollNo: "1023", feeType: "Exam Fee",     amount: 3000,  paid: 3000,  balance: 0,     dueDate: "2025-07-20", status: "Paid"    },
];

const SC = {
  Paid:    { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Partial: { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  Pending: { bg: "bg-slate-100",  text: "text-slate-600",   border: "border-slate-200",   dot: "bg-slate-400"   },
  Overdue: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
};

export default function FeeCollection() {
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatus] = useState("All Status");
  const [classFilter, setClass]   = useState("All Classes");
  const [sortBy, setSort]         = useState("Due Date");
  const [year, setYear]           = useState("2025 - 2026");

  const totalCollected = RECORDS.reduce((s, r) => s + r.paid, 0);
  const totalPending   = RECORDS.reduce((s, r) => s + r.balance, 0);
  const paidCount      = RECORDS.filter(r => r.status === "Paid").length;
  const overdueCount   = RECORDS.filter(r => r.status === "Overdue").length;

  const filtered = useMemo(() => RECORDS
    .filter(r => {
      const q = search.toLowerCase();
      return (r.student.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || r.rollNo.includes(q))
        && (statusFilter === "All Status" || r.status === statusFilter)
        && (classFilter  === "All Classes" || r.class.includes(classFilter));
    })
    .sort((a, b) => {
      if (sortBy === "Due Date") return new Date(a.dueDate) - new Date(b.dueDate);
      if (sortBy === "Amount")   return b.amount - a.amount;
      if (sortBy === "Name")     return a.student.localeCompare(b.student);
      return 0;
    }), [search, statusFilter, classFilter, sortBy]);

  const stats = [
    { label: "Total Collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, sub: `${paidCount} students paid`,            icon: DollarSign,  ibg: "bg-emerald-100", it: "text-emerald-600", vt: "text-emerald-700" },
    { label: "Pending Balance", value: `₹${totalPending.toLocaleString("en-IN")}`,   sub: `${RECORDS.length - paidCount} pending`, icon: Clock,       ibg: "bg-amber-100",   it: "text-amber-600",   vt: "text-amber-700"   },
    { label: "Overdue Records", value: overdueCount,                                  sub: "Past due date",                          icon: AlertCircle, ibg: "bg-red-100",     it: "text-red-500",     vt: "text-red-600"     },
    { label: "Total Students",  value: RECORDS.length,                                sub: `Academic year ${year}`,                  icon: Users,       ibg: "bg-blue-100",    it: "text-blue-600",    vt: "text-blue-700"    },
  ];

  return (
    <>
      <FontStyle />
      <div className="fee-coll flex flex-col h-full min-h-0 gap-4 text-slate-800">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Academic Fee Collection</h1>
            <p className="text-[12.5px] text-slate-500 font-medium mt-0.5">Manage and track all student fee payments</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="relative">
              <select value={year} onChange={e => setYear(e.target.value)} className="pl-3 pr-8 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[12px] rounded-xl outline-none cursor-pointer appearance-none">
                <option>2025 - 2026</option><option>2024 - 2025</option><option>2026 - 2027</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-600 text-[12.5px] font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer shadow-sm">
              <Download className="w-4 h-4" /> Export
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-[#0061FF] text-white text-[12.5px] font-bold rounded-xl hover:bg-blue-700 transition-all cursor-pointer shadow-md shadow-blue-500/15">
              <Plus className="w-4 h-4" /> Add Record
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {stats.map(({ label, value, sub, icon: Icon, ibg, it, vt }) => (
            <div key={label} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-md hover:shadow-slate-100/60 transition-all">
              <div className={`w-12 h-12 rounded-xl ${ibg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${it} stroke-[2.2]`} />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
                <div className={`text-[20px] font-extrabold leading-none mt-0.5 ${vt}`}>{value}</div>
                <div className="text-[11px] text-slate-400 font-medium mt-1">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <input type="text" placeholder="Search student, ID, roll no..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-4 pr-10 py-2 text-[12.5px] border border-slate-200 rounded-xl outline-none focus:border-blue-300 w-60 bg-white text-slate-700 placeholder:text-slate-400 font-medium" />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {[["All Status","Paid","Partial","Pending","Overdue"], ["All Classes","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"]].map((opts, i) => (
            <div key={i} className="relative">
              <select value={i === 0 ? statusFilter : classFilter} onChange={e => i === 0 ? setStatus(e.target.value) : setClass(e.target.value)}
                className="pl-3.5 pr-8 py-2 text-[12.5px] border border-slate-200 rounded-xl outline-none bg-white text-slate-600 appearance-none cursor-pointer font-semibold">
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          ))}
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-[12px] text-slate-500 font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            <select value={sortBy} onChange={e => setSort(e.target.value)} className="border-0 outline-none bg-transparent text-[12px] font-bold text-slate-700 cursor-pointer">
              <option>Due Date</option><option>Amount</option><option>Name</option>
            </select>
          </div>
          <span className="text-[12px] text-slate-400 font-semibold">{filtered.length} records</span>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex-1 min-h-0 flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm">
                  {["Fee ID","Student","Class","Fee Type","Amount","Paid","Balance","Due Date","Status","Actions"].map((h, i) => (
                    <th key={h} className={`px-4 py-3.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wide ${i >= 4 && i <= 6 ? "text-right" : i === 9 ? "text-right pr-5" : "text-left"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(rec => {
                  const sc = SC[rec.status] || SC.Pending;
                  const initials = rec.student.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <tr key={rec.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-3.5 text-[12px] font-bold text-slate-500">{rec.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-[11px] font-extrabold text-indigo-700 shrink-0">{initials}</div>
                          <div>
                            <div className="text-[13px] font-bold text-slate-800 leading-none">{rec.student}</div>
                            <div className="text-[11px] text-slate-400 font-medium mt-0.5">#{rec.rollNo}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-[12.5px] text-slate-600 font-medium">{rec.class}</td>
                      <td className="px-4 py-3.5"><span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-[11.5px] font-semibold">{rec.feeType}</span></td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-slate-800">₹{rec.amount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-emerald-600">₹{rec.paid.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3.5 text-right text-[13px] font-bold text-red-500">{rec.balance > 0 ? `₹${rec.balance.toLocaleString("en-IN")}` : "—"}</td>
                      <td className="px-4 py-3.5 text-[12px] text-slate-500 font-medium">{rec.dueDate}</td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right pr-5">
                        <div className="flex items-center gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          {[Eye, Edit2, Trash2].map((Icon, i) => (
                            <button key={i} className={`w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 transition-colors cursor-pointer ${i === 2 ? "hover:bg-red-50 hover:text-red-500" : "hover:bg-slate-50 hover:text-slate-600"}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Search className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-[14px] font-semibold">No records found</p>
                <p className="text-[12px] font-medium mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <span className="text-[12px] text-slate-400 font-semibold">
            {filtered.length} of {RECORDS.length} records · {year}
          </span>
          <div className="flex items-center gap-4">
            {Object.entries(SC).map(([s, c]) => (
              <span key={s} className="flex items-center gap-1.5 text-[11.5px] font-semibold text-slate-400">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />{s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}