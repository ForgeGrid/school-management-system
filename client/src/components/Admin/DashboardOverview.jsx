import React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Users,
  Bus,
  UserCheck,
  CalendarCheck,
  Plus,
  Map,
} from "lucide-react";

export default function DashboardOverview({
  totalStudentsCount,
  activeBusesCount,
  stoppedBusesCount,
  pendingProfilesCount,
  todayAttendancePct,
  buses,
  setBuses,
  setActiveTab,
}) {
  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight capitalize leading-none">
            Admin dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Manage institution metrics, bus fleet, and alerts in real-time.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("Student admission")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-3" />
          <span>Add student</span>
        </button>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Total Students */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Student
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                {totalStudentsCount}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              across all classes
            </span>
          </div>
          <div className="absolute right-4 bottom-4 p-2 bg-indigo-50 rounded-xl text-indigo-500 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Active Buses */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active buses
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-cyan-500 transition-colors">
                {activeBusesCount}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold ">
              {activeBusesCount} running, {stoppedBusesCount} stopped
            </span>
          </div>
          <div className="absolute right-4 bottom-4 p-2 bg-cyan-50 rounded-xl text-cyan-500 group-hover:scale-110 transition-transform">
            <Bus className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Pending Profiles */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Pending profiles
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-amber-500 transition-colors">
                {pendingProfilesCount}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Need admin's approval
            </span>
          </div>
          <div className="absolute right-4 bottom-4 p-2 bg-amber-50 rounded-xl text-amber-500 group-hover:scale-110 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Card 4: Today Attendance */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Today attendance
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-800 tracking-tight group-hover:text-emerald-500 transition-colors">
                {todayAttendancePct}%
              </span>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              Last updated, 9:15 am
            </span>
          </div>
          <div className="absolute right-4 bottom-4 p-2 bg-emerald-50 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
            <CalendarCheck className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Split Columns: Transport map & Quick Actions */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 overflow-hidden">
        
        {/* Live Transport Card (ColSpan 2) */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-full lg:col-span-2 overflow-hidden relative group">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                <Map className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Live Transport Overview
              </h3>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-600 uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Simulated GPS
            </span>
          </div>

          {/* Map Representation Box */}
          <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden relative shadow-inner">
            {/* Dotted paths representing streets */}
            <svg 
              className="absolute inset-0 w-full h-full stroke-slate-200 pointer-events-none"
              strokeWidth={2}
              strokeDasharray="6,6"
            >
              <path d="M 0 100 Q 150 50, 300 200 T 600 100" fill="none" />
              <path d="M 100 0 Q 350 150, 200 400" fill="none" />
              <path d="M 0 300 H 600" fill="none" />
              <path d="M 500 0 V 400" fill="none" />
            </svg>

            {/* Grid Dots */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-size-[24px_24px] opacity-40 pointer-events-none" />

            {/* Interactive Moving Buses */}
            {buses.map((bus) => (
              <motion.div
                key={bus.id}
                className="absolute cursor-pointer flex flex-col items-center group/bus"
                style={{ left: `${bus.coords.x}%`, top: `${bus.coords.y}%` }}
                transition={{ type: "spring", stiffness: 40, damping: 10 }}
                onClick={() => {
                  toast.info(`${bus.routeName} is currently ${bus.status.toLowerCase()} at ${bus.speed}`);
                  setActiveTab("Live tracking");
                }}
              >
                {/* Glowing halo if running */}
                {bus.status === "Running" && (
                  <span className="absolute -inset-2.5 rounded-full bg-cyan-500/20 animate-ping opacity-75" />
                )}
                <div className={`p-2 rounded-xl text-white shadow-lg ${
                  bus.status === "Running" 
                    ? "bg-cyan-500 ring-2 ring-white" 
                    : "bg-slate-400 ring-2 ring-white"
                }`}>
                  <Bus className="w-5 h-5" />
                </div>
                
                {/* Hover Label */}
                <div className="absolute bottom-full mb-1.5 opacity-0 group-hover/bus:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md pointer-events-none">
                  {bus.routeName.split(" ")[0]} ({bus.speed})
                </div>
              </motion.div>
            ))}

            {/* Floating Map Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-xs border border-slate-200 px-3 py-2 rounded-xl text-[10px] space-y-1 shadow-sm font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>Running Bus</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>Stopped Bus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Buses Panel */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">
              Fleet Status
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
              {activeBusesCount} Active
            </span>
          </div>

          {/* Bus list with custom scrollbar */}
          <div className="flex-1 mt-4 space-y-3 overflow-y-auto pr-1">
            {buses.map((bus) => (
              <div 
                key={bus.id} 
                className="p-3.5 bg-slate-50/50 border border-slate-200/40 rounded-2xl space-y-2 hover:shadow-xs transition-shadow cursor-pointer group/item"
                onClick={() => {
                  toast.info(`Opening GPS telemetry for ${bus.routeName}`);
                  setActiveTab("Live tracking");
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-xs group-hover/item:text-indigo-600 transition-colors">{bus.routeName.split(" - ")[0]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                    bus.status === "Running" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500"
                  }`}>{bus.status}</span>
                </div>
                
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Driver: {bus.driver}</span>
                  <span className="text-slate-800 font-black">{bus.speed}</span>
                </div>
                
                <div className="text-[10px] text-slate-400 font-medium">
                  Next station: <span className="text-indigo-600 font-bold">{bus.nextStop}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider pt-4 border-t border-slate-100 shrink-0 mt-3">
            SMS Panel v1.4.0
          </div>
        </div>

      </div>
    </div>
  );
}
