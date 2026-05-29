import React from "react";
import {
  AlertTriangle,
  Bus,
  Calendar,
  CheckCircle2,
  Clock,
  Ban,
  IndianRupee,
} from "lucide-react";

export default function TransportFeeSidebar({
  activeRoute,
  selectedYearGlobal,
  midStops = [],
  feesConfigured = 0,
  remainingCount = 0,
  inactiveCount = 0,
  estimatedTotal = 0,
  saved = true,
}) {
  // Guard — parent may render before route is resolved
  if (!activeRoute) return null;

  const hasUpdatedStops = remainingCount > 0;
  const totalStops = midStops.length;
  const configPct = totalStops > 0 ? Math.round((feesConfigured / totalStops) * 100) : 0;

  return (
    <div className="w-full shrink-0 flex flex-col gap-4">

      {/* ── Route & Fee Summary Card ── */}
      <div className="bg-white border border-[#f1f5f9] rounded-2xl p-5 shadow-sm">
        <h3 className="text-[14px] font-extrabold text-[#0f172a] tracking-[-0.02em] mb-4">
          Route &amp; Fee Summary
        </h3>

        {/* Route Info */}
        <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center shrink-0">
            <Bus className="w-5 h-5 text-[#2563eb] stroke-2" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Route Name
            </div>
            <div className="text-[13.5px] font-bold text-[#0f172a] truncate" title={activeRoute.routeName}>
              {activeRoute.routeName}
            </div>
          </div>
        </div>

        {/* Academic Year */}
        <div className="flex items-center gap-3.5 mb-4 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#faf5ff] border border-[#f3e8ff] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-[#8b5cf6] stroke-2" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
              Academic Year
            </div>
            <div className="text-[13.5px] font-bold text-[#0f172a]">
              {selectedYearGlobal}
            </div>
          </div>
        </div>

        {/* Stats Grid — matches main section card language */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            {
              label: "Total Stops",
              value: totalStops,
              bg: "bg-slate-50",
              border: "border-slate-100",
              labelColor: "text-slate-500",
              valueColor: "text-[#0f172a]",
              Icon: null,
            },
            {
              label: "Configured",
              value: feesConfigured,
              bg: "bg-[#ecfdf5]",
              border: "border-[#d1fae5]",
              labelColor: "text-emerald-600",
              valueColor: "text-emerald-700",
              Icon: CheckCircle2,
            },
            {
              label: "Remaining",
              value: remainingCount,
              bg: "bg-[#fff7ed]",
              border: "border-[#ffedd5]",
              labelColor: "text-orange-500",
              valueColor: "text-orange-600",
              Icon: Clock,
            },
            {
              label: "Inactive",
              value: inactiveCount,
              bg: "bg-slate-50",
              border: "border-slate-100",
              labelColor: "text-slate-400",
              valueColor: "text-slate-600",
              Icon: Ban,
            },
          ].map(({ label, value, bg, border, labelColor, valueColor, Icon }) => (
            <div key={label} className={`${bg} border ${border} rounded-xl p-3.5 group hover:shadow-sm transition-all duration-200`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${labelColor}`}>
                  {label}
                </span>
                {Icon && <Icon className={`w-3.5 h-3.5 ${labelColor} opacity-60`} />}
              </div>
              <div className={`text-[22px] font-extrabold leading-none ${valueColor}`}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Configuration Progress
            </span>
            <span className="text-[11px] font-extrabold text-[#0f172a]">{configPct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${configPct}%`,
                background: configPct === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : configPct > 0
                    ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                    : "#ef4444",
              }}
            />
          </div>
        </div>

        {/* Estimated Total */}
        <div className="border-t border-slate-100 pt-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Estimated Total (Monthly)
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff6ff] border border-[#dbeafe] flex items-center justify-center shrink-0">
              <IndianRupee className="w-5 h-5 text-[#2563eb] stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[22px] font-extrabold text-[#0061FF] tracking-[-0.02em] leading-none block">
                ₹{estimatedTotal.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">
                Based on active fee rows only
              </span>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}