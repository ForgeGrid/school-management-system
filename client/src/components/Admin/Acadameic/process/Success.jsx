import React from 'react';

export function Success({
  classInfo,
  selectedIds,
  mockPromotions, mockNewAdmissions,
  onReset,
}) {
  // Compute mock roll numbers starting after current strength
  const startRoll = classInfo.currentStrength + 1;
  const selectedPromotionsList = mockPromotions.filter(s => selectedIds.has(s.id));
  const selectedAdmissionsList = mockNewAdmissions.filter(s => selectedIds.has(s.id));
  const allSelected = [...selectedPromotionsList, ...selectedAdmissionsList];
  const completedAt = '28 Jun 2026, 11:12 AM';

  return (
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-5 pr-1 pb-4">
      {/* Page header */}
      <div className="pb-3 border-b border-slate-100">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Enrollment Successful</h1>
        <p className="text-sm text-slate-400 mt-1">The selected students have been enrolled successfully.</p>
      </div>

      {/* ── Success Banner ── */}
      <div className="bg-gradient-to-br from-green-50/60 to-emerald-50/30 border border-green-100 rounded-2xl p-6 flex flex-col items-center text-center gap-3 shadow-sm">
        {/* Animated checkmark circle */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {/* Decorative rays */}
          <div className="absolute inset-0 -m-3 rounded-full border-2 border-green-200/60 border-dashed animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-green-700 tracking-tight">Students enrolled successfully!</h2>
          <p className="text-sm text-slate-500 mt-1">
            {selectedIds.size} students have been enrolled into {classInfo.grade} for Academic Year {classInfo.year}.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium bg-white/60 px-3 py-1.5 rounded-full border border-slate-100">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Completed on {completedAt}
        </div>
      </div>

      {/* ── Updated Class Info Ribbon ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-800">{classInfo.grade}</h2>
              <span className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-100">Active</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 font-medium">
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">{classInfo.code}</span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Academic Year {classInfo.year}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 pr-2 flex-wrap sm:flex-nowrap">
          <div className="text-center min-w-[60px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Capacity</span>
            <span className="text-xl font-bold text-slate-800">{classInfo.capacity}</span>
          </div>
          <div className="h-8 w-px bg-slate-150 hidden sm:block" />
          <div className="text-center min-w-[70px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Previous Strength</span>
            <span className="text-xl font-bold text-slate-800">{classInfo.currentStrength}</span>
          </div>
          <div className="h-8 w-px bg-slate-150 hidden sm:block" />
          <div className="text-center min-w-[70px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Current Strength</span>
            <span className="text-xl font-extrabold text-green-600">{classInfo.currentStrength + selectedIds.size}</span>
            <span className="flex items-center justify-center gap-0.5 text-[10px] text-green-500 font-bold mt-0.5">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {selectedIds.size} from previous
            </span>
          </div>
          <div className="h-8 w-px bg-slate-150 hidden sm:block" />
          <div className="text-center min-w-[70px]">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Available Seats</span>
            <span className="text-xl font-extrabold text-green-600">{classInfo.capacity - classInfo.currentStrength - selectedIds.size}</span>
          </div>
        </div>
      </div>

      {/* ── 4 Metrics cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Total Enrolled */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Enrolled</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{selectedIds.size}</p>
            <p className="text-[10px] text-slate-400 mt-1">Students</p>
          </div>
        </div>
        {/* Card 2: Promotions */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Promotions</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{selectedPromotionsList.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Students</p>
          </div>
        </div>
        {/* Card 3: New Admissions */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">New Admissions</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{selectedAdmissionsList.length}</p>
            <p className="text-[10px] text-slate-400 mt-1">Students</p>
          </div>
        </div>
        {/* Card 4: Enrollments Created */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Enrollments Created</p>
            <p className="text-2xl font-black text-slate-800 leading-none">{selectedIds.size}</p>
            <p className="text-[10px] text-slate-400 mt-1">Successfully</p>
          </div>
        </div>
      </div>

      {/* ── Assigned Roll Numbers Table ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-slate-800">Assigned Roll Numbers</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3 px-3">Student</th>
                <th className="pb-3 px-3">Source Type</th>
                <th className="pb-3 px-3">From (Previous Class)</th>
                <th className="pb-3 px-3 text-right">Assigned Roll No.</th>
              </tr>
            </thead>
            <tbody>
              {allSelected.map((student, idx) => (
                <tr key={student.id} className="border-b border-slate-50/60">
                  <td className="py-3 px-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${student.color}`}>
                      {student.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-700 text-sm">{student.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{student.id}</div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border ${student.type === 'New Admission'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                      {student.type || 'Promotion'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-semibold text-xs">
                    {student.from || '—'}
                    {student.year && <div className="text-[10px] text-slate-400 font-bold">({student.year})</div>}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="text-base font-black text-green-600">{startRoll + idx}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Completion info banner ── */}
      <div className="bg-blue-50/40 border border-blue-100/80 rounded-xl px-4 py-3.5 flex items-center gap-3 text-xs font-semibold text-blue-750 shadow-sm">
        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-slate-600">All previous enrollments have been updated and marked as completed.</span>
      </div>

      {/* ── Footer action buttons ── */}
      <div className="mt-2 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-md flex items-center justify-between gap-4">
        {/* Left: Go to Class Hub ghost button
            [FUTURE API]: On click → close enrollment wizard + navigate to Class Hub / refresh ClassSection list
            POST /student-enrollment/confirm-allocation already called; this just navigates.
        */}
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-800 px-5 py-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Go to Class Hub
        </button>

        {/* Right: View Enrolled Students CTA
            [FUTURE API]: On click → navigate to enrolled students list view for this class section.
            GET /class-sections/{classSection_id}/enrolled-students
        */}
        <button
          onClick={() => {
            console.log('NAVIGATE: View Enrolled Students page');
            console.log('GET /class-sections/' + classInfo.code + '/enrolled-students');
            onReset();
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          View Enrolled Students
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default Success;
