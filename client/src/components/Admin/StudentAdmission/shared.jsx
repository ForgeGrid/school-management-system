// ─── Shared styles ─────────────────────────────────────────────────────────────
export const inputCls =
  "w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 " +
  "focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150";

export const selectCls =
  "w-full h-10 px-3 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 " +
  "focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all duration-150 appearance-none cursor-pointer";

// ─── Step definitions ──────────────────────────────────────────────────────────
export const STEPS = [
  { id: 1, label: "Basic Details",  sub: "Student account & profile" },
  { id: 2, label: "Academic Fee",   sub: "Select academic plan" },
  { id: 3, label: "Review & Save",  sub: "Review and confirm" },
];

// ─── Section icon map ──────────────────────────────────────────────────────────
const SECTION_COLORS = {
  default: { bg: "bg-blue-50", border: "border-blue-100", text: "text-blue-500", bar: "from-blue-400 to-blue-600" },
};

// ─── Atom components ───────────────────────────────────────────────────────────
export function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 text-sm leading-none">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-slate-400 mt-0.5 leading-snug">{hint}</p>
      )}
    </div>
  );
}

export function Section({ icon, title, children, accent }) {
  return (
    <div className="relative rounded-2xl bg-white border border-slate-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] mb-4 overflow-hidden">
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent || "from-blue-400 via-blue-500 to-indigo-500"}`} />
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-5 pb-4">
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shrink-0">
          {icon}
        </div>
        <span className="text-sm font-bold text-slate-700 tracking-tight">{title}</span>
      </div>
      {/* Divider */}
      <div className="mx-5 h-px bg-slate-100 mb-4" />
      {/* Body */}
      <div className="px-5 pb-5">
        {children}
      </div>
    </div>
  );
}

export function SelectField({ value, onChange, children, className }) {
  return (
    <div className="relative">
      <select
        className={`${selectCls} ${className || ""}`}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-3 w-3.5 h-3.5 text-slate-400"
        fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function InfoBanner({ children }) {
  return (
    <div className="flex items-start gap-2.5 bg-blue-50/80 border border-blue-100 rounded-xl px-3.5 py-3 text-xs text-blue-700 leading-relaxed font-medium">
      <svg
        className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400"
        fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
      </svg>
      {children}
    </div>
  );
}