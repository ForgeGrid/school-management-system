import { forwardRef, useImperativeHandle, useState } from 'react';

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

/* ── Icons ───────────────────────────────────────────────────────────────── */
const IcoUp    = () => <svg className="w-3.5 h-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>;
const IcoCheck = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="#22c55e" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoUser  = () => <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcoClock = () => <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>;
const IcoLock  = () => <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="5" y="11" width="14" height="10" rx="2"/><path strokeLinecap="round" d="M8 11V7a4 4 0 018 0v4"/></svg>;
const IcoGlobe = () => <svg className="w-[18px] h-[18px] text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>;

/* ── Component ───────────────────────────────────────────────────────────── */
const SchoolProfile = forwardRef(function SchoolProfile(props, ref) {
  const [address, setAddress] = useState("123, Sunrise Avenue, Green Park,\nNew Delhi, Delhi - 110016, India");
  const MAX = 500;

  /* Expose handleSave so the parent can trigger save via ref */
  useImperativeHandle(ref, () => ({
    handleSave() {
      // TODO: wire to a real API thunk (e.g. dispatch(updateSchoolProfile({ ... })))
      console.log("SchoolProfile → save", { address });
    },
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <SectionHead title="School Information" subtitle="Basic information about your school." />
            <div className="flex flex-col gap-4">
              <div><Lbl required>School Name</Lbl><Inp defaultValue="Sunrise Public School" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><Lbl required>School Email</Lbl><Inp defaultValue="info@sunrisepublicschool.edu" type="email" /></div>
                <div><Lbl required>School Phone</Lbl><Inp defaultValue="+91 98765 43210" /></div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <SectionHead title="Academic Information" subtitle="Academic structure and medium details." />
            <div className="flex flex-col gap-4">
              <div>
                <Lbl required>School Board</Lbl>
                <Sel defaultValue="cbse">
                  <option value="cbse">CBSE</option>
                  <option value="icse">ICSE</option>
                  <option value="state">State Board</option>
                  <option value="ib">IB</option>
                </Sel>
              </div>
              <div>
                <Lbl required>School Medium</Lbl>
                <Sel defaultValue="english">
                  <option value="english">English</option>
                  <option value="hindi">Hindi</option>
                  <option value="bilingual">Bilingual</option>
                </Sel>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <SectionHead title="Address" subtitle="Official address of your school." />
            <Lbl required>Official Address</Lbl>
            <Txta rows={5} value={address} onChange={e => setAddress(e.target.value.slice(0, MAX))} />
            <p className="text-xs text-gray-400 mt-1.5">{address.length} / {MAX} characters</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <SectionHead title="Branding" subtitle="Upload your school logo." />
            <Lbl>School Logo</Lbl>
            <div className="border border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center py-8 gap-3 bg-gray-50/50">
              <div className="w-14 h-14 rounded-xl bg-blue-700 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-4 py-2 text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                <IcoUp /> <span className="text-blue-600">Change Logo</span>
              </button>
              <p className="text-xs text-gray-400">PNG, JPG or SVG. Max size 2MB.</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="flex items-center gap-1.5 mb-1">
            <h2 className="text-base font-bold text-gray-900">School Status</h2>
            <span className="text-xs text-gray-400 font-medium">(Read Only)</span>
          </div>
          <p className="text-xs text-gray-400 mb-5">Verified school information from the system.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 mb-4">
            <InfoRow icon={<IcoGlobe />} label="Domain"              value="sunrisepublicschool.edu" />
            <InfoRow icon={<IcoCheck />} label="Verification Status" value="Verified" badge />
            <InfoRow icon={<IcoUser />}  label="Verified By"         value="Super Admin" />
            <InfoRow icon={<IcoClock />} label="Verified On"         value="10 Jun 2025, 11:45 AM" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-100 pt-3.5">
            <IcoLock /><span>These details are managed by the system and cannot be edited.</span>
          </div>
        </div>
      </Card>
    </div>
  );
});

export default SchoolProfile;