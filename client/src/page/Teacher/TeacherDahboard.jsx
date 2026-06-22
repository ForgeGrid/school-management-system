import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slice/getmeslice';
import { logoutUserThunk } from '../../redux/slice/authslice';
import { selectUser, selectSchool } from '../../redux/slice/getmeSelector';
import { toast } from 'sonner';
import { 
  BookOpen, 
  Calendar, 
  Clock, 
  Users, 
  Award, 
  Bell, 
  LogOut, 
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Search,
  ChevronRight
} from 'lucide-react';

const TeacherDahboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const school = useSelector(selectSchool);
  
  const [activeTab, setActiveTab] = useState('Overview');

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      dispatch(logout());
      toast.success("Successfully logged out");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed, please try again");
    }
  };

  // Mock data for Teacher Dashboard
  const classes = [
    { id: 1, name: "Grade 10 - A", subject: "Mathematics", time: "09:00 AM - 09:45 AM", room: "Room 102", students: 32 },
    { id: 2, name: "Grade 11 - B", subject: "Calculus", time: "11:00 AM - 11:45 AM", room: "Room 204", students: 28 },
    { id: 3, name: "Grade 10 - C", subject: "Geometry", time: "01:30 PM - 02:15 PM", room: "Room 102", students: 30 },
  ];

  const announcements = [
    { id: 1, title: "Staff Meeting Today", content: "Agenda: Upcoming midterm examination planning at 03:30 PM in the Conference Room.", time: "1 hour ago", urgent: true },
    { id: 2, title: "Syllabus Update", content: "Mathematics curriculum for Grade 10 has been updated in the portal guidelines.", time: "4 hours ago", urgent: false },
    { id: 3, title: "Parent-Teacher Meet", content: "Scheduled for next Saturday. Slot booking links sent to all parents.", time: "1 day ago", urgent: false },
  ];

  const recentSubmissions = [
    { id: 1, student: "Aarav Sharma", assignment: "Calculus Limits Homework", status: "Pending Grade", date: "Today, 10:15 AM" },
    { id: 2, student: "Diya Patel", assignment: "Geometry Assignment 3", status: "Graded", grade: "A+", date: "Yesterday" },
    { id: 3, student: "Rohan Gupta", assignment: "Trigonometry Project", status: "Graded", grade: "B", date: "Yesterday" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">S-Cool</h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{school?.name || "Vibrant Academy"}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-60 pl-9 pr-4 py-1.5 bg-slate-100 focus:bg-white border border-transparent focus:border-indigo-500 text-sm rounded-xl focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
            </button>

            {/* Profile Menu */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
                {(user?.profile_avatar?.secure_url || user?.avatarUrl) ? (
                  <img
                    src={user?.profile_avatar?.secure_url || user?.avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-indigo-700 text-sm font-black uppercase">
                    {user?.name?.slice(0, 2) || "TR"}
                  </span>
                )}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">
                  {user?.name || "Teacher Profile"}
                </p>
                <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">Teacher</p>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all ml-1"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-indigo-500/30 text-indigo-100 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-400/20 backdrop-blur-xs">
              Academic Term 2026
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-4">Welcome back, {user?.name || "Educator"}!</h2>
            <p className="text-indigo-100 text-sm sm:text-base mt-2 max-w-xl">
              You have {classes.length} classes scheduled for today. Your first period starts at 09:00 AM.
            </p>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
            <BookOpen className="w-96 h-96" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">90</h3>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Today's Attendance</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">94%</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignments Graded</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">18/24</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours Taught</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">12.5 hrs</h3>
            </div>
          </div>
        </div>

        {/* Dynamic Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Schedule (Left 2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Today's Classes</h3>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                Live Status
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {classes.map((cls) => (
                <div 
                  key={cls.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 hover:bg-slate-100/70 border border-slate-100 rounded-2xl transition-all gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {cls.name.split(' ')[1]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800">{cls.subject}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{cls.name} • {cls.room}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200/60">
                    <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{cls.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
                      <Users className="w-3.5 h-3.5" />
                      <span>{cls.students} Students</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements & Quick Tasks (Right 1 col) */}
          <div className="flex flex-col gap-8">
            {/* Announcements */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Bell className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Announcements</h3>
              </div>

              <div className="flex flex-col gap-4">
                {announcements.map((ann) => (
                  <div key={ann.id} className="flex gap-3">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${ann.urgent ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{ann.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{ann.content}</p>
                      <span className="text-[10px] text-slate-400 font-medium mt-1">{ann.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Submissions */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col gap-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Award className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-800">Submissions</h3>
              </div>

              <div className="flex flex-col gap-3">
                {recentSubmissions.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{sub.student}</p>
                      <p className="text-xs text-slate-450 truncate mt-0.5">{sub.assignment}</p>
                    </div>
                    <div className="text-right">
                      {sub.status === 'Graded' ? (
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                          {sub.grade}
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                          Pending
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default TeacherDahboard;