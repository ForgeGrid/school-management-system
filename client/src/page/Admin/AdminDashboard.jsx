import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../../redux/slice/getmeslice";
import { logoutUserThunk } from "../../redux/slice/authslice";
import { selectUser, selectSchool } from "../../redux/slice/getmeSelector";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Search, TrendingUp, FileText, Download, MessageSquare, Settings, Save } from "lucide-react";

// Import modular components
import AdminSidebar from "@/components/Admin/AdminSidebar";
import DashboardOverview from "@/components/Admin/DashboardOverview";
import StudentAdmissionForm from "@/components/Admin/StudentAdmissionForm";
import AttendanceManager from "@/components/Admin/AttendanceManager";
import ProfileApprovalQueue from "@/components/Admin/ProfileApprovalQueue";
import BusRoutesManager from "@/components/Admin/BusRoutesManager";
import FeesCollection from "@/components/Admin/FeesCollection";
import LiveTrackingHUD from "@/components/Admin/LiveTrackingHUD";
import AlertsBroadcast from "@/components/Admin/AlertsBroadcast";
import AdminReports from "@/components/Admin/AdminReports";
import AdminFeedback from "@/components/Admin/AdminFeedback";
import AdminSettings from "@/components/Admin/AdminSettings";
export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const school = useSelector(selectSchool);

  const isSuperAdmin = user?.platform_role === "super_admin" || user?.platformRole === "super_admin";

  useEffect(() => {
    if (isSuperAdmin) {
      document.title = "Super Admin Dashboard | S-Cool";
    } else {
      document.title = "School Admin Dashboard | S-Cool";
    }
  }, [isSuperAdmin]);

  // Navigation State
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  // ==========================================
  // SHARED INTERACTIVE LIFTS (LIFTED STATE)
  // ==========================================

  // 1. Students State
  const [students, setStudents] = useState([
    { id: 1, firstName: "Aarav", lastName: "Sharma", class: "Grade 10", rollNo: "1001", email: "aarav@gmail.com", status: "Active" },
    { id: 2, firstName: "Diya", lastName: "Patel", class: "Grade 12", rollNo: "1205", email: "diya@gmail.com", status: "Active" },
    { id: 3, firstName: "Kabir", lastName: "Singh", class: "Grade 9", rollNo: "0912", email: "kabir@gmail.com", status: "Active" },
    { id: 4, firstName: "Ananya", lastName: "Rao", class: "Grade 11", rollNo: "1103", email: "ananya@gmail.com", status: "Active" },
    { id: 5, firstName: "Rohan", lastName: "Gupta", class: "Grade 10", rollNo: "1014", email: "rohan@gmail.com", status: "Active" }
  ]);

  // 2. Attendance State
  const [attendance, setAttendance] = useState({
    "1": "present",
    "2": "present",
    "3": "absent",
    "4": "present",
    "5": "late"
  });

  // 3. Pending Approvals Queue
  const [pendingApprovals, setPendingApprovals] = useState([
    { id: 101, name: "Dr. Vikram Malhotra", role: "Teacher", department: "Science", date: "2026-05-16", email: "vikram@school.edu" },
    { id: 102, name: "Meera Deshmukh", role: "Teacher", department: "Mathematics", date: "2026-05-16", email: "meera@school.edu" },
    { id: 103, name: "Suresh Pillai", role: "Parent", studentName: "Aarav Pillai (Grade 8)", date: "2026-05-17", email: "suresh@parent.com" },
    { id: 104, name: "Priya Nair", role: "Teacher", department: "English Literature", date: "2026-05-17", email: "priya@school.edu" },
    { id: 105, name: "Rajesh Joshi", role: "Parent", studentName: "Tina Joshi (Grade 10)", date: "2026-05-17", email: "rajesh@parent.com" }
  ]);

  // 4. Bus Fleet State
  const [buses, setBuses] = useState([
    { id: 1, routeName: "Route A - City Center", driver: "Amit Kumar", phone: "+91 98765 43210", status: "Running", speed: "42 km/h", coords: { x: 25, y: 35 }, nextStop: "Sector 15 Cross" },
    { id: 2, routeName: "Route B - North Suburbs", driver: "Gurpreet Singh", phone: "+91 98765 54321", status: "Running", speed: "38 km/h", coords: { x: 70, y: 65 }, nextStop: "Metro Station Gate 2" },
    { id: 3, routeName: "Route C - South Campus Express", driver: "Ramesh Sen", phone: "+91 98765 65432", status: "Stopped", speed: "0 km/h", coords: { x: 45, y: 75 }, nextStop: "School Terminal" }
  ]);

  // 5. Academic Fees State
  const [feeRecords, setFeeRecords] = useState([
    { id: 201, student: "Aarav Sharma", amount: 1200, date: "2026-05-15", method: "UPI", status: "Completed" },
    { id: 202, student: "Diya Patel", amount: 1500, date: "2026-05-16", method: "Net Banking", status: "Completed" },
    { id: 203, student: "Ananya Rao", amount: 1200, date: "2026-05-17", method: "Credit Card", status: "Pending" }
  ]);

  // 6. Custom Alerts State
  const [alerts, setAlerts] = useState([
    { id: 1, type: "Delay", message: "Bus Route B is delayed by 15 mins due to heavy traffic on NH-48.", time: "10 mins ago", category: "Transport" },
    { id: 2, type: "Urgent", message: "Final submission dates for Class 10 projects have been updated.", time: "2 hours ago", category: "Academic" }
  ]);

  // Dynamic statistics calculations
  const totalStudentsCount = 826 + students.length;
  const activeBusesCount = buses.filter(b => b.status === "Running").length;
  const stoppedBusesCount = buses.filter(b => b.status === "Stopped").length;
  const pendingProfilesCount = pendingApprovals.length;

  const attendanceVals = Object.values(attendance);
  const presentCount = attendanceVals.filter(v => v === "present" || v === "late").length;
  const todayAttendancePct = Math.round((presentCount / attendanceVals.length) * 100);

  // Simulation effect for bus movement
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses =>
        prevBuses.map(bus => {
          if (bus.status === "Running") {
            const dx = (Math.random() - 0.5) * 4;
            const dy = (Math.random() - 0.5) * 4;
            return {
              ...bus,
              coords: {
                x: Math.max(10, Math.min(90, bus.coords.x + dx)),
                y: Math.max(10, Math.min(90, bus.coords.y + dy))
              }
            };
          }
          return bus;
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle Logout
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

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="flex h-screen w-full overflow-hidden bg-slate-50/50 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-size-[16px_16px]">

          {/* Custom Modular Sidebar */}
          <AdminSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            pendingProfilesCount={pendingProfilesCount}
            alertsCount={alerts.length}
            user={user}
            school={school}
            handleLogout={handleLogout}
          />

          {/* Main content viewport */}
          <SidebarInset className="flex-1 flex flex-col overflow-hidden bg-transparent">

            {/* Top Toolbar */}
            <header className="h-14 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0 sticky top-0 z-40">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 cursor-pointer" />
                <div className="h-5 w-px bg-slate-200 hidden md:block" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider hidden md:inline-block">
                  {isSuperAdmin ? "Super Admin Portal" : "School Admin Portal"}
                </span>
              </div>

              {/* Wireframe Search Bar */}
              <div className="relative w-full max-w-xs md:max-w-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4.5 w-4.5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Student, teacher, bus..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all font-medium placeholder-slate-400 shadow-inner"
                />
              </div>
            </header>

            {/* Immersive tab view rendering */}
            <main className="flex-1 overflow-hidden p-6 md:p-8 flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="w-full h-full flex flex-col overflow-hidden"
                >
                  {activeTab === "Dashboard" && (
                    <DashboardOverview
                      totalStudentsCount={totalStudentsCount}
                      activeBusesCount={activeBusesCount}
                      stoppedBusesCount={stoppedBusesCount}
                      pendingProfilesCount={pendingProfilesCount}
                      todayAttendancePct={todayAttendancePct}
                      buses={buses}
                      setBuses={setBuses}
                      setActiveTab={setActiveTab}
                    />
                  )}

                  {activeTab === "Student admission" && (
                    <StudentAdmissionForm
                      setStudents={setStudents}
                      setAttendance={setAttendance}
                      setActiveTab={setActiveTab}
                    />
                  )}

                  {activeTab === "Attendance" && (
                    <AttendanceManager
                      students={students}
                      attendance={attendance}
                      setAttendance={setAttendance}
                      todayAttendancePct={todayAttendancePct}
                    />
                  )}

                  {activeTab === "Profile Approval" && (
                    <ProfileApprovalQueue
                      pendingApprovals={pendingApprovals}
                      setPendingApprovals={setPendingApprovals}
                    />
                  )}

                  {activeTab === "Bus routes" && (
                    <BusRoutesManager
                      buses={buses}
                      setBuses={setBuses}
                    />
                  )}

                  {activeTab === "Fees" && (
                    <FeesCollection
                      feeRecords={feeRecords}
                      setFeeRecords={setFeeRecords}
                    />
                  )}

                  {activeTab === "Live tracking" && (
                    <LiveTrackingHUD
                      buses={buses}
                      activeBusesCount={activeBusesCount}
                      stoppedBusesCount={stoppedBusesCount}
                    />
                  )}

                  {activeTab === "Alerts" && (
                    <AlertsBroadcast
                      alerts={alerts}
                      setAlerts={setAlerts}
                    />
                  )}

                  {activeTab === "Reports" && (
                    <AdminReports />
                  )}

                  {activeTab === "Feedback" && (
                    <AdminFeedback />
                  )}

                  {activeTab === "Report issue" && (
                    <AdminFeedback isIssue={true} />
                  )}

                  {activeTab === "Settings" && (
                    <AdminSettings school={school} />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </SidebarInset>

        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
