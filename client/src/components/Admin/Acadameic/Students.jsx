import React, { useState } from "react";
import { Search, Filter, Plus, MoreVertical } from "lucide-react";

const MOCK_STUDENTS = [
  { id: 1, name: "Aarav Sharma", roll: "01", admissionNo: "ADM-2025-001", gender: "Male", dob: "12 Jul 2014", status: "Active", avatar: "https://i.pravatar.cc/64?img=12" },
  { id: 2, name: "Ananya Singh", roll: "02", admissionNo: "ADM-2025-002", gender: "Female", dob: "18 Aug 2014", status: "Active", avatar: "https://i.pravatar.cc/64?img=47" },
  { id: 3, name: "Vihaan Patel", roll: "03", admissionNo: "ADM-2025-003", gender: "Male", dob: "21 May 2014", status: "Active", avatar: "https://i.pravatar.cc/64?img=33" },
  { id: 4, name: "Myra Iyer", roll: "04", admissionNo: "ADM-2025-004", gender: "Female", dob: "03 Sep 2014", status: "Active", avatar: "https://i.pravatar.cc/64?img=45" },
  { id: 5, name: "Arjun Kumar", roll: "05", admissionNo: "ADM-2025-005", gender: "Male", dob: "11 Jan 2015", status: "Active", avatar: "https://i.pravatar.cc/64?img=14" },
  { id: 6, name: "Siya Reddy", roll: "06", admissionNo: "ADM-2025-006", gender: "Female", dob: "27 Feb 2015", status: "Active", avatar: "https://i.pravatar.cc/64?img=49" },
  { id: 7, name: "Krish Mehta", roll: "07", admissionNo: "ADM-2025-007", gender: "Male", dob: "16 Mar 2015", status: "Active", avatar: "https://i.pravatar.cc/64?img=15" },
  { id: 8, name: "Aadhya Nair", roll: "08", admissionNo: "ADM-2025-008", gender: "Female", dob: "05 Apr 2015", status: "Active", avatar: "https://i.pravatar.cc/64?img=44" },
  { id: 9, name: "Ritvik Jain", roll: "09", admissionNo: "ADM-2025-009", gender: "Male", dob: "30 May 2015", status: "Active", avatar: "https://i.pravatar.cc/64?img=18" },
  { id: 10, name: "Ishita Verma", roll: "10", admissionNo: "ADM-2025-010", gender: "Female", dob: "14 Jun 2015", status: "Active", avatar: "https://i.pravatar.cc/64?img=48" },
];

export function Students({ students = MOCK_STUDENTS, capacity = 40, onStartEnrollment }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNo.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-800">
          Enrolled Students <span className="text-slate-400 font-semibold">({students.length})</span>
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search students..."
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 w-48 sm:w-56 transition-all"
            />
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
          <button
            onClick={onStartEnrollment}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Enroll Student
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 text-slate-400 text-xs font-bold uppercase tracking-wide">
              <th className="text-left px-5 py-3 w-10">#</th>
              <th className="text-left px-3 py-3">Student</th>
              <th className="text-left px-3 py-3">Roll No.</th>
              <th className="text-left px-3 py-3">Admission No.</th>
              <th className="text-left px-3 py-3">Gender</th>
              <th className="text-left px-3 py-3">Date of Birth</th>
              <th className="text-left px-3 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((s, i) => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-indigo-50/30 transition-colors">
                <td className="px-5 py-3 text-slate-400 font-medium">{(page - 1) * pageSize + i + 1}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2.5">
                    <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <span className="font-semibold text-slate-700">{s.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-500">{s.roll}</td>
                <td className="px-3 py-3 text-slate-500">{s.admissionNo}</td>
                <td className="px-3 py-3 text-slate-500">{s.gender}</td>
                <td className="px-3 py-3 text-slate-500">{s.dob}</td>
                <td className="px-3 py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <button className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">
                  No students match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100">
        <span className="text-xs text-slate-400 font-medium">
          Showing {pageRows.length === 0 ? 0 : (page - 1) * pageSize + 1} to {(page - 1) * pageSize + pageRows.length} of {filtered.length} students
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-sm"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-sm font-semibold transition-colors ${n === page ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"
                }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-7 h-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors text-sm"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}

export default Students;
