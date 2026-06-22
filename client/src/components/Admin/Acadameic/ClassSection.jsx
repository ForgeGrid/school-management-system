import React, { useState } from 'react'
import { OpenClass, CreateClassModal } from './CreateClass'

const initialClasses = [
  { id: 1,  grade: 'Grade 5 (A)',  code: 'G5-A',  year: '2025 – 2026', status: 'Active',   teacher: 'Priya N',   role: 'Hindi Teacher',     avatar: 'PN', students: 32, totalStudents: 40, subjects: 6, attendance: 87.5, timetable: 'Published'     },
  { id: 2,  grade: 'Grade 5 (B)',  code: 'G5-B',  year: '2025 – 2026', status: 'Active',   teacher: 'Rahul K',   role: 'Maths Teacher',     avatar: 'RK', students: 32, totalStudents: 40, subjects: 6, attendance: 82.4, timetable: 'Published'     },
  { id: 3,  grade: 'Grade 6 (A)',  code: 'G6-A',  year: '2025 – 2026', status: 'Active',   teacher: 'Anita R',   role: 'English Teacher',   avatar: 'AR', students: 35, totalStudents: 40, subjects: 7, attendance: 90.2, timetable: 'Published'     },
  { id: 4,  grade: 'Grade 6 (B)',  code: 'G6-B',  year: '2025 – 2026', status: 'Draft',    teacher: 'Vijay P',   role: 'Science Teacher',   avatar: 'VP', students: 33, totalStudents: 40, subjects: 7, attendance: 75.6, timetable: 'Not Published' },
  { id: 5,  grade: 'Grade 7 (A)',  code: 'G7-A',  year: '2025 – 2026', status: 'Active',   teacher: 'Divya S',   role: 'SST Teacher',       avatar: 'DS', students: 36, totalStudents: 45, subjects: 7, attendance: 88.1, timetable: 'Published'     },
  { id: 6,  grade: 'Grade 7 (B)',  code: 'G7-B',  year: '2025 – 2026', status: 'Draft',    teacher: 'Karthik M', role: 'Science Teacher',   avatar: 'KM', students: 30, totalStudents: 45, subjects: 7, attendance: 70.0, timetable: 'Not Published' },
  { id: 7,  grade: 'Grade 8 (A)',  code: 'G8-A',  year: '2025 – 2026', status: 'Active',   teacher: 'Meena R',   role: 'Computer Teacher',  avatar: 'MR', students: 38, totalStudents: 45, subjects: 8, attendance: 91.3, timetable: 'Published'     },
  { id: 8,  grade: 'Grade 8 (B)',  code: 'G8-B',  year: '2025 – 2026', status: 'Inactive', teacher: 'Arun S',    role: 'Maths Teacher',     avatar: 'AS', students: 0,  totalStudents: 45, subjects: 8, attendance: 0,    timetable: 'Not Published' },
  { id: 9,  grade: 'Grade 9 (A)',  code: 'G9-A',  year: '2025 – 2026', status: 'Active',   teacher: 'Sneha T',   role: 'Physics Teacher',   avatar: 'ST', students: 40, totalStudents: 50, subjects: 9, attendance: 93.0, timetable: 'Published'     },
  { id: 10, grade: 'Grade 9 (B)',  code: 'G9-B',  year: '2025 – 2026', status: 'Active',   teacher: 'Mohan L',   role: 'Chemistry Teacher', avatar: 'ML', students: 42, totalStudents: 50, subjects: 9, attendance: 85.0, timetable: 'Published'     },
  { id: 11, grade: 'Grade 10 (A)', code: 'G10-A', year: '2025 – 2026', status: 'Draft',    teacher: 'Rekha B',   role: 'Biology Teacher',   avatar: 'RB', students: 28, totalStudents: 50, subjects: 9, attendance: 65.0, timetable: 'Not Published' },
  { id: 12, grade: 'Grade 10 (B)', code: 'G10-B', year: '2025 – 2026', status: 'Active',   teacher: 'Suresh C',  role: 'English Teacher',   avatar: 'SC', students: 45, totalStudents: 50, subjects: 9, attendance: 89.5, timetable: 'Published'     },
]

