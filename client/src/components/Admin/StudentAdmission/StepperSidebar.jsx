import { STEPS } from "./shared";

export function StepperSidebar({ activeStep, onStepClick }) {
  return (
    <nav className="flex flex-col gap-1 w-full p-1.5">
      {STEPS.map((step, idx) => {
        const isActive = step.id === activeStep;
        const isDone   = step.id < activeStep;
        return (
          <div key={step.id}>
            <button
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`w-full flex items-start gap-3.5 px-3 py-3.5 rounded-2xl text-left transition-all border ${
                isActive
                  ? "bg-blue-50/60 border-blue-500 shadow-sm shadow-blue-100/40"
                  : "bg-transparent border-transparent hover:bg-blue-50/30 hover:border-blue-100/30"
              }`}
            >
              {/* Step badge */}
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold shrink-0 mt-0.5 transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : isDone
                  ? "bg-green-500 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}>
                {isDone ? (
                  <svg className="w-4.5 h-4.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : step.id}
              </span>

              {/* Step label */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-bold leading-snug truncate ${
                  isActive ? "text-blue-600" : isDone ? "text-slate-800" : "text-slate-400"
                }`}>{step.label}</p>
                <p className={`text-xs mt-0.5 leading-snug truncate ${
                  isDone ? "text-green-600 font-semibold" : "text-slate-400"
                }`}>
                  {isDone ? "Completed" : step.sub}
                </p>
              </div>
            </button>

            {/* Connector line between steps */}
            {idx < STEPS.length - 1 && (
              <div className="flex justify-start pl-[31px] my-1">
                <div className={`w-0 h-8 border-l-2 ${
                  isDone ? "border-green-500 border-solid" : "border-slate-300 border-dashed"
                }`} />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
