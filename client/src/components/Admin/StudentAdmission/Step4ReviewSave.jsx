import { useState } from "react";
import {
  CheckCircle2, Edit2, ArrowLeft, ArrowRight, Save,
  User, GraduationCap, Bus, Receipt, FileText, Info, MapPin
} from "lucide-react";

const PLAN_LABELS = {
  basic:    "Grade 8 - Basic Academic Plan",
  standard: "Grade 8 - Standard Academic Plan",
  premium:  "Grade 8 - Premium Academic Plan",
};

const PLAN_FEE_HEADS = {
  basic: [
    { name: "Tuition Fee",      period: "Monthly", amount: 9000,  type: "Mandatory" },
    { name: "Exam Fee",         period: "Term",    amount: 1500,  type: "Mandatory" },
    { name: "Library Fee",      period: "Yearly",  amount: 1000,  type: "Mandatory" },
    { name: "Annual Fee",       period: "Yearly",  amount: 4000,  type: "Mandatory" },
    { name: "Miscellaneous Fee",period: "Yearly",  amount: 1000,  type: "Optional"  },
  ],
  standard: [
    { name: "Tuition Fee",      period: "Monthly", amount: 12000, type: "Mandatory" },
    { name: "Exam Fee",         period: "Term",    amount: 2000,  type: "Mandatory" },
    { name: "Lab Fee",          period: "Term",    amount: 1500,  type: "Optional"  },
    { name: "Library Fee",      period: "Yearly",  amount: 1000,  type: "Mandatory" },
    { name: "Annual Fee",       period: "Yearly",  amount: 5000,  type: "Mandatory" },
    { name: "Development Fee",  period: "Yearly",  amount: 2500,  type: "Optional"  },
    { name: "Miscellaneous Fee",period: "Yearly",  amount: 1000,  type: "Optional"  },
  ],
  premium: [
    { name: "Tuition Fee",      period: "Monthly", amount: 18000, type: "Mandatory" },
    { name: "Exam Fee",         period: "Term",    amount: 3000,  type: "Mandatory" },
    { name: "Lab Fee",          period: "Term",    amount: 3000,  type: "Mandatory" },
    { name: "Library Fee",      period: "Yearly",  amount: 2000,  type: "Mandatory" },
    { name: "Annual Fee",       period: "Yearly",  amount: 6000,  type: "Mandatory" },
    { name: "Development Fee",  period: "Yearly",  amount: 4000,  type: "Mandatory" },
    { name: "Miscellaneous Fee",period: "Yearly",  amount: 2000,  type: "Optional"  },
  ],
};

function SectionCard({ icon, title, onEdit, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 text-blue-600">
          {icon}
          <span className="text-sm font-bold text-slate-800">{title}</span>
        </div>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-slate-500 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function InfoGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {items.map(({ label, value, full }) => (
        <div key={label} className={full ? "col-span-2" : ""}>
          <p className="text-[11px] text-slate-400 font-semibold mb-0.5">{label}</p>
          <p className="text-sm font-semibold text-slate-700">{value || <span className="text-slate-300 italic text-xs">Not provided</span>}</p>
        </div>
      ))}
    </div>
  );
}