const PAGE_SIZE = 8

const statusConfig = {
  Active:   'bg-green-100 text-green-600',
  Draft:    'bg-yellow-100 text-yellow-600',
  Inactive: 'bg-gray-100 text-gray-500',
}

const avatarColors = [
  'bg-blue-100 text-blue-600',
  'bg-pink-100 text-pink-600',
  'bg-amber-100 text-amber-600',
  'bg-teal-100 text-teal-600',
  'bg-purple-100 text-purple-600',
]

const CalIcon    = ({ className = 'w-3.5 h-3.5' }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
const UsersIcon  = ({ className = 'w-5 h-5' })     => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87m6 5.87H9m6 0v-2a4 4 0 00-3-3.87M9 20v-2a4 4 0 013-3.87M12 12a4 4 0 100-8 4 4 0 000 8z" /></svg>
const PersonIcon = ({ className = 'w-5 h-5' })     => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
const BookIcon   = ({ className = 'w-5 h-5' })     => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
const SearchIcon = ()                               => <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg>
const ResetIcon  = ()                               => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
const PlusIcon   = ()                               => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
const DotsIcon   = ()                               => <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>

function AttendanceRing({ value }) {
  const color = value >= 85 ? '#16a34a' : value >= 70 ? '#f59e0b' : '#ef4444'
  const r = 14, circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" className="flex-shrink-0">
      <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
      <circle cx="18" cy="18" r={r} fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform="rotate(-90 18 18)" />
    </svg>
  )
}

function StatCard({ iconBg, iconColor, icon, label, value, hint, hintColor }) {
  return (
    <div className="flex-1 min-w-0 bg-white border border-slate-200/80 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 mb-0.5 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-none mb-1">{value}</p>
        <p className={`text-xs truncate ${hintColor}`}>{hint}</p>
      </div>
    </div>
  )
}

