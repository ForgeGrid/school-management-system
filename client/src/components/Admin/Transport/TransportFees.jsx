import React, { useState } from "react";
import { DollarSign, CheckCircle, Clock, Plus } from "lucide-react";
import { toast } from "sonner";

const feeData = [
  { id: 1, student: "Aarav Sharma", route: "Route A", amount: 1200, month: "May 2026", status: "Paid", method: "UPI" },
  { id: 2, student: "Diya Patel", route: "Route B", amount: 1000, month: "May 2026", status: "Paid", method: "Cash" },
  { id: 3, student: "Kabir Singh", route: "Route C", amount: 1200, month: "May 2026", status: "Pending", method: "—" },
  { id: 4, student: "Ananya Rao", route: "Route A", amount: 1200, month: "April 2026", status: "Paid", method: "Net Banking" },
  { id: 5, student: "Rohan Gupta", route: "Route B", amount: 1000, month: "April 2026", status: "Overdue", method: "—" },
];

export default function TransportFees() {
  const [records] = useState(feeData);

  const totalCollected = records.filter(r => r.status === "Paid").reduce((s, r) => s + r.amount, 0);
  const totalPending = records.filter(r => r.status !== "Paid").reduce((s, r) => s + r.amount, 0);

  return (
    <div className="h-full flex flex-col gap-5 overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Transport Fees</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Track and manage student transport billing</p>
        </div>
        <button
          onClick={() => toast.info("New fee record coming soon!")}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Record
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 shrink-0">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Total Collected</span>
          <span className="text-3xl font-black text-slate-800">₹{totalCollected.toLocaleString()}</span>
          <div className="absolute right-4 bottom-4 p-2 bg-emerald-50 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Pending / Overdue</span>
          <span className="text-3xl font-black text-slate-800">₹{totalPending.toLocaleString()}</span>
          <div className="absolute right-4 bottom-4 p-2 bg-amber-50 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <Clock className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-y-auto h-full">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr>
                {["Student", "Route", "Month", "Amount", "Method", "Status"].map(h => (
                  <th key={h} className="text-left text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors group">
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{r.student}</td>
                  <td className="px-5 py-3.5 text-slate-500">{r.route}</td>
                  <td className="px-5 py-3.5 text-slate-500">{r.month}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-800">₹{r.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-slate-500">{r.method}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.status === "Paid" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                      r.status === "Overdue" ? "bg-red-50 text-red-500 border border-red-100" :
                      "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>{r.status}</span>
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
