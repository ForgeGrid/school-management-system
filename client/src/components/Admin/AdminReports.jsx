import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CheckCircle2,
  Wallet,
  Clock,
  BookOpen,
  RefreshCw,
  Search
} from "lucide-react";

export default function AdminReports() {
  const [activeSubTab, setActiveSubTab] = useState("Academic");
  const [selectedClass, setSelectedClass] = useState("All Grades");
  const [selectedMonth, setSelectedMonth] = useState("May 2026");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Mock Academic Report Data
  const academicReports = [
    { id: 1, subject: "Mathematics", avgScore: 82, passRate: 94, trend: "+3.2%", topStudent: "Aarav Sharma", status: "Outstanding" },
    { id: 2, subject: "Science & Biology", avgScore: 78, passRate: 89, trend: "+1.5%", topStudent: "Diya Patel", status: "Good" },
    { id: 3, subject: "English Lit.", avgScore: 85, passRate: 98, trend: "+0.8%", topStudent: "Ananya Rao", status: "Outstanding" },
    { id: 4, subject: "History & Civics", avgScore: 74, passRate: 85, trend: "-1.2%", topStudent: "Kabir Singh", status: "Average" },
    { id: 5, subject: "Computer Science", avgScore: 89, passRate: 100, trend: "+4.0%", topStudent: "Rohan Gupta", status: "Outstanding" }
  ];

  // Mock Financial Report Data
  const financialReports = [
    { id: 101, category: "Tuition Fees", expected: 50000, collected: 46200, pending: 3800, percentage: 92 },
    { id: 102, category: "Transport Fees", expected: 12000, collected: 10800, pending: 1200, percentage: 90 },
    { id: 103, category: "Laboratory & Sports", expected: 8000, collected: 7500, pending: 500, percentage: 93 },
    { id: 104, category: "Exam Materials", expected: 5000, collected: 5000, pending: 0, percentage: 100 }
  ];

  // Mock Operational Report Data
  const operationalReports = [
    { id: 201, route: "Route A - City Center", loadFactor: "92%", delayMins: 4, fuelEff: "8.2 km/l", onTimePct: 96 },
    { id: 202, route: "Route B - North Suburbs", loadFactor: "85%", delayMins: 12, fuelEff: "7.9 km/l", onTimePct: 88 },
    { id: 203, route: "Route C - South Campus Express", loadFactor: "78%", delayMins: 2, fuelEff: "8.5 km/l", onTimePct: 98 }
  ];

  const handleExport = (format) => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(10);
    toast.info(`Preparing ${activeSubTab} report in ${format} format...`);

    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExporting(false);
            setExportProgress(0);
            toast.success(`${activeSubTab} Report exported successfully as ${format}!`);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Filtration logic for Academic
  const filteredAcademic = academicReports.filter(report =>
    report.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.topStudent.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1 pb-4">
      
      {/* Header section with modern glass controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight leading-none">
            Institutional Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1">
            Real-time visual insights, performance metrics, and exportable logs.
          </p>
        </div>

        {/* Global Export Options */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport("PDF")}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold text-xs rounded-xl shadow-xs transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>PDF Export</span>
          </button>
          <button
            onClick={() => handleExport("Excel/CSV")}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>CSV Sheet</span>
          </button>
        </div>
      </div>

      {/* Export Progress bar */}
      <AnimatePresence>
        {isExporting && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-indigo-50/50 border border-indigo-100/80 rounded-2xl p-4 flex flex-col gap-2 shrink-0 overflow-hidden"
          >
            <div className="flex justify-between items-center text-xs font-bold text-indigo-700">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling metrics and rendering visual layouts...</span>
              </div>
              <span>{exportProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-indigo-600 h-full rounded-full"
                animate={{ width: `${exportProgress}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top 3 Interactive Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 shrink-0">
        
        {/* Card 1: Academic CGPA */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Academic Grade Avg
              </span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                81.6%
              </span>
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+2.4%</span>
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100 pt-3">
            <span>Overall pass rate:</span>
            <span className="text-slate-800 font-bold">93.2%</span>
          </div>
        </div>

        {/* Card 2: Collection Ratio */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fee Collection Status
              </span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-emerald-600 transition-colors">
                $69,500
              </span>
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
              <ArrowUpRight className="w-3 h-3" />
              <span>+5.1%</span>
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100 pt-3">
            <span>Target completion:</span>
            <span className="text-slate-800 font-bold">92.6% achieved</span>
          </div>
        </div>

        {/* Card 3: Bus Fleet On-Time Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Fleet punctuality
              </span>
              <span className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-cyan-600 transition-colors">
                94.0%
              </span>
            </div>
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-bold">
              <ArrowDownRight className="w-3 h-3" />
              <span>-0.5%</span>
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100 pt-3">
            <span>Average Route Delay:</span>
            <span className="text-slate-800 font-bold">6.0 mins</span>
          </div>
        </div>

      </div>

      {/* Tabs Menu Section */}
      <div className="flex items-center justify-between border-b border-slate-200 shrink-0 pb-px">
        <div className="flex gap-6">
          {["Academic", "Financial", "Operational"].map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setActiveSubTab(tab);
                  setSearchQuery("");
                }}
                className={`pb-3 text-sm font-bold tracking-wide relative transition-colors cursor-pointer ${
                  isActive ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <span>{tab} reports</span>
                {isActive && (
                  <motion.div
                    layoutId="reportTabBorder"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full items-stretch"
          >
            
            {/* Left side: interactive inputs & data tables (ColSpan 2) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full lg:col-span-2 overflow-hidden">
              
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                
                {/* Search & filters */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
                  <h3 className="text-sm font-bold text-slate-800 self-start sm:self-center">
                    Detailed Analytics Matrix
                  </h3>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    {/* Inline Search */}
                    <div className="relative w-full sm:w-48">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search records..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder-slate-400"
                      />
                    </div>

                    {/* Interactive Dropdown */}
                    {activeSubTab === "Academic" && (
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none font-bold"
                      >
                        <option>All Grades</option>
                        <option>Grade 9</option>
                        <option>Grade 10</option>
                        <option>Grade 11</option>
                        <option>Grade 12</option>
                      </select>
                    )}

                    {activeSubTab === "Financial" && (
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none font-bold"
                      >
                        <option>May 2026</option>
                        <option>April 2026</option>
                        <option>March 2026</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Main responsive table */}
                <div className="flex-1 overflow-y-auto border border-slate-100 rounded-2xl">
                  
                  {activeSubTab === "Academic" && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="py-3 px-4">Subject Field</th>
                          <th className="py-3 px-4">Class Avg Score</th>
                          <th className="py-3 px-4">Pass Rate</th>
                          <th className="py-3 px-4">Growth Trend</th>
                          <th className="py-3 px-4">Top Achiever</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                        {filteredAcademic.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                              <BookOpen className="w-4 h-4 text-indigo-500" />
                              <span>{item.subject}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold">
                                {item.avgScore}%
                              </span>
                            </td>
                            <td className="py-3.5 px-4">{item.passRate}%</td>
                            <td className={`py-3.5 px-4 font-bold ${item.trend.startsWith("+") ? "text-emerald-600" : "text-rose-500"}`}>
                              {item.trend}
                            </td>
                            <td className="py-3.5 px-4 text-slate-800">{item.topStudent}</td>
                          </tr>
                        ))}
                        {filteredAcademic.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400 text-xs font-semibold">
                              No subjects matched your query.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {activeSubTab === "Financial" && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="py-3 px-4">Revenue Stream</th>
                          <th className="py-3 px-4">Expected Target</th>
                          <th className="py-3 px-4">Actual Collected</th>
                          <th className="py-3 px-4">Pending Deficit</th>
                          <th className="py-3 px-4">Completion Pct</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                        {financialReports.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-emerald-500" />
                              <span>{item.category}</span>
                            </td>
                            <td className="py-3.5 px-4">${item.expected.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-emerald-600 font-bold">${item.collected.toLocaleString()}</td>
                            <td className="py-3.5 px-4 text-rose-500">${item.pending.toLocaleString()}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${item.percentage}%` }} />
                                </div>
                                <span className="font-bold text-slate-700">{item.percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeSubTab === "Operational" && (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="py-3 px-4">Bus Route Identifier</th>
                          <th className="py-3 px-4">Average Load Factor</th>
                          <th className="py-3 px-4">Avg Station Delay</th>
                          <th className="py-3 px-4">Fuel Efficiency</th>
                          <th className="py-3 px-4">Punctuality Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                        {operationalReports.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 px-4 font-bold text-slate-800 flex items-center gap-2">
                              <Clock className="w-4 h-4 text-cyan-500" />
                              <span>{item.route.split(" - ")[0]}</span>
                            </td>
                            <td className="py-3.5 px-4">{item.loadFactor}</td>
                            <td className="py-3.5 px-4 text-amber-600">{item.delayMins} mins</td>
                            <td className="py-3.5 px-4 text-slate-500">{item.fuelEff}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                item.onTimePct >= 95 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-amber-50 text-amber-600"
                              }`}>{item.onTimePct}% On-Time</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                </div>

              </div>

              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-left mt-4 border-t border-slate-100 pt-3 shrink-0">
                Data generated on May 19, 2026 at 11:15 AM
              </div>
            </div>

            {/* Right side: visual analytics representation charts (ColSpan 1) */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full overflow-hidden">
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Tabular Visualizations
                  </h3>
                </div>

                <p className="text-[11px] text-slate-400 font-medium shrink-0 leading-relaxed">
                  Interactive representation of active KPIs. Hover or tap rows for full parameters.
                </p>

                {/* Custom SVG / Div Visual Chart */}
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-inner relative">
                  
                  {/* Decorative chart grids */}
                  <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[16px_16px] opacity-20 pointer-events-none" />

                  {activeSubTab === "Academic" && (
                    <div className="h-full flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block mb-2 text-center">Subject Performance Index</span>
                      
                      <div className="flex-1 flex flex-col justify-around gap-2 mt-2">
                        {filteredAcademic.map((item) => (
                          <div key={item.id} className="space-y-1 relative z-10">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>{item.subject}</span>
                              <span className="text-indigo-600">{item.avgScore}%</span>
                            </div>
                            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200/40">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.avgScore}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-linear-to-r from-indigo-500 to-indigo-600 h-full rounded-full shadow-[0_1px_4px_rgba(99,102,241,0.2)]" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSubTab === "Financial" && (
                    <div className="h-full flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest block mb-2 text-center">Fund Allocation & Revenue Pct</span>
                      
                      <div className="flex-1 flex flex-col justify-around gap-2 mt-2">
                        {financialReports.map((item) => (
                          <div key={item.id} className="space-y-1 relative z-10">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>{item.category}</span>
                              <span className="text-emerald-600">${item.collected.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200/40">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.percentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-linear-to-r from-emerald-400 to-emerald-500 h-full rounded-full shadow-[0_1px_4px_rgba(16,185,129,0.2)]" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSubTab === "Operational" && (
                    <div className="h-full flex flex-col justify-between">
                      <span className="text-[9px] font-bold text-cyan-600 uppercase tracking-widest block mb-2 text-center">Route Punctuality Index</span>
                      
                      <div className="flex-1 flex flex-col justify-around gap-2 mt-2">
                        {operationalReports.map((item) => (
                          <div key={item.id} className="space-y-1 relative z-10">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>{item.route.split(" - ")[0]}</span>
                              <span className="text-cyan-600">{item.onTimePct}%</span>
                            </div>
                            <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-slate-200/40">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${item.onTimePct}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="bg-linear-to-r from-cyan-400 to-cyan-500 h-full rounded-full shadow-[0_1px_4px_rgba(6,182,212,0.2)]" 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>

              <div className="mt-4 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3 shrink-0">
                <span>System status:</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Synced
                </span>
              </div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}