import React, { useState, useEffect } from "react";
import {
  Search, ChevronDown, Tablet, Trash2, X,
  Bus, MapPin, Ruler, Calendar, RotateCcw,
} from "lucide-react";

export default function TransportFeeMain({
  activeRoute,
  selectedYearGlobal,
  stops = [],
  filteredStops = [],
  configSearch,
  setConfigSearch,
  configStatusFilter,
  setConfigStatusFilter,
  showFill,
  setShowFill,
  fillAmt,
  setFillAmt,
  configSelected = [],
  toggleSelect,
  toggleAll,
  handleFillSame,
  updateStop,
  deleteStop,
  deletingStopId = null,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [configSearch, configStatusFilter, stops.length]);

  const nonEndpointStops = filteredStops.filter(s => !s.isEndpoint);
  const totalStopsCount  = nonEndpointStops.length;
  const totalPages       = Math.ceil(totalStopsCount / itemsPerPage) || 1;
  const startIndex       = (currentPage - 1) * itemsPerPage;
  const endIndex         = Math.min(startIndex + itemsPerPage, totalStopsCount);
  const paginatedStops   = nonEndpointStops.slice(startIndex, endIndex);

  if (!activeRoute) return null;

  return (
    <div className="flex flex-col gap-3 flex-1">

      {/* ── Route Info Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {[
          {
            Icon: Bus,
            label: "Route Name",
            value: activeRoute.routeName,
            sub: `${activeRoute.startPoint} → ${activeRoute.endPoint}`,
            bg: "bg-[#eff6ff] border-[#dbeafe]",
            text: "text-[#2563eb]",
          },
          {
            Icon: MapPin,
            label: "Total Stops",
            value: String(stops.length),
            sub: "Stops on this route",
            bg: "bg-[#ecfdf5] border-[#d1fae5]",
            text: "text-[#10b981]",
          },
          {
            Icon: Ruler,
            label: "Distance",
            value: activeRoute.distance ?? "—",
            sub: "Total route distance",
            bg: "bg-[#fff7ed] border-[#ffedd5]",
            text: "text-[#f97316]",
          },
          {
            Icon: Calendar,
            label: "Academic Year",
            value: selectedYearGlobal,
            sub: "Current academic year",
            bg: "bg-[#faf5ff] border-[#f3e8ff]",
            text: "text-[#8b5cf6]",
          },
        ].map(({ Icon, label, value, sub, bg, text }) => (
          <div
            key={label}
            className="bg-white border border-[#f1f5f9] rounded-2xl p-5 flex items-center gap-5 hover:shadow-lg hover:shadow-slate-100/30 transition-all duration-300 group"
          >
            <div className={`w-14 h-14 rounded-[16px] ${bg} border flex items-center justify-center ${text} shrink-0 group-hover:scale-105 transition-all duration-300`}>
              <Icon className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-bold text-[#334155] leading-none block">{label}</span>
              <span className="text-[22px] font-extrabold text-[#0f172a] mt-1.5 block leading-none truncate" title={value}>
                {value}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-1.5 block leading-none truncate">
                {sub}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 flex-wrap">

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search stops..."
            value={configSearch}
            onChange={(e) => setConfigSearch(e.target.value)}
            className="pl-4 pr-10 py-2 text-[12.5px] border border-slate-200 rounded-lg outline-none focus:border-blue-300 w-48 bg-white text-slate-700 placeholder:text-slate-400 font-medium"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        <div className="flex-1" />

        {/* Status Filter */}
        <div className="relative">
          <select
            value={configStatusFilter}
            onChange={(e) => setConfigStatusFilter(e.target.value)}
            className="pl-3.5 pr-8 py-2 text-[12.5px] border border-slate-200 rounded-lg outline-none bg-white text-slate-600 appearance-none cursor-pointer font-semibold"
          >
            <option value="All Status">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Archived">Archived</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Fill Same Amount */}
        {showFill ? (
          <div className="flex items-center gap-2 bg-white border border-blue-300 rounded-lg px-3 py-1.5 shadow-sm">
            <span className="text-[12.5px] font-semibold text-slate-600">₹</span>
            <input
              type="number"
              placeholder="Amount"
              value={fillAmt}
              onChange={(e) => setFillAmt(e.target.value)}
              className="w-24 text-[12.5px] font-semibold text-slate-800 outline-none"
              autoFocus
            />
            <button
              onClick={handleFillSame}
              className="text-[11px] font-bold text-white bg-[#0061FF] px-3 py-1 rounded-md cursor-pointer"
            >
              Apply
            </button>
            <button
              onClick={() => { setShowFill(false); setFillAmt(""); }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowFill(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-[12.5px] text-blue-500 font-semibold bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Tablet className="w-4 h-4" />
            Fill Same Amount
          </button>
        )}

        {/* More Actions */}
        <button className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-lg text-[12.5px] text-slate-600 font-semibold bg-white hover:bg-slate-50 transition-colors cursor-pointer">
          More Actions
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col grow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="w-10 px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    nonEndpointStops.length > 0 &&
                    nonEndpointStops.every(s => configSelected.includes(s.id))
                  }
                  onChange={toggleAll}
                  className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                />
              </th>
              <th className="w-8 px-2 py-3 text-left text-[12px] font-semibold text-slate-500">#</th>
              <th className="text-left px-3 py-3 text-[12px] font-semibold text-slate-500">Stop / Drop Point</th>
              <th className="text-left px-3 py-3 text-[12px] font-semibold text-slate-500">
                Amount (₹) <span className="text-red-400">*</span>
              </th>
              <th className="text-left px-3 py-3 text-[12px] font-semibold text-slate-500">
                Frequency <span className="text-red-400">*</span>
              </th>
              <th className="text-left px-3 py-3 text-[12px] font-semibold text-slate-500">
                Status <span className="text-red-400">*</span>
              </th>
              <th className="text-right pr-6 py-3 text-[12px] font-semibold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedStops.map((stop, index) => {
              const missing  = stop.amount === "" && stop.status === "Active";
              const inactive = stop.status === "Inactive" || stop.status === "Archived";
              const isDeleting = deletingStopId === stop.id;

              return (
                <tr
                  key={stop.id}
                  className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-all ${
                    isDeleting ? "opacity-50" :
                    missing    ? "bg-red-50/40 border-l-2 border-l-red-300" :
                    inactive   ? "bg-amber-50/40 border-l-2 border-l-amber-300" : ""
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      checked={configSelected.includes(stop.id)}
                      onChange={() => toggleSelect(stop.id)}
                      disabled={isDeleting}
                      className="w-3.5 h-3.5 accent-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>

                  {/* Row number */}
                  <td className="px-2 py-2.5 text-[12px] text-slate-400 font-medium">
                    {startIndex + index + 1}
                  </td>

                  {/* Stop Name */}
                  <td className="px-3 py-2.5 text-[13px] text-slate-700 font-medium">
                    {stop.name}
                  </td>

                  {/* Amount */}
                  <td className="px-3 py-2.5">
                    <input
                      type="number"
                      value={stop.amount}
                      onChange={(e) => updateStop(stop.id, "amount", e.target.value)}
                      placeholder="Enter amount"
                      disabled={isDeleting}
                      className={`w-32 px-3 py-1.5 text-[12.5px] border rounded-lg outline-none transition-colors disabled:opacity-50 ${
                        missing
                          ? "border-red-300 placeholder:text-red-300 focus:border-red-400 bg-red-50/10"
                          : "border-slate-200 placeholder:text-slate-350 focus:border-blue-300 bg-white"
                      }`}
                    />
                  </td>

                  {/* Frequency */}
                  <td className="px-3 py-2.5">
                    <div className="relative w-32">
                      <select
                        value={stop.frequency}
                        onChange={(e) => updateStop(stop.id, "frequency", e.target.value)}
                        disabled={isDeleting}
                        className="w-full pl-3 pr-7 py-1.5 text-[12.5px] border border-slate-200 rounded-lg outline-none bg-white appearance-none cursor-pointer text-slate-700 font-medium disabled:opacity-50"
                      >
                        <option value="Monthly">Monthly</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Yearly">Yearly</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <div className="relative w-28">
                      <select
                        value={stop.status}
                        onChange={(e) => updateStop(stop.id, "status", e.target.value)}
                        disabled={isDeleting}
                        className={`w-full pl-3 pr-7 py-1.5 text-[12.5px] border rounded-lg outline-none bg-white appearance-none cursor-pointer font-medium disabled:opacity-50 ${
                          stop.status === "Active"
                            ? "text-green-700 border-green-200"
                            : "text-amber-500 border-amber-200"
                        }`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <ChevronDown
                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${
                          stop.status === "Active" ? "text-green-400" : "text-amber-400"
                        }`}
                      />
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5 text-right pr-6">
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => updateStop(stop.id, "amount", "")}
                        disabled={isDeleting}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reset Amount"
                      >
                        <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                      <button
                        onClick={() => deleteStop(stop.id)}
                        disabled={isDeleting}
                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Stop"
                      >
                        {isDeleting ? (
                          <svg className="w-3.5 h-3.5 animate-spin text-red-400" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:text-red-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty state */}
            {paginatedStops.length === 0 && (
              <tr>
                <td colSpan={7} className="py-14 text-center text-sm text-slate-400 font-semibold">
                  No stops match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer + Pagination ── */}
      <div className="flex items-center justify-between px-1 shrink-0 select-none mt-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[12px] text-slate-400 font-semibold">
            Showing {totalStopsCount > 0 ? startIndex + 1 : 0} to {endIndex} of {totalStopsCount} stops
          </span>
          <div className="flex items-center gap-3 ml-2 flex-wrap">
            {[
              { color: "bg-red-400",   label: "Not configured" },
              { color: "bg-amber-400", label: "Inactive"       },
              { color: "bg-green-500", label: "All good"       },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-400 uppercase tracking-wider">
                <span className={`w-2 h-2 rounded-full ${color} inline-block`} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center cursor-pointer font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`h-7 w-7 rounded-lg flex items-center justify-center cursor-pointer font-bold text-xs transition-all ${
                  currentPage === page
                    ? "bg-[#0061FF] text-white shadow-sm"
                    : "border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="h-7 w-7 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 flex items-center justify-center cursor-pointer font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

    </div>
  );
}