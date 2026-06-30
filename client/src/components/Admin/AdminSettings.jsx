import { useRef, useState } from "react";
import MyDetails from "./Profile/MyDetails";
import ProfessionalProfile from "./Profile/ProfessionalProfile";
import SchoolProfile from "./Profile/SchoolProfile";
import Password from "./Profile/Password";

const TABS = ["My Details", "Professional Profile", "School Profile", "Password"];

/* Tabs that have a global save action */
const SAVEABLE_TABS = ["Professional Profile", "School Profile"];

const IcoSave  = () => <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>;

export default function AdminSettings() {
  const [tab, setTab] = useState("My Details");

  /* Refs so we can call handleSave() on each tab component */
  const professionalRef = useRef(null);
  const schoolRef       = useRef(null);

  const showSave = SAVEABLE_TABS.includes(tab);


  const content = {
    "My Details":           <MyDetails />,
    "Professional Profile": <ProfessionalProfile ref={professionalRef} />,
    "School Profile":       <SchoolProfile ref={schoolRef} />,
    "Password":             <Password />,
  };

  return (
    <div className="h-full flex flex-col pb-2">

      {/* ── Header ── */}
      <div className="shrink-0 flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your profile and account settings</p>
        </div>
      </div>

      {/* ── Outer Card Wrapper containing Tabs and Tab Content ── */}
      <div className="flex-1 min-h-0 flex flex-col bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab bar header */}
        <div className="shrink-0 flex border-b border-gray-200 px-6 pt-4 bg-white">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                "px-4 pb-4 text-sm font-medium border-b-2 -mb-px transition-all duration-150",
                tab === t
                  ? "border-[#2563eb] text-[#2563eb] font-semibold"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              ].join(" ")}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Content body with white background matching the image exactly */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {content[tab]}
        </div>
      </div>
    </div>
  );
}