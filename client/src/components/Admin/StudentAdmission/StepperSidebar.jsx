import { STEPS } from "./shared";

export function StepperSidebar({ activeStep, onStepClick }) {
  return (
    <nav className="flex flex-col w-full h-140 p-2 bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-[0_1px_6px_rgba(0,0,0,0.06)]">
      {STEPS.map((step, idx) => {
        const isActive = step.id === activeStep;
        const isDone   = step.id < activeStep;

        return (
          <div key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`w-full flex items-center gap-4.5 px-3 py-10 rounded-xl text-left transition-all duration-200 group border ${
                isActive
                  ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200/60"
                  : isDone
                  ? "bg-slate-50 border-slate-100 hover:border-green-200 hover:bg-green-50/40"
                  : "border-transparent hover:bg-slate-50/60 hover:border-slate-100"
              }`}
            >
              {/* Badge */}
              <span className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 transition-all duration-200 ${
                isActive
                  ? "bg-white text-blue-600 shadow-sm"
                  : isDone
                  ? "bg-green-500 text-white shadow-sm shadow-green-200"
                  : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
              }`}>
                {isDone ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.8} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step.id}
              </span>

              {/* Labels */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold leading-tight truncate ${
                  isActive ? "text-white" : isDone ? "text-slate-700" : "text-slate-400"
                }`}>
                  {step.label}
                </p>
                <p className={`text-xs mt-0.5 truncate font-medium ${
                  isActive
                    ? "text-blue-200"
                    : isDone
                    ? "text-green-500"
                    : "text-slate-400"
                }`}>
                  {isDone ? "✓ Completed" : step.sub}
                </p>
              </div>

              {/* Active arrow */}
              {isActive && (
                <svg className="w-3.5 h-5 text-blue-200 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>

            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div className="flex items-center justify-center my-1 pl-5">
                <div className={`w-px h-8 transition-all duration-300 ${
                  isDone
                    ? "bg-gradient-to-b from-green-300 to-green-200"
                    : "bg-gradient-to-b from-slate-200 to-transparent"
                }`} />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}