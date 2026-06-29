import React from 'react';

export function Candidates({
  selectionMode, setSelectionMode,
  selectedIds, setSelectedIds,
  loading,
  mockNewAdmissions, mockPromotions,
  allAdmissionsSelected, allPromotionsSelected,
  selectedNewAdmissionsCount, selectedPromotionsCount,
  handleSelectAllAdmissions, handleSelectAllPromotions,
  handleToggleStudent,
  handleAutoAllocate,
  simulateGetCandidates,
  handlePreviewAllocation,
  onCancel,
}) {
  return (
    <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-5 pr-1">

      {/* Selection Mode Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">Selection Mode</span>
          <button
            onClick={() => { setSelectionMode('manual'); setSelectedIds(new Set()); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${selectionMode === 'manual'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
              : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
              }`}
          >
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${selectionMode === 'manual' ? 'border-indigo-650 bg-indigo-650' : 'border-slate-350 bg-white'}`}>
              {selectionMode === 'manual' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
            Manual Selection
          </button>

          <button
            onClick={handleAutoAllocate}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${selectionMode === 'auto'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
              : 'bg-white border-slate-200 text-slate-550 hover:bg-slate-50'
              }`}
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Auto Allocate
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* API Route label */}
          <div className="font-mono text-[9px] bg-slate-50 text-slate-500 px-2.5 py-1 rounded border border-slate-200/80 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
            GET /student-enrollment/candidates
          </div>
          <button
            onClick={simulateGetCandidates}
            disabled={loading}
            className="flex items-center gap-1.5 border border-indigo-600 text-indigo-600 bg-white hover:bg-indigo-50 text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Get Eligible Students
          </button>
        </div>
      </div>

      {/* Admission & Promotion tables */}
      <div className="flex flex-col gap-6 pb-4">

        {/* New Admissions section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">New Admissions ({mockNewAdmissions.length})</h3>
                <p className="text-xs text-slate-400">Students with admission requests for this class.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-450">{selectedNewAdmissionsCount} selected</span>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allAdmissionsSelected}
                  onChange={handleSelectAllAdmissions}
                  className="w-4 h-4 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Select All
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-4"></th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Requested Grade</th>
                  <th className="py-2.5 px-3">New Admission</th>
                  <th className="py-2.5 px-3">Requested On</th>
                </tr>
              </thead>
              <tbody>
                {mockNewAdmissions.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`border-b border-slate-50/40 hover:bg-slate-50/30 cursor-pointer transition-all ${selectedIds.has(student.id) ? 'bg-indigo-50/15' : ''
                      }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(student.id)}
                        readOnly
                        className="w-4 h-4 text-indigo-755 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${student.color}`}>
                        {student.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 text-sm">{student.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{student.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{student.grade}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 text-[11px] font-semibold px-2 py-0.5 rounded-md">
                        New Admission
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-505 leading-relaxed font-medium">
                      {student.date.split(' ')[0]} {student.date.split(' ')[1]} {student.date.split(' ')[2]}
                      <div className="text-[10px] text-slate-400 font-bold">{student.date.split(' ')[3]} {student.date.split(' ')[4]}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Promotions section */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm relative">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Promotions ({mockPromotions.length})</h3>
                <p className="text-xs text-slate-400">Students promoted from Grade 6 to Grade 7.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-450">{selectedPromotionsCount} selected</span>
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allPromotionsSelected}
                  onChange={handleSelectAllPromotions}
                  className="w-4 h-4 text-indigo-600 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                />
                Select All
              </label>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3 w-4"></th>
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">From (Previous Class)</th>
                  <th className="py-2.5 px-3">Previous Roll No.</th>
                </tr>
              </thead>
              <tbody>
                {mockPromotions.map(student => (
                  <tr
                    key={student.id}
                    onClick={() => handleToggleStudent(student.id)}
                    className={`border-b border-slate-50/40 hover:bg-slate-50/30 cursor-pointer transition-all ${selectedIds.has(student.id) ? 'bg-indigo-50/15' : ''
                      }`}
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(student.id)}
                        readOnly
                        className="w-4 h-4 text-indigo-755 border-slate-350 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${student.color}`}>
                        {student.initials}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700 text-sm">{student.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 font-mono tracking-tight">{student.id}</div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-655">{student.from}</td>
                    <td className="py-3 px-3 text-xs font-semibold text-slate-500">{student.roll}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Footer controls bar */}
      <div className="mt-4 bg-white border border-slate-200 rounded-2xl px-6 py-4 shadow-md flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="bg-slate-100 text-slate-652 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-450" />
            <span className="font-bold">{selectedIds.size}</span> selected
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-emerald-600">New Admissions: <span className="font-bold">{selectedNewAdmissionsCount}</span></span>
          <span className="text-slate-200">•</span>
          <span className="text-indigo-600">Promotions: <span className="font-bold">{selectedPromotionsCount}</span></span>
        </div>

        <button
          onClick={handlePreviewAllocation}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
        >
          Preview Allocation
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}

export default Candidates;
