import React, { useState } from "react";
import { Search, ChevronDown, SlidersHorizontal, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  onResetFilters,
}) {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const handleReset = () => {
    onResetFilters();
    toast.info("All search filters and sorting parameters have been reset.");
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 mt-2">

      {/* Search Field */}
      <div className="relative flex-1 max-w-md">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400 stroke-[2.5]" />
        </span>
        <input
          type="text"
          placeholder="Search routes by name, start point, or end point..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-2xs hover:border-slate-350 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all outline-none"
        />
      </div>

      {/* Dropdowns */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Status Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setStatusDropdownOpen(!statusDropdownOpen); setSortDropdownOpen(false); }}
            className="flex items-center gap-2 border border-slate-200/80 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition-all cursor-pointer select-none"
          >
            <span>Status: <span className="text-blue-600 font-extrabold">{statusFilter}</span></span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {statusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-48 bg-white border border-slate-150 rounded-xl shadow-xl z-20 overflow-hidden py-1.5"
                >
                  {["All", "Active", "Inactive", "Archived"].map((status) => (
                    <button
                      key={status}
                      onClick={() => { setStatusFilter(status); setStatusDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all flex items-center justify-between ${
                        statusFilter === status
                          ? "bg-blue-50/80 text-blue-600"
                          : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {status}
                      {statusFilter === status && <CheckCircle className="w-3.5 h-3.5 fill-current text-blue-600" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setStatusDropdownOpen(false); }}
            className="flex items-center gap-2 border border-slate-200/80 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition-all cursor-pointer select-none"
          >
            <span>Sort: <span className="text-blue-600 font-extrabold">{sortBy}</span></span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${sortDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {sortDropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-slate-150 rounded-xl shadow-xl z-20 overflow-hidden py-1.5"
                >
                  {["Newest", "Oldest", "Stops (High)", "Distance (High)", "Name A-Z"].map((sortOption) => (
                    <button
                      key={sortOption}
                      onClick={() => { setSortBy(sortOption); setSortDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-semibold transition-all flex items-center justify-between ${
                        sortBy === sortOption
                          ? "bg-blue-50/80 text-blue-600"
                          : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {sortOption}
                      {sortBy === sortOption && <CheckCircle className="w-3.5 h-3.5 fill-current text-blue-600" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Reset Filters Button */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 border border-slate-200/80 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
          title="Reset Filters"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400 stroke-[2.5]" />
          <span>Filters</span>
        </button>
      </div>
    </div>
  );
}
