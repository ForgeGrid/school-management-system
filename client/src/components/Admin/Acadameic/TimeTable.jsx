import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

// Mock list of prospective candidates for Section Enrollment
const mockNewAdmissions = [
  { id: 'ADM-2026-010', name: 'Arjun Sharma', grade: 'Grade 7', type: 'New Admission', date: '25 Jun 2026 10:30 AM', initials: 'AS', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
  { id: 'ADM-2026-011', name: 'Riya Singh', grade: 'Grade 7', type: 'New Admission', date: '25 Jun 2026 10:15 AM', initials: 'RS', color: 'bg-blue-50 text-blue-600 border-blue-100' },
];

const mockPromotions = [
  { id: 'ADM-2026-005', name: 'Yogesh Balaji', from: 'Grade 6 (A)', year: '2028-29', roll: '5', initials: 'YB', color: 'bg-rose-50 text-rose-600 border-rose-100' },
  { id: 'ADM-2026-003', name: 'Sukesh D', from: 'Grade 6 (A)', year: '2028-29', roll: '4', initials: 'SD', color: 'bg-teal-50 text-teal-600 border-teal-100' },
  { id: 'ADM-2026-001', name: 'Prithiviraaj J N', from: 'Grade 6 (A)', year: '2028-29', roll: '3', initials: 'PJ', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { id: 'ADM-2026-004', name: 'N Vera Aditya', from: 'Grade 6 (A)', year: '2028-29', roll: '2', initials: 'NA', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { id: 'ADM-2026-002', name: 'Dhakshinyaa J N', from: 'Grade 6 (A)', year: '2028-29', roll: '1', initials: 'DJ', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
];

export function Timetable() {
  const [step, setStep] = useState(1); // 1 = Candidates, 2 = Preview, 3 = Confirm/Success
  const [selectionMode, setSelectionMode] = useState('manual'); // 'manual' or 'auto'

  // Pre-select the 5 promotions to match the mock UI out of the box
  const [selectedIds, setSelectedIds] = useState(new Set([
    'ADM-2026-005',
    'ADM-2026-003',
    'ADM-2026-001',
    'ADM-2026-004',
    'ADM-2026-002'
  ]));
  const [loading, setLoading] = useState(false);

  // Class info details
  const classInfo = {
    grade: 'Grade 7 (A)',
    code: 'G7-A',
    year: '2029 - 30',
    capacity: 20,
    currentStrength: 0,
  };

  const availableSeats = classInfo.capacity - classInfo.currentStrength - selectedIds.size;

  // Simulate API load on initial mount or when class changes
  useEffect(() => {
    simulateGetCandidates();
  }, []);

  const simulateGetCandidates = () => {
    setLoading(true);
    console.log('API CALL TRIGGERED:');
    console.log(`GET /student-enrollment/candidates?academicYear=${classInfo.year}&classSection_id=${classInfo.code}`);

    // Simulate loading behavior
    setTimeout(() => {
      setLoading(false);
      toast.success('Loaded student eligibility candidates.', {
        description: 'GET /student-enrollment/candidates successful'
      });
    }, 600);
  };

  const handleSelectAllAdmissions = (e) => {
    const updated = new Set(selectedIds);
    if (e.target.checked) {
      mockNewAdmissions.forEach(student => updated.add(student.id));
    } else {
      mockNewAdmissions.forEach(student => updated.delete(student.id));
    }
    setSelectedIds(updated);
  };

  const handleSelectAllPromotions = (e) => {
    const updated = new Set(selectedIds);
    if (e.target.checked) {
      mockPromotions.forEach(student => updated.add(student.id));
    } else {
      mockPromotions.forEach(student => updated.delete(student.id));
    }
    setSelectedIds(updated);
  };

  const handleToggleStudent = (id) => {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      // Enforce capacity bounds
      if (updated.size >= classInfo.capacity) {
        toast.error('Limit reached', { description: `Class section capacity is capped at ${classInfo.capacity} students.` });
        return;
      }
      updated.add(id);
    }
    setSelectedIds(updated);
  };

  // Implement Auto-Allocation mock strategy
  const handleAutoAllocate = () => {
    setSelectionMode('auto');
    const updated = new Set();
    // Fill up to class capacity starting with Admissions then Promotions
    let count = 0;
    mockNewAdmissions.forEach(s => {
      if (count < classInfo.capacity) {
        updated.add(s.id);
        count++;
      }
    });
    mockPromotions.forEach(s => {
      if (count < classInfo.capacity) {
        updated.add(s.id);
        count++;
      }
    });
    setSelectedIds(updated);
    toast.info('Auto-allocation complete', {
      description: `Optimally selected ${updated.size} candidates fitting the available capacity.`
    });
  };

  const allAdmissionsSelected = mockNewAdmissions.every(s => selectedIds.has(s.id));
  const allPromotionsSelected = mockPromotions.every(s => selectedIds.has(s.id));

  const selectedNewAdmissionsCount = mockNewAdmissions.filter(s => selectedIds.has(s.id)).length;
  const selectedPromotionsCount = mockPromotions.filter(s => selectedIds.has(s.id)).length;

  const handlePreviewAllocation = () => {
    if (selectedIds.size === 0) {
      toast.error('No selected candidates', { description: 'Please select at least one student before previewing.' });
      return;
    }
    console.log('STEP 2: PREVIEW ALLOCATION ACTION');
    console.log('Selected Candidate IDs for allocation:', Array.from(selectedIds));
    setStep(2);
  };

  const handleConfirmAllocation = () => {
    setLoading(true);
    console.log('API CALL TRIGGERED:');
    console.log('POST /student-enrollment/confirm-allocation');
    console.log('Payload:', {
      classSection_id: classInfo.code,
      academicYear: classInfo.year,
      studentIds: Array.from(selectedIds)
    });

    setTimeout(() => {
      setLoading(false);
      setStep(3);
      toast.success('Students successfully enrolled', {
        description: 'POST /student-enrollment/confirm-allocation status 200'
      });
    }, 1000);
  };

  const handleResetFlow = () => {
    setSelectedIds(new Set());
    setSelectionMode('manual');
    setStep(1);
  };

  return (
    <div className="flex flex-col gap-6 h-full overflow-hidden text-slate-700 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm">

      {/* ── HEADER & STEPPER ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            {step === 1 ? 'Enroll Students' : step === 2 ? 'Preview Allocation' : 'Success'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {step === 1
              ? 'Select eligible students to enroll into the class.'
              : step === 2
                ? 'Review the selected students before confirming enrollment.'
                : 'Students allocation finalized.'}
          </p>
        </div>

        {/* 3-Step Stepper Progress Bar */}
        <div className="flex items-center gap-2">
          {/* Step 1 Candidates */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 1
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
              : 'border border-slate-205 text-slate-400 bg-slate-50'
              }`}>1</div>
            <span className={`text-xs font-semibold ${step === 1 ? 'text-indigo-650 font-bold' : 'text-slate-400'}`}>Candidates</span>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 2 Preview */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 2
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
              : 'border border-slate-205 text-slate-400 bg-slate-50'
              }`}>2</div>
            <span className={`text-xs font-semibold ${step === 2 ? 'text-indigo-650 font-bold' : 'text-slate-400'}`}>Preview</span>
          </div>

          <div className="w-8 h-px bg-slate-200" />

          {/* Step 3 Confirm */}
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${step === 3
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 font-bold'
              : 'border border-slate-205 text-slate-400 bg-slate-50'
              }`}>3</div>
            <span className={`text-xs font-semibold ${step === 3 ? 'text-indigo-650 font-bold' : 'text-slate-400'}`}>Confirm</span>
          </div>
        </div>
      </div>

      {/* ── SHARED REUSABLE CLASS SECTION CARD ── */}
      {(step === 1 || step === 2) && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-800">{classInfo.grade}</h2>
                <span className="bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-100">
                  Active
                </span>
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

          <div className="flex items-center gap-8 pr-4 flex-wrap sm:flex-nowrap">
            <div className="text-center min-w-[70px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Capacity</span>
              <span className="text-xl font-bold text-slate-800">{classInfo.capacity}</span>
            </div>
            <div className="h-8 w-px bg-slate-150 hidden sm:block" />
            <div className="text-center min-w-[70px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Current Strength</span>
              <span className="text-xl font-bold text-slate-800">{classInfo.currentStrength}</span>
            </div>
            <div className="h-8 w-px bg-slate-150 hidden sm:block" />
            <div className="text-center min-w-[70px]">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mb-1">Available Seats</span>
              <span className={`text-xl font-extrabold ${availableSeats > 0 ? 'text-green-600' : 'text-red-500'}`}>{availableSeats}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 1: CANDIDATES VIEW ── */}
      {step === 1 && (
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
              onClick={() => setSelectedIds(new Set())}
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
      )}

      {/* ── STEP 2: PREVIEW ALLOCATION VIEW ── */}
      {step === 2 && (
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
            <span>These students will be enrolled into Grade 7 (A) for Academic Year 2029-30.</span>
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
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 px-4 py-2 border border-slate-205 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Candidates
            </button>

            <button
              onClick={handleConfirmAllocation}
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
      )}

      {/* ── STEP 3: ENROLLMENT SUCCESSFUL VIEW ── */}
      {step === 3 && (() => {
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
                  {selectedIds.size} students have been enrolled into {classInfo.grade} for Academic Year 2029-30.
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
                onClick={handleResetFlow}
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
                  handleResetFlow();
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
      })()}

    </div>
  );
}

export default Timetable;