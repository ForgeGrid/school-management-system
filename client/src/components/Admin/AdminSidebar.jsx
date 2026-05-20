import React, { useState } from "react";
import { motion } from "framer-motion";
import scoolLogo from "@/assets/scool-logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
} from "../ui/sidebar";
import {
  LayoutDashboard,
  UserPlus,
  CalendarCheck,
  UserCheck,
  Bus,
  DollarSign,
  MapPin,
  Bell,
  GraduationCap,
  Settings,
  Smile,
  BarChart3,
  LogOut,
  Power,
} from "lucide-react";

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  pendingProfilesCount,
  alertsCount,
  user,
  school,
  handleLogout,
}) {
  const [isLogoSpinning, setIsLogoSpinning] = useState(false);

  const handleLogoClick = () => {
    setIsLogoSpinning(true);
    setTimeout(() => setIsLogoSpinning(false), 1000);
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Student admission", icon: UserPlus },
    { name: "Attendance", icon: CalendarCheck },
    { name: "Profile Approval", icon: UserCheck, badge: pendingProfilesCount },
    { name: "Bus routes", icon: Bus },
    { name: "Fees", icon: DollarSign },
    { name: "Live tracking", icon: MapPin },
    { name: "Reports", icon: BarChart3 },
    { name: "Alerts", icon: Bell, badge: alertsCount }
  ];

  const secondaryMenuItems = [
    { name: "Settings", icon: Settings },
    { name: "Report issue", icon: BarChart3 },
    { name: "Feedback", icon: Smile }
  ];

  return (
    <Sidebar className="border-r border-slate-200 bg-white">
      {/* Header branding */}
      <SidebarHeader className="h-14 px-6 border-b border-slate-200/80 flex flex-row items-center gap-3 shrink-0 bg-white">
        <motion.div
          onClick={handleLogoClick}
          animate={{ rotate: isLogoSpinning ? 360 : 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="w-8 h-8 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <img src={scoolLogo} alt="S-Cool Logo" className="w-full h-full" />
        </motion.div>
        <div className="flex flex-col">
          <span className="font-extrabold text-slate-900 text-lg tracking-tight leading-none truncate">
            S-Cool
          </span>
        </div>
      </SidebarHeader>

      {/* Navigation links */}
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <SidebarMenuItem key={item.name} className="mb-3">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.name)}
                      className={`group/navItem w-[calc(100%-24px)] mx-3 flex items-center justify-between px-4 py-2.5 transition-colors duration-200 rounded-xl font-medium ${isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
                          : "bg-transparent text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Icon className={`w-5 h-5 stroke-[2.5] transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover/navItem:text-indigo-500"}`} />
                        </motion.div>
                        <span className="text-[15px] font-bold tracking-wide">{item.name}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-sm font-medium text-slate-400">
                          {item.badge}
                        </span>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider line pushed to the bottom, separating top and bottom menus */}
        <div className="h-px w-full bg-slate-200 mt-auto mb-3"></div>

        {/* Secondary Navigation Group (Reports, Feedback, Settings) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <SidebarMenuItem key={item.name} className="mb-3">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.name)}
                      className={`group/navItem w-[calc(100%-24px)] mx-3 flex items-center justify-between px-4 py-2.5 transition-colors duration-200 rounded-xl font-medium ${isActive
                          ? "bg-indigo-50 text-indigo-700 font-bold shadow-sm"
                          : "bg-transparent text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Icon className={`w-5 h-5 stroke-[2.5] transition-colors duration-200 ${isActive ? "text-indigo-600" : "text-slate-400 group-hover/navItem:text-indigo-500"}`} />
                        </motion.div>
                        <span className="text-[15px] font-bold tracking-wide">{item.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Profile & Logout */}
      <SidebarFooter className="p-4 pb-6 bg-white border-t-0 border-slate-200/80">
        <div className="flex items-center justify-between w-full bg-indigo-50/60 border border-indigo-100 rounded-2xl p-3 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-lg font-black uppercase shrink-0">
              {user?.name?.slice(0, 1) || "V"}
            </div>

            {/* User Info */}
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[13px] font-bold text-slate-800 uppercase tracking-wide truncate">
                  {user?.name || "V MANOJ KUMAR"}
                </span>
                {(user?.platform_role === "super_admin" || user?.platformRole === "super_admin") && (
                  <span className="px-1.5 py-0.5 text-[9px] font-black bg-indigo-650 text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md tracking-wider uppercase shrink-0">
                    Super
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-400 truncate">
                {user?.email || "admin@school.com"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="text-slate-400 hover:text-red-500 transition-colors duration-200 shrink-0 p-2"
          >
            <Power className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