export function Step4ReviewSave({ form, goBack, onSubmit }) {
  const [confirmed, setConfirmed] = useState(false);

  const plan      = form.academicPlan || "standard";
  const heads     = PLAN_FEE_HEADS[plan] || [];
  const acadTotal = heads.reduce((s, h) => s + h.amount, 0);
  const transTotal = form.transportRequired ? 4800 : 0;
  const discounts = [
    { type: "Scholarship",     amount: 2000 },
    { type: "Sibling Discount",amount: 1000 },
  ];
  const charges = [
    { name: "Late Admission Fee", amount: 600 },
    { name: "Activity Fee",       amount: 400 },
  ];
  const discountsTotal       = discounts.reduce((s, d) => s + d.amount, 0);
  const additionalChargesTotal = charges.reduce((s, c) => s + c.amount, 0);
  const finalTotal = acadTotal + transTotal + additionalChargesTotal - discountsTotal;

  const fmt = (n) => `₹ ${n.toLocaleString("en-IN")}`;

  const address = [form.street, form.city, form.state, form.postal ? `- ${form.postal}` : "", form.country]
    .filter(Boolean).join(", ");

  return (
    <div className="flex flex-col h-full bg-transparent">

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5">

        {/* Header */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-slate-800 leading-tight">Review Admission Details</h2>
          <p className="text-sm text-slate-400 mt-1">Verify the student information and fee plan before completing admission.</p>
        </div>

        {/* Completion pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            "Basic profile\ncompleted",
            "Academic fee\nconfigured",
            "Transport fee\nconfigured",
            "Additional adjustments\napplied",
          ].map((label) => (
            <div key={label} className="flex items-center gap-2.5 bg-green-50/60 border border-green-100 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <span className="text-xs font-semibold text-green-800 whitespace-pre-line leading-snug">{label}</span>
            </div>
          ))}
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* ── LEFT column ── */}
          <div className="flex flex-col gap-4">

            {/* Student Information */}
            <SectionCard icon={<User className="w-4 h-4" />} title="Student Information" onEdit={goBack}>
              {/* Avatar + name row */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center shrink-0 text-blue-400">
                  <User className="w-7 h-7" />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 flex-1">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Student Name</p>
                    <p className="text-base font-bold text-slate-800">{form.studentName || "Aryan Sharma"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Admission Number</p>
                    <p className="text-sm font-bold text-slate-700">{form.admissionNumber || "ADM-2025-00876"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Requested Grade</p>
                    <p className="text-sm font-semibold text-slate-700">{form.grade || "Grade 8"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Date of Birth</p>
                    <p className="text-sm font-semibold text-slate-700">{form.dob || "12 May 2012"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Gender</p>
                  <p className="text-sm font-semibold text-slate-700">{form.gender || "Male"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Email</p>
                  <p className="text-sm font-semibold text-slate-700 break-all">{form.email || "aryan.sharma@email.com"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Parent Name</p>
                  <p className="text-sm font-semibold text-slate-700">{form.parentName || "Rohit Sharma"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Parent Phone</p>
                  <p className="text-sm font-semibold text-slate-700">{form.parentPhone || "+91 98765 43210"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Guardian Name</p>
                  <p className="text-sm font-semibold text-slate-700">{form.guardianName || "Neha Sharma"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Guardian Relation</p>
                  <p className="text-sm font-semibold text-slate-700">{form.guardianRelation || "Mother"}</p>
                </div>
              </div>

              {/* Address */}
              {address && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-400 font-semibold">Address</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{address || "123 Green Park Colony, Sector 15, Noida, Uttar Pradesh - 201301, India"}</p>
                </div>
              )}

              {/* Transport badge */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold">Transport Required</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${form.transportRequired ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                  {form.transportRequired ? "Yes" : "No"}
                </span>
              </div>
            </SectionCard>

            {/* Transport Fee Plan */}
            <SectionCard icon={<Bus className="w-4 h-4" />} title="Transport Fee Plan" onEdit={goBack}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Route</p>
                  <p className="text-sm font-semibold text-slate-700">{form.transportRoute || "Route 3 - City Center to School"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Drop Point / Stop</p>
                  <p className="text-sm font-semibold text-slate-700">{form.transportStop || "Green Park Colony"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Frequency</p>
                  <p className="text-sm font-semibold text-slate-700">Yearly</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Transport Fee</p>
                  <p className="text-sm font-bold text-slate-800">₹ 4,800</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Status</p>
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100">Confirmed</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-50/50 border border-blue-100 rounded-xl px-3 py-2.5 text-xs text-blue-700 font-semibold">
                <Info className="w-4 h-4 shrink-0 text-blue-400" />
                Transport fee will be included in the total amount.
              </div>
            </SectionCard>
          </div>

          {/* ── RIGHT column ── */}
          <div className="flex flex-col gap-4">

            {/* Academic Fee Plan */}
            <SectionCard icon={<GraduationCap className="w-4 h-4" />} title="Academic Fee Plan" onEdit={goBack}>
              {/* Dropdowns row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Academic Year</p>
                  <p className="text-sm font-semibold text-slate-700">2025 - 2026</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Standard / Grade</p>
                  <p className="text-sm font-semibold text-slate-700">{form.grade || "Grade 8"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Fee Structure</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-700 leading-snug">{PLAN_LABELS[plan]}</p>
                    <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-600 border border-green-100">Active</span>
                  </div>
                </div>
              </div>

              {/* Fee Heads Table */}
              <table className="w-full border-collapse mb-3">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="py-2 text-xs font-bold text-slate-400">Fee Head</th>
                    <th className="py-2 text-xs font-bold text-slate-400 text-right pr-4">Amount (₹)</th>
                    <th className="py-2 text-xs font-bold text-slate-400 text-center">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/60">
                  {heads.map((h, i) => (
                    <tr key={i} className="hover:bg-slate-50/40">
                      <td className="py-2.5">
                        <div className="text-sm font-semibold text-slate-700">{h.name}</div>
                        <div className="text-xs text-slate-400 font-semibold">{h.period}</div>
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-700 text-sm pr-4">
                        ₹ {h.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                          h.type === "Mandatory"
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}>{h.type}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Academic Subtotal */}
              <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-blue-700">Academic Subtotal</span>
                <span className="text-base font-black text-blue-700">{fmt(acadTotal)}</span>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* ── Bottom: Adjustments + Final Summary side by side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-4">

          {/* Additional Adjustments */}
          <SectionCard icon={<Receipt className="w-4 h-4" />} title="Additional Adjustments" onEdit={goBack}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Discounts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-green-50 border border-green-100 flex items-center justify-center text-green-500 text-xs">%</div>
                  <h4 className="text-sm font-bold text-slate-700">Discounts</h4>
                </div>
                <table className="w-full border-collapse text-sm mb-2">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-1.5 text-xs font-semibold text-slate-400 text-left">Discount Type</th>
                      <th className="pb-1.5 text-xs font-semibold text-slate-400 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {discounts.map((d, i) => (
                      <tr key={i}>
                        <td className="py-2 font-semibold text-slate-700">{d.type}</td>
                        <td className="py-2 text-right font-bold text-rose-500">- ₹ {d.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Total Discounts</span>
                  <span className="text-sm font-black text-rose-500">- ₹ {discountsTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Additional Charges */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 text-xs font-bold">+</div>
                  <h4 className="text-sm font-bold text-slate-700">Additional Charges</h4>
                </div>
                <table className="w-full border-collapse text-sm mb-2">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-1.5 text-xs font-semibold text-slate-400 text-left">Charge Name</th>
                      <th className="pb-1.5 text-xs font-semibold text-slate-400 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {charges.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 font-semibold text-slate-700">{c.name}</td>
                        <td className="py-2 text-right font-bold text-green-600">+ ₹ {c.amount.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-600">Total Additional Charges</span>
                  <span className="text-sm font-black text-green-600">+ ₹ {additionalChargesTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Final Payment Summary */}
          <div className="bg-blue-600 rounded-2xl p-5 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-blue-200" />
                <h3 className="text-base font-bold text-white">Final Payment Summary</h3>
              </div>
              <div className="space-y-2.5 text-sm mb-4">
                {[
                  { label: "Academic Subtotal",    value: fmt(acadTotal),           color: "text-blue-100" },
                  { label: "Transport Fee",         value: fmt(transTotal),          color: "text-blue-100" },
                  { label: "Additional Charges",    value: `+ ${fmt(additionalChargesTotal)}`, color: "text-green-300" },
                  { label: "Discounts",             value: `- ${fmt(discountsTotal)}`,         color: "text-rose-300" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-blue-200 font-semibold">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                ))}
                <div className="h-px bg-blue-500 my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Final Payable Amount</span>
                  <span className="text-2xl font-black text-white">{fmt(finalTotal)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-blue-500/40 rounded-xl px-3 py-2.5 text-xs text-blue-100 font-semibold leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-200" />
              This fee plan will be assigned to the student after admission confirmation.
            </div>
          </div>
        </div>

        {/* Confirmation checkbox */}
        <label className="flex items-start gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3.5 cursor-pointer hover:bg-slate-50/50 transition">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4.5 h-4.5 mt-0.5 rounded accent-blue-600 cursor-pointer shrink-0"
          />
          <div>
            <p className="text-sm font-semibold text-slate-700">I confirm that all student and fee details are correct.</p>
            <p className="text-xs text-slate-400 mt-0.5">After confirmation, the student enrolment and fee plan will become active.</p>
          </div>
        </label>
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-200/80 bg-white shrink-0">
        <button
          type="button"
          onClick={goBack}
          className="flex items-center gap-2 h-10 px-5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Previous Step
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 h-10 px-5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!confirmed}
            className={`flex items-center gap-2 h-10 px-6 text-sm font-black text-white rounded-xl transition active:scale-95 cursor-pointer shadow-md ${
              confirmed
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            <CheckCircle2 className="w-4.5 h-4.5" />
            Confirm Admission
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
