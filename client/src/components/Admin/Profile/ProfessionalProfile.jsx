import { useState } from 'react';

/* ── Shared Primitives (local to this file) ──────────────────────────────── */
const inputBase = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400";
const Inp  = (p) => <input    {...p} className={inputBase} />;
const Txta = (p) => <textarea {...p} className={`${inputBase} resize-none`} />;
const Sel  = ({ children, ...p }) => (
  <div className="relative">
    <select {...p} className={`${inputBase} appearance-none pr-8 cursor-pointer`}>{children}</select>
    <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
  </div>
);

const Lbl = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-800 mb-1.5">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const BadgeGreen = ({ children }) => (
  <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{children}</span>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionHead = ({ title, subtitle }) => (
  <div className="mb-5">
    <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
  </div>
);

const InfoRow = ({ icon, label, value, badge }) => (
  <div className="flex items-start gap-2.5">
    <span className="shrink-0 mt-0.5">{icon}</span>
    <div className="min-w-0">
      <p className="text-[11px] font-semibold text-gray-400 mb-0.5 leading-none uppercase tracking-wider">{label}</p>
      {badge
        ? <BadgeGreen>{value}</BadgeGreen>
        : <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
      }
    </div>
  </div>
);

const SubjectTag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium px-2.5 py-1 rounded-full">
    {label}
    <button onClick={onRemove} className="text-blue-400 hover:text-blue-700 ml-0.5 text-base leading-none">×</button>
  </span>
);

/* ── Icons ───────────────────────────────────────────────────────────────── */
const IcoCheck = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoUser  = () => <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcoLock  = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="5" y="11" width="14" height="10" rx="2"/><path strokeLinecap="round" d="M8 11V7a4 4 0 018 0v4"/></svg>;
const IcoId    = () => <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="2" y="5" width="20" height="14" rx="2"/><path strokeLinecap="round" d="M8 10h.01M8 14h.01M12 10h4M12 14h4"/></svg>;
const IcoInfo  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 16v-4m0-4h.01"/></svg>;

/* ── Component ───────────────────────────────────────────────────────────── */
export default function ProfessionalProfile() {
  const [subjects, setSubjects] = useState(["Mathematics", "Physics", "Science", "Computer Science"]);
  const [highlight, setHighlight] = useState(
    "Passionate educator and school leader with 12 years of experience in academic planning, curriculum development, team management, and overall school administration."
  );
  const MAX = 256;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <Card>
          <div className="p-6">
            <SectionHead title="Professional Details" subtitle="Update your professional information." />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <Lbl required>Designation</Lbl>
                <Sel defaultValue="school_admin">
                  <option value="school_admin">School Administrator</option>
                  <option value="teacher">Teacher</option>
                  <option value="vice_principal">Vice Principal</option>
                </Sel>
              </div>
              <div>
                <Lbl required>Qualification</Lbl>
                <Inp defaultValue="M.Ed. in Educational Administration" />
              </div>
              <div>
                <Lbl required>Experience (Years)</Lbl>
                <Inp defaultValue="12" type="number" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <SectionHead title="Teaching Expertise" subtitle="Select the subjects you are proficient in." />
            <Lbl required>Subjects</Lbl>
            <div className="flex flex-wrap gap-2 items-center border border-gray-200 rounded-lg px-3.5 py-2.5 min-h-[46px] bg-white">
              {subjects.map(s => (
                <SubjectTag key={s} label={s} onRemove={() => setSubjects(subjects.filter(x => x !== s))} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">You can add multiple subjects.</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <SectionHead title="About Me" subtitle="Write a short professional summary." />
            <Lbl required>Profile Highlight</Lbl>
            <Txta rows={4} value={highlight} onChange={e => setHighlight(e.target.value.slice(0, MAX))} />
            <p className="text-xs text-gray-400 mt-1.5">{MAX - highlight.length} characters left</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <SectionHead title="Employment Details" subtitle="Your employment and verification details." />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 mb-4">
              <InfoRow icon={<IcoId />}    label="Employee ID"         value="EMP-001" />
              <InfoRow icon={<IcoCheck />} label="Verification Status" value="Verified" badge />
              <InfoRow icon={<IcoUser />}  label="Employment Status"   value="Employed" badge />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-100 pt-3.5">
              <IcoLock /><span>These details are managed by the school and cannot be edited.</span>
            </div>
          </div>
        </Card>
      </div>

      {/* sidebar */}
      <div className="w-full lg:w-56 shrink-0">
        <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-5 sticky top-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <IcoInfo />
            <span className="text-[13px] font-bold text-blue-800">About this section</span>
          </div>
          <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
            This information is used across the system for your profile, communications, and academic assignments.
          </p>
        </div>
      </div>
    </div>
  );
}