function ClassCard({ cls, onOpen }) {
  const avatarColor  = avatarColors[cls.id % avatarColors.length]
  const isPublished  = cls.timetable === 'Published'
  const attendColor  = cls.attendance >= 85 ? 'text-green-600' : cls.attendance >= 70 ? 'text-yellow-500' : 'text-red-500'

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold text-slate-800">{cls.grade}</span>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusConfig[cls.status]}`}>{cls.status}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium">{cls.code}</span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CalIcon className="w-3 h-3" /> {cls.year}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColor}`}>
          {cls.avatar}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 leading-none mb-0.5">Class Teacher</p>
          <p className="text-sm font-semibold text-slate-800 leading-none mb-0.5 truncate">{cls.teacher}</p>
          <p className="text-[11px] text-slate-400 truncate">{cls.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 border-t border-slate-100 pt-3 gap-1">
        <div className="flex flex-col items-center gap-0.5">
          <UsersIcon className="w-5 h-5 text-indigo-400" />
          <span className="text-[9px] text-slate-400 text-center leading-tight mt-0.5">Students</span>
          <span className="text-xs font-semibold text-slate-700">{cls.students}/{cls.totalStudents}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <BookIcon className="w-5 h-5 text-indigo-400" />
          <span className="text-[9px] text-slate-400 text-center leading-tight mt-0.5">Subjects</span>
          <span className="text-xs font-semibold text-slate-700">{cls.subjects}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <AttendanceRing value={cls.attendance} />
          <span className="text-[9px] text-slate-400 text-center leading-tight">Attendance</span>
          <span className={`text-xs font-semibold ${attendColor}`}>{cls.attendance}%</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <CalIcon className="w-5 h-5 text-indigo-400" />
          <span className="text-[9px] text-slate-400 text-center leading-tight mt-0.5">Timetable</span>
          <span className={`text-[10px] font-semibold text-center leading-tight ${isPublished ? 'text-green-600' : 'text-orange-500'}`}>
            {isPublished ? 'Published' : 'Not Published'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex-1 border border-slate-200 text-indigo-600 text-sm font-medium py-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Open Class
        </button>
        <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-400 transition-colors">
          <DotsIcon />
        </button>
      </div>
    </div>
  )
}

export function ClassSection() {
  const [allClasses, setAllClasses]     = useState(initialClasses)
  const [page, setPage]                 = useState(1)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [openClass, setOpenClass]       = useState(null)
  const [showCreate, setShowCreate]     = useState(false)   // ← controls modal

  const filtered = allClasses.filter(c => {
    const matchSearch = c.grade.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All Status' || c.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleCreated = (newClass) => {
    setAllClasses(prev => [newClass, ...prev])
  }

  return (
    <div className="flex flex-col gap-5 h-full overflow-hidden">

      {openClass ? (
        <OpenClass cls={openClass} onBack={() => setOpenClass(null)} />
      ) : (
        <>
          {/* Page Header */}
          <div className="flex items-start justify-between flex-wrap gap-3 flex-shrink-0">
            <div>
              <h1 className="text-xl font-bold text-slate-800">Class Sections</h1>
              <p className="text-sm text-slate-400 mt-0.5">Manage all class sections, teachers, students, attendance and timetables.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
                <CalIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-slate-500">Academic Year</span>
                <span className="font-semibold text-slate-700">2025 – 2026</span>
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {/* ✅ onClick wired to open the modal */}
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <PlusIcon /> Create Class Section
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="flex gap-3 flex-shrink-0">
            <StatCard iconBg="bg-indigo-50" iconColor="text-indigo-500" icon={<UsersIcon className="w-5 h-5" />}  label="Total Classes"            value={allClasses.length} hint={`Active classes ${allClasses.filter(c=>c.status==='Active').length}`} hintColor="text-green-600" />
            <StatCard iconBg="bg-green-50"  iconColor="text-green-500"  icon={<UsersIcon className="w-5 h-5" />}  label="Total Students"           value={allClasses.reduce((a,c)=>a+c.students,0)} hint="Across all classes" hintColor="text-slate-400" />
            <StatCard iconBg="bg-orange-50" iconColor="text-orange-400" icon={<PersonIcon className="w-5 h-5" />} label="Class Teachers Assigned"  value={allClasses.filter(c=>c.teacher!=='—').length} hint={`Out of ${allClasses.length} classes`} hintColor="text-slate-400" />
            <StatCard iconBg="bg-blue-50"   iconColor="text-blue-500"   icon={<CalIcon className="w-5 h-5" />}    label="Published Timetables"     value={allClasses.filter(c=>c.timetable==='Published').length} hint={`Out of ${allClasses.length} classes`} hintColor="text-slate-400" />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 border border-slate-200 bg-white rounded-lg px-3 py-2 flex-1 min-w-[200px] shadow-sm">
              <SearchIcon />
              <input
                className="text-sm text-slate-600 outline-none bg-transparent w-full placeholder-slate-400"
                placeholder="Search class by grade, section or code..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            {['All Grades','All Sections'].map(label => (
              <select key={label} className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors">
                <option>{label}</option>
                {label === 'All Grades'   && ['Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10'].map(g => <option key={g}>{g}</option>)}
                {label === 'All Sections' && ['Section A','Section B'].map(s => <option key={s}>{s}</option>)}
              </select>
            ))}
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
              className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors"
            >
              {['All Status','Active','Draft','Inactive'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select className="border border-slate-200 bg-white rounded-lg px-3 py-2 text-sm text-slate-600 outline-none shadow-sm cursor-pointer hover:border-slate-300 transition-colors">
              <option>All Class Teachers</option>
            </select>
            <button
              onClick={() => { setSearch(''); setStatusFilter('All Status'); setPage(1) }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 border border-slate-200 bg-white rounded-lg shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ResetIcon /> Reset
            </button>
          </div>

          {/* Cards Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 pb-1">
              {paginated.map(cls => (
                <ClassCard key={cls.id} cls={cls} onOpen={() => setOpenClass(cls)} />
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between flex-shrink-0 pt-1">
            <p className="text-sm text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} class sections
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${
                    n === page ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}>{n}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors">›</button>
            </div>
          </div>
        </>
      )}

      {/* ✅ Modal renders on top of everything */}
      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

    </div>
  )
}

export default ClassSection