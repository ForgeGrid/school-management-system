import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import scoolLogo from "@/assets/scool.svg";
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
  Settings,
  Smile,
  BarChart3,
  Power,
  ChevronDown,
  ShieldCheck,
  BookOpen,
} from "lucide-react";


import {Attendece} from "./Acadameic/Attendance";
import {Myclass} from "./Acadameic/Myclass";
import {ClassSection} from './Acadameic/ClassSection';
import {Timetable} from './Acadameic/TimeTable'
import {Subject} from './Acadameic/Subject'


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

  // ── Transport ──────────────────────────────────────────────
  const transportSubItems = [
    "Transport › Bus Routes",
    "Transport › Transport Fees",
    "Transport › Vehicles",
  ];
  const isTransportActive = transportSubItems.includes(activeTab);
  const [transportOpen, setTransportOpen] = useState(() => transportSubItems.includes(activeTab));
  useEffect(() => { if (isTransportActive) setTransportOpen(true); }, [isTransportActive]);

  // ── Fees ───────────────────────────────────────────────────
  const feeSubItems = [
    "Fees › Academic Fees",
    "Fees › Fee Reports",
  ];
  const isFeeActive = feeSubItems.includes(activeTab);
  const [feesOpen, setFeesOpen] = useState(() => feeSubItems.includes(activeTab));
  useEffect(() => { if (isFeeActive) setFeesOpen(true); }, [isFeeActive]);

  // ── Academic ───────────────────────────────────────────────
  const academicSubItems = [
    "Academic › Timetable",
    "Academic › Subjects",
    "Academic › Attendance",
    "Academic › Class Section",
    "Academic › My Class",
  ];
  const isAcademicActive = academicSubItems.includes(activeTab);
  const [academicOpen, setAcademicOpen] = useState(() => academicSubItems.includes(activeTab));
  useEffect(() => { if (isAcademicActive) setAcademicOpen(true); }, [isAcademicActive]);

  // ── Role checks ────────────────────────────────────────────
  const isSuperAdmin =
    user?.platform_role === "super_admin" ||
    user?.platformRole === "super_admin";

  const isTeacher = user?.role === "teacher";

  // ── Menu items ─────────────────────────────────────────────
  const topMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Admission", icon: UserPlus },
    ...(!isTeacher ? [{ name: "Profile Approval", icon: UserCheck }] : []),
  ];

  const bottomMenuItems = [
    { name: "Live tracking", icon: MapPin },
    { name: "Reports", icon: BarChart3 },
    { name: "Alerts", icon: Bell },
  ];

  const secondaryMenuItems = [
    ...(isSuperAdmin ? [{ name: "Admin Dashboard", icon: ShieldCheck }] : []),
    { name: "Settings", icon: Settings },
    { name: "Report issue", icon: BarChart3 },
    { name: "Feedback", icon: Smile },
  ];

  // ── Reusable nav button ────────────────────────────────────
  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.name;
    return (
      <SidebarMenuItem className="mb-3">
        <SidebarMenuButton
          isActive={isActive}
          onClick={() => setActiveTab(item.name)}
          className={`group/navItem w-[calc(100%-16px)] mx-2 flex items-center justify-between px-3 py-2 transition-colors duration-200 rounded-xl font-normal ${
            isActive
              ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
              : "bg-transparent text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
          }`}
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Icon
                className={`w-4.5 h-4.5 stroke-[2.5] transition-colors duration-200 ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover/navItem:text-indigo-500"
                }`}
              />
            </motion.div>
            <span className="text-sm tracking-wide leading-none">{item.name}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  // ── Reusable expandable group ──────────────────────────────
  const ExpandableGroup = ({
    label,
    icon: Icon,
    subItems,
    isParentActive,
    isOpen,
    onToggle,
    animKey,
  }) => (
    <SidebarMenuItem className="mb-3">
      <SidebarMenuButton
        onClick={onToggle}
        className={`group/navItem w-[calc(100%-16px)] mx-2 flex items-center justify-between px-3 py-2 transition-colors duration-200 rounded-xl font-normal ${
          isParentActive
            ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
            : "bg-transparent text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Icon
              className={`w-4.5 h-4.5 stroke-[2.5] transition-colors duration-200 ${
                isParentActive
                  ? "text-indigo-600"
                  : "text-slate-400 group-hover/navItem:text-indigo-500"
              }`}
            />
          </motion.div>
          <span className="text-sm tracking-wide leading-none">{label}</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen
              ? "rotate-180 text-indigo-500"
              : isParentActive
              ? "text-indigo-400"
              : "text-slate-300"
          }`}
        />
      </SidebarMenuButton>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={animKey}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="ml-8 mt-3 space-y-0.9 border-l-2 border-indigo-100 pl-3">
              {subItems.map((sub) => {
                const subLabel = sub.split(" › ")[1];
                const isSubActive = activeTab === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setActiveTab(sub)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 mb-2 cursor-pointer ${
                      isSubActive
                        ? "text-indigo-700 bg-indigo-50/80"
                        : "text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50"
                    }`}
                  >
                    {isSubActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                    )}
                    {subLabel}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SidebarMenuItem>
  );

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

              {/* Top items: Dashboard → Profile Approval */}
              {topMenuItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}

              {/* Transport expandable */}
              {!isTeacher && (
                <ExpandableGroup
                  label="Transport"
                  icon={Bus}
                  subItems={transportSubItems}
                  isParentActive={isTransportActive}
                  isOpen={transportOpen}
                  animKey="transport-sub"
                  onToggle={() => {
                    const next = !transportOpen;
                    setTransportOpen(next);
                    if (next && !isTransportActive) setActiveTab("Transport › Bus Routes");
                  }}
                />
              )}

              {/* Fees expandable */}
              {!isTeacher && (
                <ExpandableGroup
                  label="Fees"
                  icon={DollarSign}
                  subItems={feeSubItems}
                  isParentActive={isFeeActive}
                  isOpen={feesOpen}
                  animKey="fees-sub"
                  onToggle={() => {
                    const next = !feesOpen;
                    setFeesOpen(next);
                    if (next && !isFeeActive) setActiveTab("Fees › Academic Fees");
                  }}
                />
              )}

              {/* Academic expandable ← NEW */}
              <ExpandableGroup
                label="Academic"
                icon={BookOpen}
                subItems={academicSubItems}
                isParentActive={isAcademicActive}
                isOpen={academicOpen}
                animKey="academic-sub"
                onToggle={() => {
                  const next = !academicOpen;
                  setAcademicOpen(next);
                  if (next && !isAcademicActive) setActiveTab("Academic › Timetable");
                }}
              />

              {/* Remaining items: Live tracking, Reports, Alerts */}
              {bottomMenuItems.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="h-px w-full bg-slate-200 mt-auto mb-2" />

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <SidebarMenuItem key={item.name} className="mb-2">
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => setActiveTab(item.name)}
                      className={`group/navItem w-[calc(100%-16px)] mx-2 flex items-center justify-between px-3 py-2 transition-colors duration-200 rounded-xl ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "bg-transparent text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Icon
                            className={`w-4.5 h-4.5 stroke-[2.5] transition-colors duration-200 ${
                              isActive
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover/navItem:text-indigo-500"
                            }`}
                          />
                        </motion.div>
                        <span className="text-sm font-normal tracking-wide leading-none">
                          {item.name}
                        </span>
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
            <div className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0">
              {(user?.profile_avatar?.secure_url || user?.avatarUrl) ? (
                <img
                  src={user?.profile_avatar?.secure_url || user?.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-indigo-700 text-sm font-black uppercase">
                  {(() => {
                    const name = user?.name || "V MANOJ KUMAR";
                    const clean = name.trim();
                    if (clean.length <= 2) return clean.toUpperCase();
                    const parts = clean.split(/\s+/);
                    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
                    return clean.slice(0, 2).toUpperCase();
                  })()}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-slate-800 truncate leading-snug">
                {(() => {
                  const name = user?.name || "V Manoj Kumar";
                  return name
                    .trim()
                    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
                })()}
              </span>
              <span className="text-xs text-slate-500 truncate mt-0.5 leading-none">
                {(() => {
                  if (isSuperAdmin) return "Super Admin";
                  if (user?.role === "teacher") return "Teacher";
                  if (user?.role === "school_admin" || user?.role === "admin") return "School Admin";
                  if (user?.role === "staff") return "Staff";
                  return "User";
                })()}
              </span>
            </div>
          </div>

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