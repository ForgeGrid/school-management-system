import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getSchoolStaff,
  selectSchoolStaff,
  selectStaffLoading,
  selectStaffNotification,
  clearStaffNotification,
} from "../../redux/slice/staffSlice";

// Consistent avatar color per name
const COLOR_PAIRS = [
  ["bg-amber-100", "text-amber-800"],
  ["bg-indigo-100", "text-indigo-800"],
  ["bg-emerald-100", "text-emerald-800"],
  ["bg-rose-100", "text-rose-800"],
  ["bg-cyan-100", "text-cyan-800"],
  ["bg-violet-100", "text-violet-800"],
  ["bg-slate-200", "text-slate-800"],
];

function getColorPair(name = "") {
  return COLOR_PAIRS[name.charCodeAt(0) % COLOR_PAIRS.length];
}

export default function JoinedMembers() {
  const dispatch    = useDispatch();
  const members     = useSelector(selectSchoolStaff);
  const isLoading   = useSelector(selectStaffLoading("getSchoolStaff"));
  const notification = useSelector(selectStaffNotification);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    dispatch(getSchoolStaff());
  }, [dispatch]);

  useEffect(() => {
    if (notification?.type === "error") {
      const t = setTimeout(() => dispatch(clearStaffNotification()), 4000);
      return () => clearTimeout(t);
    }
  }, [notification, dispatch]);

  const filtered = members.filter((t) => {
    if (t.role !== "teacher") return false;        
    const name  = t.name  || "";
    const email = t.email || "";
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Joined Members</h2>
          <span className="text-sm font-semibold text-slate-300 animate-pulse">Loading…</span>
        </div>
        <div className="space-y-3 pt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-slate-100 rounded w-1/3" />
                <div className="h-3 bg-slate-100 rounded w-1/4" />
              </div>
              <div className="h-3 bg-slate-100 rounded w-1/4" />
              <div className="h-6 bg-slate-100 rounded-full w-16" />
              <div className="h-3 bg-slate-100 rounded w-12" />
              <div className="h-3 bg-slate-100 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 leading-none tracking-tight">
          Joined Members
        </h2>
        <span className="text-sm font-semibold text-slate-400">
          {filtered.length} Account{filtered.length !== 1 ? "s" : ""} Registered
        </span>
      </div>

      {/* Error banner */}
      {notification?.type === "error" && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm font-medium">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          {notification.message}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
        />
      </div>

      {/* Table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
            <th className="pb-3.5 pt-2 w-[35%]">Member</th>
            <th className="pb-3.5 pt-2 w-[25%]">Email</th>
            <th className="pb-3.5 pt-2 w-[12%]">Role</th>
            <th className="pb-3.5 pt-2 w-[12%]">Status</th>
            <th className="pb-3.5 pt-2 w-[16%]">Joined At</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70 text-sm text-slate-600">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-semibold">
                {searchQuery ? "No members match your search." : "No staff members found."}
              </td>
            </tr>
          ) : (
            filtered.map((teacher) => {
              const name      = teacher.name  || "—";
              const email     = teacher.email || "—";
              const role      = teacher.role  || "Staff";
              const status    = teacher.status || "inactive";
              const isActive  = status === "active" || status === "Active";
              const joinedAt  = teacher.joined_at
                ? new Date(teacher.joined_at).toLocaleDateString()
                : teacher.createdAt
                  ? new Date(teacher.createdAt).toLocaleDateString()
                  : "—";
              const avatarUrl = teacher.profile_avatar?.secure_url || null;
              const [bgColor, textColor] = getColorPair(name);
              const initials  = name.split(" ").filter(Boolean).map((n) => n[0]).slice(0, 1).join("").toUpperCase();
              const isAdmin   = role === "school_admin";
              const isTeacher = role === "teacher";
              const isStudent = role === "student";

              return (
                <tr key={teacher._id || teacher.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Member */}
                  <td className="py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold uppercase text-base shrink-0 border border-slate-100 overflow-hidden ${bgColor} ${textColor}`}>
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={name}
                            className="w-12 h-12 rounded-full object-cover"
                            onError={(e) => { e.target.style.display = "none"; }}
                          />
                        ) : initials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-extrabold text-slate-800 text-[17px] leading-tight truncate">
                          {name}
                        </span>
                        <span className="text-xs font-normal text-slate-400 truncate mt-1">
                          {teacher.employee_id ? `#${teacher.employee_id}` : email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-4 text-slate-500 font-normal truncate max-w-[200px] text-sm">
                    {email}
                  </td>

                  {/* Role */}
                  <td className="py-4">
                    <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      isAdmin
                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                        : isTeacher
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : isStudent
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}>
                      {isAdmin ? "Admin" : role}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-4 text-sm">
                    {isActive ? (
                      <span className="flex items-center gap-2 text-emerald-600 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-slate-400 font-normal">
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Joined At */}
                  <td className="py-4 text-slate-400 font-normal text-sm">
                    {joinedAt}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}