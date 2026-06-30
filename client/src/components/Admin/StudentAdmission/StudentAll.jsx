import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllStudents, selectAllStudents, selectStudentLoading } from "../../../redux/slice/schoolStudentSlice";

function StudentAll() {
  const dispatch = useDispatch();
  const students = useSelector(selectAllStudents);
  const isLoading = useSelector(selectStudentLoading("getAllStudents"));

  useEffect(() => {
    dispatch(getAllStudents());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
          </svg>
        </div>
        <p className="text-slate-600 font-medium">No students yet</p>
        <p className="text-slate-400 text-sm mt-1">Click "New Admission" to enroll the first student</p>
      </div>
    );
  }

  // Consistent avatar color per student
  const colorPairs = [
    ["bg-blue-100", "text-blue-700"],
    ["bg-violet-100", "text-violet-700"],
    ["bg-emerald-100", "text-emerald-700"],
    ["bg-amber-100", "text-amber-700"],
    ["bg-rose-100", "text-rose-700"],
    ["bg-cyan-100", "text-cyan-700"],
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 h-full flex flex-col overflow-hidden">

      {/* Table header */}
      <div
        className="grid px-6 py-3 border-b border-slate-100 shrink-0 bg-slate-50/60"
        style={{ gridTemplateColumns: "2fr 1.2fr 1fr 2fr 0.8fr" }}
      >
        {["Student", "Admission No", "Class", "Email", "Status"].map((h) => (
          <span key={h} className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {students.map((student) => {
          const name =
            student.student_name ||
            student.user_id?.name ||
            `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
            "—";

          const email     = student.user_id?.email || student.email || "—";
          const avatarUrl = student.user_id?.profile_avatar?.secure_url || student.avatarUrl || null;
          const status    = student.user_id?.status || student.status || "active";
          const isActive  = status === "active" || status === "Active";

          const initials = name
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          const [bgColor, textColor] = colorPairs[name.charCodeAt(0) % colorPairs.length];

          return (
            <div
              key={student._id || student.id}
              className="grid items-center px-6 py-3.5 hover:bg-slate-50/80 transition-colors cursor-default"
              style={{ gridTemplateColumns: "2fr 1.2fr 1fr 2fr 0.8fr" }}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3 min-w-0 pr-3">
                <div className={`w-9 h-9 rounded-full ${bgColor} flex items-center justify-center ${textColor} text-xs font-bold shrink-0 overflow-hidden ring-2 ring-white`}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      className="w-9 h-9 rounded-full object-cover"
                      alt={name}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    initials
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-800 truncate">{name}</span>
              </div>

              {/* Admission No */}
              <span className="text-sm text-slate-500 font-mono">
                {student.admission_no || student.rollNo || "—"}
              </span>

              {/* Class */}
              <span className="text-sm text-slate-600 font-medium">
                {student.requestedGrade || student.class || "—"}
              </span>

              {/* Email */}
              <span className="text-sm text-slate-400 truncate pr-4">
                {email}
              </span>

              {/* Status badge */}
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-slate-100 shrink-0">
        <span className="text-xs text-slate-400 font-medium">
          {students.length} student{students.length !== 1 ? "s" : ""} total
        </span>
      </div>
    </div>
  );
}

export default StudentAll;