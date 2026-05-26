// ─── Shared styles ─────────────────────────────────────────────────────────────
export const inputCls =
  "w-full h-10 px-3 text-base rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition";

export const selectCls =
  "w-full h-10 px-3 text-base rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition appearance-none cursor-pointer";

// ─── Step definitions ──────────────────────────────────────────────────────────
export const STEPS = [
  { id: 1, label: "Basic Details",  sub: "Student account & profile" },
  { id: 2, label: "Academic Fee",   sub: "Select academic plan" },
  { id: 3, label: "Review & Save",  sub: "Review and confirm" },
];

// ─── Atom components ───────────────────────────────────────────────────────────
export function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-sm text-slate-400 mt-1.5">{hint}</p>}
    </div>
  );
}

export function Section({ icon, title, children }) {
  return (
    <div className="border border-slate-200 rounded-2xl p-6 mb-4 bg-white">
      <div className="flex items-center gap-2.5 mb-5">
        <span className="text-blue-500">{icon}</span>
        <span className="text-lg font-semibold text-blue-500">{title}</span>
      </div>
      {children}
    </div>
  );
}

export function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select className={selectCls} value={value} onChange={onChange}>{children}</select>
      <svg
        className="pointer-events-none absolute right-3 top-3 w-4 h-4 text-slate-400"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export function InfoBanner({ children }) {
  return (
    <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 leading-relaxed">
      <svg
        className="w-4 h-4 mt-0.5 shrink-0 text-blue-500"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
      </svg>
      {children}
    </div>
  );
}
