import React, { useState } from 'react'

const enrolledStudents = [
  { id: 1,  name: 'Aarav Sharma',    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&q=80&w=80&h=80', roll: '01', admission: 'ADM-2025-001', gender: 'Male',   dob: '12 Jul 2014', status: 'Active' },
  { id: 2,  name: 'Ananya Singh',    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=80&h=80', roll: '02', admission: 'ADM-2025-002', gender: 'Female', dob: '18 Aug 2014', status: 'Active' },
  { id: 3,  name: 'Vihaan Patel',    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80', roll: '03', admission: 'ADM-2025-003', gender: 'Male',   dob: '21 May 2014', status: 'Active' },
  { id: 4,  name: 'Myra Iyer',       image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=80&h=80', roll: '04', admission: 'ADM-2025-004', gender: 'Female', dob: '03 Sep 2014', status: 'Active' },
  { id: 5,  name: 'Arjun Kumar',     image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80&h=80', roll: '05', admission: 'ADM-2025-005', gender: 'Male',   dob: '11 Jan 2015', status: 'Active' },
  { id: 6,  name: 'Siya Reddy',      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=80&h=80', roll: '06', admission: 'ADM-2025-006', gender: 'Female', dob: '27 Feb 2015', status: 'Active' },
  { id: 7,  name: 'Krish Mehta',     image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=80&h=80', roll: '07', admission: 'ADM-2025-007', gender: 'Male',   dob: '16 Mar 2015', status: 'Active' },
  { id: 8,  name: 'Aadhya Nair',     image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80', roll: '08', admission: 'ADM-2025-008', gender: 'Female', dob: '05 Apr 2015', status: 'Active' },
  { id: 9,  name: 'Rivik Jain',      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=80&h=80', roll: '09', admission: 'ADM-2025-009', gender: 'Male',   dob: '30 May 2015', status: 'Active' },
  { id: 10, name: 'Ishita Verma',    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=80&h=80', roll: '10', admission: 'ADM-2025-010', gender: 'Female', dob: '14 Jun 2015', status: 'Active' },
  { id: 11, name: 'Dev Sharma',      image: 'https://i.pravatar.cc/80?img=11', roll: '11', admission: 'ADM-2025-011', gender: 'Male',   dob: '02 Jan 2015', status: 'Active' },
  { id: 12, name: 'Priya Gupta',     image: 'https://i.pravatar.cc/80?img=12', roll: '12', admission: 'ADM-2025-012', gender: 'Female', dob: '19 Nov 2014', status: 'Active' },
  { id: 13, name: 'Rohit Deshmukh',  image: 'https://i.pravatar.cc/80?img=13', roll: '13', admission: 'ADM-2025-013', gender: 'Male',   dob: '08 Feb 2014', status: 'Active' },
  { id: 14, name: 'Kavya Menon',     image: 'https://i.pravatar.cc/80?img=14', roll: '14', admission: 'ADM-2025-014', gender: 'Female', dob: '25 Mar 2014', status: 'Active' },
  { id: 15, name: 'Aditya Rao',      image: 'https://i.pravatar.cc/80?img=15', roll: '15', admission: 'ADM-2025-015', gender: 'Male',   dob: '17 Apr 2014', status: 'Active' },
  { id: 16, name: 'Sneha Pillai',    image: 'https://i.pravatar.cc/80?img=16', roll: '16', admission: 'ADM-2025-016', gender: 'Female', dob: '09 May 2014', status: 'Active' },
  { id: 17, name: 'Vivaan Chopra',   image: 'https://i.pravatar.cc/80?img=17', roll: '17', admission: 'ADM-2025-017', gender: 'Male',   dob: '22 Jun 2014', status: 'Active' },
  { id: 18, name: 'Diya Kapoor',     image: 'https://i.pravatar.cc/80?img=18', roll: '18', admission: 'ADM-2025-018', gender: 'Female', dob: '14 Jul 2014', status: 'Active' },
  { id: 19, name: 'Kabir Malhotra',  image: 'https://i.pravatar.cc/80?img=19', roll: '19', admission: 'ADM-2025-019', gender: 'Male',   dob: '03 Aug 2014', status: 'Active' },
  { id: 20, name: 'Anvi Saxena',     image: 'https://i.pravatar.cc/80?img=20', roll: '20', admission: 'ADM-2025-020', gender: 'Female', dob: '28 Sep 2014', status: 'Active' },
  { id: 21, name: 'Reyansh Bhat',    image: 'https://i.pravatar.cc/80?img=21', roll: '21', admission: 'ADM-2025-021', gender: 'Male',   dob: '11 Oct 2014', status: 'Active' },
  { id: 22, name: 'Sara Thomas',     image: 'https://i.pravatar.cc/80?img=22', roll: '22', admission: 'ADM-2025-022', gender: 'Female', dob: '06 Nov 2014', status: 'Active' },
  { id: 23, name: 'Dhruv Agarwal',   image: 'https://i.pravatar.cc/80?img=23', roll: '23', admission: 'ADM-2025-023', gender: 'Male',   dob: '18 Dec 2014', status: 'Active' },
  { id: 24, name: 'Tara Hegde',      image: 'https://i.pravatar.cc/80?img=24', roll: '24', admission: 'ADM-2025-024', gender: 'Female', dob: '29 Jan 2015', status: 'Active' },
  { id: 25, name: 'Ayaan Sheikh',    image: 'https://i.pravatar.cc/80?img=25', roll: '25', admission: 'ADM-2025-025', gender: 'Male',   dob: '15 Feb 2015', status: 'Active' },
  { id: 26, name: 'Nisha Kulkarni',  image: 'https://i.pravatar.cc/80?img=26', roll: '26', admission: 'ADM-2025-026', gender: 'Female', dob: '07 Mar 2015', status: 'Active' },
  { id: 27, name: 'Arnav Mishra',    image: 'https://i.pravatar.cc/80?img=27', roll: '27', admission: 'ADM-2025-027', gender: 'Male',   dob: '20 Apr 2015', status: 'Active' },
  { id: 28, name: 'Riya Chatterjee', image: 'https://i.pravatar.cc/80?img=28', roll: '28', admission: 'ADM-2025-028', gender: 'Female', dob: '12 May 2015', status: 'Active' },
  { id: 29, name: 'Sai Prasad',      image: 'https://i.pravatar.cc/80?img=29', roll: '29', admission: 'ADM-2025-029', gender: 'Male',   dob: '24 Jun 2015', status: 'Active' },
  { id: 30, name: 'Meera Joshy',     image: 'https://i.pravatar.cc/80?img=30', roll: '30', admission: 'ADM-2025-030', gender: 'Female', dob: '08 Jul 2015', status: 'Active' },
  { id: 31, name: 'Tanish Soni',     image: 'https://i.pravatar.cc/80?img=31', roll: '31', admission: 'ADM-2025-031', gender: 'Male',   dob: '16 Aug 2015', status: 'Active' },
  { id: 32, name: 'Kiara Fernandes', image: 'https://i.pravatar.cc/80?img=32', roll: '32', admission: 'ADM-2025-032', gender: 'Female', dob: '21 Sep 2015', status: 'Active' },
]

const avatarColors = [
  'bg-indigo-100 text-indigo-600',
  'bg-pink-100 text-pink-600',
  'bg-amber-100 text-amber-600',
  'bg-teal-100 text-teal-600',
  'bg-purple-100 text-purple-600',
  'bg-blue-100 text-blue-600',
  'bg-green-100 text-green-600',
  'bg-rose-100 text-rose-600',
]

const PAGE_SIZE = 10

const CalIcon        = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
const GradeIcon      = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
const SectionIcon    = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
const CodeIcon       = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
const UsersIcon      = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>
const CheckIcon      = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const XCircleIcon    = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const ClockIcon      = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
const BookIcon       = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
const TimetableIcon  = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
const SearchIcon     = ()                            => <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
const FilterIcon     = ()                            => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
const EyeIcon        = ()                            => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
const DotsIcon       = ()                            => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
const PlusIcon       = ()                            => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
const BackIcon       = ()                            => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
const EditIcon       = ()                            => <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
const PersonIcon     = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
const EnrollIcon     = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
const AttendanceIcon = ({ className = 'w-4 h-4' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
const XIcon          = ()                            => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>

// ── Quick Action ──────────────────────────────────────────────────────────────
function QuickAction({ icon, label, sub, color }) {
  return (
    <button className={`flex items-center gap-3 p-3 rounded-xl border ${color} hover:opacity-90 transition-opacity text-left w-full`}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/70 flex-shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold leading-none mb-0.5">{label}</p>
        <p className="text-[11px] opacity-70 leading-none">{sub}</p>
      </div>
    </button>
  )
}

// ── Stat Pill ─────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, sub, valueColor = 'text-slate-800', isEnrolled = false, isTimetable = false, iconBg = 'bg-slate-50', iconColor = 'text-slate-500' }) {
  return (
    <div className="flex-1 min-w-[150px] bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden h-[110px]">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide truncate">{label}</p>
      </div>
      {isTimetable ? (
        <div className="flex flex-col mt-auto leading-none">
          <span className={`text-lg font-extrabold ${valueColor}`}>{value}</span>
          {sub && <span className="text-[10px] font-medium text-slate-400 mt-1 shrink-0">{sub}</span>}
        </div>
      ) : (
        <div className="flex items-baseline gap-1 mt-auto">
          <span className={`text-2xl font-extrabold ${valueColor}`}>{value}</span>
          {sub && <span className="text-xs font-semibold text-slate-400 ml-1 shrink-0">{sub}</span>}
        </div>
      )}
      {isEnrolled && (
        <div className="absolute bottom-0 left-0 right-0 h-[4px] bg-indigo-600" style={{ width: '80%' }} />
      )}
    </div>
  )
}

// ── Create Class Modal ────────────────────────────────────────────────────────
export function CreateClassModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    grade: '', section: '', code: '', year: '2025 – 2026',
    capacity: '', status: 'Active', teacher: '', subjects: '', notes: ''
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.grade)   e.grade   = 'Grade is required'
    if (!form.section) e.section = 'Section is required'
    if (!form.year)    e.year    = 'Academic year is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    const gradeNum  = form.grade.replace('Grade ', '')
    const autoCode  = form.code.trim() || `G${gradeNum}-${form.section}`
    const teacherName = form.teacher || ''
    const initials  = teacherName
      ? teacherName.split(' ').map(w => w[0]).join('').toUpperCase()
      : '—'

    const newClass = {
      id:           Date.now(),
      grade:        `${form.grade} (${form.section})`,
      code:         autoCode,
      year:         form.year,
      status:       form.status,
      teacher:      teacherName || '—',
      role:         '—',
      avatar:       initials,
      students:     0,
      totalStudents: Number(form.capacity) || 40,
      subjects:     Number(form.subjects)  || 0,
      attendance:   0,
      timetable:    'Not Published',
    }

    onCreated(newClass)
    onClose()
  }

  const Field = ({ label, error, required, children }) => (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-500">{error}</p>}
    </div>
  )

  const inputCls = (err) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-slate-700 outline-none bg-white transition-colors ${
      err ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-indigo-400'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-800">Create Class Section</h2>
            <p className="text-xs text-slate-400 mt-0.5">Fill in the details to add a new class section.</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 transition-colors"
          >
            <XIcon />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-4">

          {/* Section label */}
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest">Basic Information</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Grade / Standard" required error={errors.grade}>
              <select value={form.grade} onChange={e => set('grade', e.target.value)} className={inputCls(errors.grade)}>
                <option value="">Select grade</option>
                {['Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'].map(g => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>

            <Field label="Section" required error={errors.section}>
              <select value={form.section} onChange={e => set('section', e.target.value)} className={inputCls(errors.section)}>
                <option value="">Select section</option>
                {['A','B','C','D'].map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Class Code">
              <input
                type="text"
                placeholder="e.g. G5-A (auto if blank)"
                value={form.code}
                onChange={e => set('code', e.target.value)}
                className={inputCls(false)}
              />
            </Field>

            <Field label="Academic Year" required error={errors.year}>
              <select value={form.year} onChange={e => set('year', e.target.value)} className={inputCls(errors.year)}>
                <option>2025 – 2026</option>
                <option>2026 – 2027</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Max Capacity">
              <input
                type="number"
                min="1"
                placeholder="e.g. 40"
                value={form.capacity}
                onChange={e => set('capacity', e.target.value)}
                className={inputCls(false)}
              />
            </Field>

            <Field label="Status">
              <select value={form.status} onChange={e => set('status', e.target.value)} className={inputCls(false)}>
                <option>Active</option>
                <option>Draft</option>
                <option>Inactive</option>
              </select>
            </Field>
          </div>

          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mt-1">Class Teacher</p>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Assign Class Teacher">
              <select value={form.teacher} onChange={e => set('teacher', e.target.value)} className={inputCls(false)}>
                <option value="">Select teacher</option>
                <option>Priya N</option>
                <option>Rahul K</option>
                <option>Anita R</option>
                <option>Vijay P</option>
                <option>Divya S</option>
                <option>Karthik M</option>
                <option>Meena R</option>
                <option>Arun S</option>
                <option>Sneha T</option>
                <option>Mohan L</option>
              </select>
            </Field>

            <Field label="Number of Subjects">
              <input
                type="number"
                min="1"
                placeholder="e.g. 6"
                value={form.subjects}
                onChange={e => set('subjects', e.target.value)}
                className={inputCls(false)}
              />
            </Field>
          </div>

          <Field label="Notes / Description">
            <textarea
              rows={3}
              placeholder="Optional notes about this class section…"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className={`${inputCls(false)} resize-none`}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-100 flex-shrink-0 bg-slate-50/60 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            <PlusIcon /> Create Class Section
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Open Class ────────────────────────────────────────────────────────────────
export function OpenClass({ cls, onBack }) {
  const [activeTab, setActiveTab] = useState('Students')
  const [search, setSearch]       = useState('')
  const [page, setPage]           = useState(1)

  const grade   = cls?.grade   ?? 'Grade 5 (A)'
  const code    = cls?.code    ?? 'G5-A'
  const status  = cls?.status  ?? 'Active'
  const teacher = cls?.teacher ?? 'Priya N'
  const role    = cls?.role    ?? 'Hindi Teacher'
  const avatar  = cls?.avatar  ?? 'PN'

  const tabs = [
    { label: 'Students',         icon: <UsersIcon /> },
    { label: 'Subject Teachers', icon: <PersonIcon /> },
    { label: 'Timetable',        icon: <TimetableIcon /> },
    { label: 'Attendance',       icon: <AttendanceIcon /> },
  ]

  const filtered   = enrolledStudents.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admission.toLowerCase().includes(search.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statusColors = {
    Active:   'bg-green-100 text-green-600',
    Draft:    'bg-yellow-100 text-yellow-600',
    Inactive: 'bg-gray-100 text-gray-500',
  }

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">

      {/* Breadcrumb + Header Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex-shrink-0">
        <div className="flex items-start justify-between gap-5 flex-wrap md:flex-nowrap">
          
          {/* Left Side: Title & Info Details */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Title & Back */}
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 transition-colors shadow-sm shrink-0"
              >
                <BackIcon />
              </button>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold text-slate-800">{grade}</h1>
                  <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Academic › Class Section › {grade}</p>
              </div>
            </div>

            {/* Info Grid (Academic details) */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 mt-1 pb-4 border-b border-slate-100">
              {[
                { icon: <CalIcon className="w-4 h-4 text-slate-400" />,     label: 'Academic Year', value: '2025 - 2026' },
                { icon: <GradeIcon className="w-4 h-4 text-slate-400" />,   label: 'Standard',     value: grade.split(' (')[0] },
                { icon: <SectionIcon className="w-4 h-4 text-slate-400" />, label: 'Section',      value: grade.includes('(') ? grade.split('(')[1].replace(')','') : 'A' },
                { icon: <CodeIcon className="w-4 h-4 text-slate-400" />,    label: 'Class Code',   value: code },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5 leading-none">{label}</p>
                    <p className="text-sm font-bold text-slate-700 leading-none">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Created info row */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <PersonIcon className="w-4 h-4 text-slate-400" />
                <span>Created By <span className="font-bold text-slate-600">Prithvivaraj (School Admin)</span></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalIcon className="w-4 h-4 text-slate-400" />
                <span>Created On <span className="font-bold text-slate-600">10 Jun 2025, 10:30 AM</span></span>
              </div>
            </div>
          </div>

          {/* Right Side: Class Teacher Card */}
          <div className="w-full md:w-[320px] shrink-0 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col justify-between self-stretch">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2.5">Class Teacher</span>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="https://images.unsplash.com/photo-1580894732444-8fecef2271ff?auto=format&fit=crop&q=80&w=120&h=120"
                  alt={teacher}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate leading-none mb-1">{teacher}</p>
                  <p className="text-xs text-slate-400 truncate leading-none mb-1">{role}</p>
                  <a href={`mailto:${teacher.toLowerCase().replace(' ','.')}@school.com`} className="text-xs text-indigo-500 hover:underline truncate block leading-none">
                    {teacher.toLowerCase().replace(' ','.')}@school.com
                  </a>
                </div>
              </div>
              
              <a
                href={`mailto:${teacher.toLowerCase().replace(' ','.')}@school.com`}
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors shrink-0 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-4 pr-0.5">

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          <QuickAction icon={<EnrollIcon className="w-4 h-4 text-indigo-600" />}    label="Enroll Students"  sub="Add more students"         color="border-indigo-100 bg-indigo-50 text-indigo-700" />
          <QuickAction icon={<PersonIcon className="w-4 h-4 text-green-600" />}     label="Assign Teachers"  sub="Allocate subject teachers"  color="border-green-100 bg-green-50 text-green-700" />
          <QuickAction icon={<AttendanceIcon className="w-4 h-4 text-blue-600" />}  label="Attendance"       sub="Mark & view attendance"     color="border-blue-100 bg-blue-50 text-blue-700" />
          <QuickAction icon={<TimetableIcon className="w-4 h-4 text-orange-500" />} label="Timetable"        sub="View class timetable"       color="border-orange-100 bg-orange-50 text-orange-700" />
        </div>

        {/* Stats Pills */}
        <div className="flex gap-3 overflow-x-auto pb-1 flex-shrink-0">
          <StatPill icon={<UsersIcon />}      label="Enrolled Students" value={cls?.students ?? 32}   sub={`/ ${cls?.totalStudents ?? 40} Capacity`} isEnrolled={true} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
          <StatPill icon={<CheckIcon />}      label="Present Today"     value="28"                    valueColor="text-slate-800"  sub="87.5%" iconBg="bg-green-50" iconColor="text-green-600" />
          <StatPill icon={<XCircleIcon />}    label="Absent Today"      value="3"                     valueColor="text-slate-800"  sub="9.4%" iconBg="bg-red-50" iconColor="text-red-500" />
          <StatPill icon={<ClockIcon />}      label="Late Today"        value="1"                     valueColor="text-slate-800"  sub="3.1%" iconBg="bg-amber-50" iconColor="text-amber-500" />
          <StatPill icon={<BookIcon />}       label="Subjects"          value={cls?.subjects ?? 6}    sub="Assigned" iconBg="bg-purple-50" iconColor="text-purple-600" />
          <StatPill icon={<TimetableIcon />}  label="Timetable Status"  value={cls?.timetable ?? 'Published'} valueColor="text-green-600" sub="Updated 2 days ago" isTimetable={true} iconBg="bg-blue-50" iconColor="text-blue-600" />
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-200 flex-shrink-0">
          {tabs.map(({ label, icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === label
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Students Tab */}
        {activeTab === 'Students' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2 flex-wrap flex-shrink-0">
              <p className="text-sm font-semibold text-slate-700">Enrolled Students ({filtered.length})</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-1.5 shadow-sm">
                  <SearchIcon />
                  <input
                    className="text-sm text-slate-600 outline-none bg-transparent placeholder-slate-400 w-36"
                    placeholder="Search students..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                  />
                </div>
                <button className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 shadow-sm transition-colors">
                  <FilterIcon /> Filter
                </button>
                <button className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-sm">
                  <PlusIcon /> Enroll Student
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {['#','Student','Roll No.','Admission No.','Gender','Date of Birth','Status','Actions'].map(h => (
                        <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((s, i) => (
                      <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                        <td className="px-3 py-2.5 text-slate-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            {s.image ? (
                              <img
                                src={s.image}
                                alt={s.name}
                                className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${avatarColors[s.id % avatarColors.length]}`}>
                                {s.avatar}
                              </div>
                            )}
                            <span className="font-medium text-slate-700 whitespace-nowrap">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs">{s.roll}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs">{s.admission}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs">{s.gender}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-xs whitespace-nowrap">{s.dob}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-600">{s.status}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 transition-colors"><EyeIcon /></button>
                            <button className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-400 transition-colors"><DotsIcon /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between px-3 py-2.5 border-t border-slate-100 bg-slate-50/40">
                <p className="text-xs text-slate-400">
                  Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} students
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 text-sm transition-colors">‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => setPage(n)}
                      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-medium border transition-colors ${
                        n === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}>{n}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 text-sm transition-colors">›</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs placeholder */}
        {activeTab !== 'Students' && (
          <div className="flex items-center justify-center bg-white border border-slate-200/80 rounded-xl py-16 flex-shrink-0">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3 text-indigo-400">
                {tabs.find(t => t.label === activeTab)?.icon}
              </div>
              <p className="text-sm font-semibold text-slate-600">{activeTab}</p>
              <p className="text-xs text-slate-400 mt-1">Content coming soon</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default OpenClass