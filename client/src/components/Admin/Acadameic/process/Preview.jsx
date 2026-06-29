import React from 'react';

export function Preview({
  selectedIds,
  selectedPromotionsCount, selectedNewAdmissionsCount,
  mockPromotions, mockNewAdmissions,
  classInfo,
  loading,
  onBack,
  onConfirm,
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-6 pr-1 pb-4">

      {/* Summary metrics panel */}
      <div className="bg-indigo-50/15 border border-indigo-100/50 rounded-2xl p-5">
        <span className="text-sm font-semibold text-slate-805 block mb-4">You are about to enroll</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Card 1: Total Selected */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-650 flex items-center justify-center shrink-0 border border-purple-100/40 animate-pulse">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total Selected</p>
              <p className="text-xl font-black text-slate-805 leading-none">{selectedIds.size}</p>
              <p className="text-[10px] text-slate-450 mt-1">Students</p>
            </div>
          </div>

          {/* Card 2: Promotions */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-150/40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Promotions</p>
              <p className="text-xl font-black text-slate-805 leading-none">{selectedPromotionsCount}</p>
              <p className="text-[10px] text-slate-450 mt-1">Students</p>
            </div>
          </div>

          {/* Card 3: New Admissions */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">New Admissions</p>
              <p className="text-xl font-black text-slate-805 leading-none">{selectedNewAdmissionsCount}</p>
              <p className="text-[10px] text-slate-455 mt-1">Students</p>
            </div>
          </div>

          {/* Card 4: Total */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/40">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
              <p className="text-xl font-black text-slate-805 leading-none">{selectedIds.size}</p>
              <p className="text-[10px] text-slate-450 mt-1">Students</p>
            </div>
          </div>

        </div>
      </div>

      {/* Info Banner alert */}
      <div className="bg-emerald-50/40 border border-emerald-100/85 rounded-xl px-4 py-3.5 flex items-center gap-3 text-xs font-semibold text-emerald-800 shadow-sm">
        <svg className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>These students will be enrolled into {classInfo.grade} for Academic Year {classInfo.year}.</span>
      </div>

      {/* Promotions list table */}
      {selectedPromotionsCount > 0 && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Promotions ({selectedPromotionsCount})</h3>
              <p className="text-xs text-slate-400">Students promoted from Grade 6 to Grade 7.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Source Type</th>
                  <th className="py-2.5 px-3">From (Previous Class)</th>
                  <th className="py-2.5 px-3">Previous Roll No.</th>
                </tr>
              </thead>
              <tbody>
                {mockPromotions
                  .filter(s => selectedIds.has(s.id))
                  .map(student => (
                    <tr key={student.id} className="border-b border-slate-50/50">
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
                        <span className="bg-indigo-50 text-indigo-650 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          Promotion
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-semibold leading-relaxed">
                        {student.from}
                        <div className="text-[10px] text-slate-400 font-bold">({student.year})</div>
                      </td>
                      <td className="py-3 px-3 text-xs font-semibold text-slate-600">{student.roll}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Admissions list table or Empty state */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2.5 pb-3 mb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">New Admissions ({selectedNewAdmissionsCount})</h3>
            <p className="text-xs text-slate-400">Students with admission requests for this class.</p>
          </div>
        </div>

        {selectedNewAdmissionsCount === 0 ? (
          <div className="border border-dashed border-slate-200/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-xs font-bold text-slate-400">No new admission candidates selected.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Source Type</th>
                  <th className="py-2.5 px-3">Requested Grade</th>
                  <th className="py-2.5 px-3">Requested On</th>
                </tr>
              </thead>
              <tbody>
                {mockNewAdmissions
                  .filter(s => selectedIds.has(s.id))
                  .map(student => (
                    <tr key={student.id} className="border-b border-slate-50/50">
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
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          New Admission
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{student.grade}</td>
                      <td className="py-3 px-3 text-xs text-slate-500 font-semibold">{student.date}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Yellow warning card */}
      <div className="bg-amber-50/50 border border-amber-100 rounded-xl px-4 py-3.5 flex items-start gap-3 text-xs font-semibold text-amber-800 shadow-sm leading-relaxed">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <span className="font-extrabold text-amber-900 block mb-0.5">Review carefully before confirming.</span>
          Once confirmed, students will be enrolled and roll numbers will be assigned.
        </div>
      </div>

      {/* Sticky footer preview options bar */}
      <div className="mt-4 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-md flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Candidates
        </button>

        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Confirm Allocation'}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default Preview;
