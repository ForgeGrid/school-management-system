import React from "react";
import { Users2 } from "lucide-react";

export function SubjectTeachers() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
        <Users2 className="w-6 h-6 text-indigo-400" />
      </div>
      <p className="text-sm font-bold text-slate-600">Subject Teachers</p>
      <p className="text-xs text-slate-400 mt-1">Coming soon</p>
    </div>
  );
}

export default SubjectTeachers;
