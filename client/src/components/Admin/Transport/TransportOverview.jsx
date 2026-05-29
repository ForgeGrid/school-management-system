import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Bus, MapPin, Users, TrendingUp, Activity } from "lucide-react";
import { toast } from "sonner";
import { getAllTransportFeeStructures, selectAllFeeStructures, selectFeeStructureLoading, selectFeeStructureNotif } from "../../../redux/slice/transportFeeStructureSlice";

export default function TransportOverview({ buses = [], setActiveTab }) {
  const dispatch = useDispatch();
  const structures = useSelector(selectAllFeeStructures);
  const loading = useSelector(selectFeeStructureLoading("getAll"));
  const notification = useSelector(selectFeeStructureNotif);

  useEffect(() => {
    dispatch(getAllTransportFeeStructures());
  }, [dispatch]);

  useEffect(() => {
    if (!notification) return;
    if (notification.type === "success") toast.success(notification.message);
    else toast.error(notification.message);
  }, [notification]);

  const running = buses.filter(b => b.status === "Running").length;
  const stopped = buses.filter(b => b.status === "Stopped").length;

  const stats = [
    { label: "Total Routes", value: buses.length, color: "indigo", icon: MapPin },
    { label: "Running", value: running, color: "emerald", icon: Activity },
    { label: "Stopped", value: stopped, color: "amber", icon: Bus },
    { label: "Total Fee Structures", value: structures.length, color: "purple", icon: TrendingUp },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Transport Overview</h1>
          <p className="text-sm text-slate-500 font-medium mt-0.5">Live fleet status across all active routes</p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[11px] font-bold text-emerald-600 uppercase tracking-wider animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Live
        </span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const colors = {
            indigo: { bg: "bg-indigo-50", text: "text-indigo-600", bar: "bg-indigo-500" },
            emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500" },
            amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500" },
            cyan: { bg: "bg-cyan-50", text: "text-cyan-600", bar: "bg-cyan-500" },
            purple: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" }
          }[s.color];
          return (
            <div key={s.label} className="bg-white border border-slate-200/80 rounded-2xl p-5 relative overflow-hidden hover:shadow-md transition-all group">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${colors.bar}`} />
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">{s.label}</span>
              <span className="text-3xl font-black text-slate-800">{s.value}</span>
              <div className={`absolute right-4 bottom-4 p-2 ${colors.bg} rounded-xl ${colors.text} group-hover:scale-110 transition-transform`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>
          );
        })}
      </div>
        {/* Fee Structures */}
        <div className="mt-6">
          <h2 className="text-base font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-3">Transport Fee Structures</h2>
          {loading ? (
            <p className="text-slate-500">Loading...</p>
          ) : (
            <ul className="space-y-2">
              {structures && structures.map((s) => (
                <li key={s._id} className="p-3 bg-white border border-slate-200 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{s.route_id?.name || "Unnamed Route"}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-600"}`}>{s.status}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">Year: {s.academicYear} – Frequency: {s.frequency}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      {/* Bus cards */}
      <div className="flex-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-800 mb-4 border-b border-slate-100 pb-3">Fleet at a Glance</h2>
        <div className="space-y-3">
          {buses.map((bus) => (
            <motion.div
              key={bus.id}
              whileHover={{ x: 4 }}
              onClick={() => setActiveTab?.("Transport › Bus Routes")}
              className="flex items-center justify-between p-4 bg-slate-50/60 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${bus.status === "Running" ? "bg-cyan-100 text-cyan-700" : "bg-slate-200 text-slate-500"}`}>
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{bus.routeName.split(" - ")[0]}</p>
                  <p className="text-xs text-slate-400 font-medium">Driver: {bus.driver}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-700">{bus.speed}</span>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bus.status === "Running" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500"}`}>
                  {bus.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
