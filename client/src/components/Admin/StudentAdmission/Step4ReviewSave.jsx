import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  enrollStudent,
  selectStudentLoading,
  selectStudentNotification,
  clearStudentNotification,
} from "../../../redux/slice/schoolStudentSlice";
import { selectStructures } from "../../../redux/slice/academicFeeStructureSlice";
import {
  CheckCircle2, Edit2, ArrowLeft, ArrowRight, Save,
  User, GraduationCap, Bus, Receipt, FileText, Info, MapPin,
} from "lucide-react";

// ── Shared sub-components ────────────────────────────────────────────────────

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

// ── Main component ───────────────────────────────────────────────────────────

export function Step4ReviewSave({ form, goBack, onSubmit, isLoading }) {
  const dispatch = useDispatch();

  const [confirmed, setConfirmed] = useState(false);

  const apiLoading   = useSelector(selectStudentLoading("enrollStudent"));
  const notification = useSelector(selectStudentNotification);

  const structures        = useSelector(selectStructures);
  const selectedStructure = structures.find((s) => s._id === form.academicPlanId) || null;
  const heads             = selectedStructure?.feeHeads || [];

  const acadTotal  = heads.reduce((s, h) => s + (h.amount || 0), 0);
  const transTotal = form.transport_required ? (Number(form.transportFee) || 0) : 0;

  const discounts = form.discounts         || [];
  const charges   = form.additionalCharges || [];

  const discountsTotal         = discounts.reduce((s, d) => s + (d.amount || 0), 0);
  const additionalChargesTotal = charges.reduce((s, c)   => s + (c.amount || 0), 0);
  const finalTotal             = acadTotal + transTotal + additionalChargesTotal - discountsTotal;

  const fmt = (n) => `₹ ${Number(n || 0).toLocaleString("en-IN")}`;

  const getFrequencyLabel = (freq) => {
    if (!freq) return "";
    if (freq === "one-time") return "One-time";
    return freq.charAt(0).toUpperCase() + freq.slice(1);
  };

  const address = [
    form.street,
    form.city,
    form.state,
    form.postalCode ? `- ${form.postalCode}` : "",
    form.country,
  ]
    .filter(Boolean)
    .join(", ");

  const dismissNotification = () => dispatch(clearStudentNotification());

  // ── THE ONLY API CALL in the entire wizard ───────────────────────────────
  const handleConfirmAdmission = async () => {
    if (!confirmed || apiLoading) return;

    // ── Validate the minimum required fee plan fields before dispatch ────────
    if (!form.academicPlanId) {
      alert("Academic fee structure is required. Please go back to Step 2 and select a fee structure.");
      return;
    }
    if (!form.academicYear) {
      alert("Academic year is required. Please go back to Step 2.");
      return;
    }
    if (form.transport_required && (!form.transportFeeStructureId || !form.transportRouteId)) {
      alert("Transport fee structure and route are required when transport is enabled. Please go back to Step 2.");
      return;
    }

   
    let parentBlock = form.parent;

    if (!parentBlock) {
      // Fallback: reconstruct from flat form fields (shouldn't happen normally)
      if (form.parentMode === "existing" || form.parentMode === "link") {
        parentBlock = { mode: "existing", parentUserId: form.parentUserId };
      } else {
        parentBlock = {
          mode:               "new",
          name:               form.parent_name,
          email:              form.parent_email,
          primary_phone:      form.parent_phone,
          ...(form.guardian_name     ? { guardian_name:     form.guardian_name     } : {}),
          ...(form.guardian_relation ? { guardian_relation: form.guardian_relation } : {}),
        };
      }
    }


    const feePlan = {
      academicYear:            form.academicYear,
      academicFeeStructure_id: form.academicPlanId,
      discounts:         discounts.map((d) => ({ type: d.type,  amount: Number(d.amount) || 0 })),
      additionalCharges: charges.map((c)   => ({ name: c.name,  amount: Number(c.amount) || 0 })),
    };

    // Only include transport IDs when transport is required
    if (form.transport_required) {
      feePlan.transportFeeStructure_id = form.transportFeeStructureId || undefined;
      feePlan.currentRoute_id          = form.transportRouteId        || undefined;
    }

    // ── Final payload — field names match createAdmissionService params ──────
    const payload = {
      student_name:       form.student_name,
      email:              form.email,
      password:           form.password,
      admission_no:       form.admission_no,
      gender:             form.gender?.toLowerCase() || "prefer_not_to_say",
      dob:                form.dob                  || null,
      transport_required: form.transport_required   ?? false,
      requestedGrade:     form.requestedGrade       || form.grade || undefined,
      address:            form.address,  // { street, city, state, postalCode, country }
      parent:             parentBlock,   // { mode, ... }
      feePlan,
      // avatarFile is handled separately via FormData in the thunk
      ...(form.avatarFile ? { avatarFile: form.avatarFile } : {}),
    };

    const result = await dispatch(enrollStudent(payload));

    if (enrollStudent.fulfilled.match(result)) {
      onSubmit(result);
    }
    // On rejection the Redux notification toast shows the error automatically
  };

 
  return (
    <div className="flex flex-col h-full bg-blue-100/30 rounded-xl">

      {/* ── Toast (API success / error) ── */}
      {notification && (
        <div
          className={`mx-4 sm:mx-5 mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={dismissNotification}
            className="shrink-0 opacity-60 hover:opacity-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 hide-scrollbar">

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
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center shrink-0 text-blue-400">
                  {form.avatarPreview
                    ? <img src={form.avatarPreview} alt="Student" className="w-full h-full object-cover rounded-full" />
                    : <User className="w-7 h-7" />}
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 flex-1">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Student Name</p>
                    <p className="text-base font-bold text-slate-800">{form.student_name || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Admission Number</p>
                    <p className="text-sm font-bold text-slate-700">{form.admission_no || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Requested Grade</p>
                    <p className="text-sm font-semibold text-slate-700">{form.requestedGrade || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Date of Birth</p>
                    <p className="text-sm font-semibold text-slate-700">{form.dob || "—"}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Gender</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{form.gender || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Email</p>
                  <p className="text-sm font-semibold text-slate-700 break-all">{form.email || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">
                    {form.parent?.mode === "existing" ? "Linked Parent" : "Parent Name"}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">{form.parent_name || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Parent Phone</p>
                  <p className="text-sm font-semibold text-slate-700">{form.parent_phone || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold">Parent Email</p>
                  <p className="text-sm font-semibold text-slate-700 break-all">{form.parent_email || "—"}</p>
                </div>
                {/*  Show guardian fields in review if filled */}
                {form.guardian_name && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Guardian Name</p>
                    <p className="text-sm font-semibold text-slate-700">{form.guardian_name}</p>
                  </div>
                )}
                {form.guardian_relation && (
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Guardian Relation</p>
                    <p className="text-sm font-semibold text-slate-700">{form.guardian_relation}</p>
                  </div>
                )}
              </div>

              {/* Address */}
              {address && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-[11px] text-slate-400 font-semibold">Address</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">{address}</p>
                </div>
              )}

              {/* Transport badge */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-semibold">Transport Required</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  form.transport_required
                    ? "bg-green-100 text-green-700"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {form.transport_required ? "Yes" : "No"}
                </span>
              </div>
            </SectionCard>

            {/* Transport Fee Plan */}
            {form.transport_required && (
              <SectionCard icon={<Bus className="w-4 h-4" />} title="Transport Fee Plan" onEdit={goBack}>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-3">
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Route</p>
                    <p className="text-sm font-semibold text-slate-700">{form.transportRoute || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Drop Point / Stop</p>
                    <p className="text-sm font-semibold text-slate-700">{form.transportStop || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Frequency</p>
                    <p className="text-sm font-semibold text-slate-700">{form.transportFrequency || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-400 font-semibold">Transport Fee (Monthly)</p>
                    <p className="text-sm font-bold text-slate-800">{fmt(transTotal)}</p>
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
            )}
          </div>

          {/* ── RIGHT column ── */}
          <div className="flex flex-col gap-4">

            {/* Academic Fee Plan */}
            <SectionCard icon={<GraduationCap className="w-4 h-4" />} title="Academic Fee Plan" onEdit={goBack}>
              <div className="grid grid-cols-3 gap-3 mb-4 h-[20vh]">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Academic Year</p>
                  <p className="text-sm font-semibold text-slate-700">{form.academicYear || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Standard / Grade</p>
                  <p className="text-sm font-semibold text-slate-700">{form.requestedGrade || form.grade || "—"}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">Fee Structure</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-slate-700 leading-snug">
                      {form.academicPlan || "No structure selected"}
                    </p>
                    {(selectedStructure?.status === "active" || selectedStructure?.isActive) && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded bg-green-50 text-green-600 border border-green-100">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning if no structure selected */}
              {!form.academicPlanId && (
                <div className="mb-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700 font-semibold">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  No fee structure selected. Please go back to Step 2.
                </div>
              )}

              {/* Fee Heads Table */}
              {heads.length > 0 && (
                <table className="w-full border-collapse mb-3">
                  <thead>
                    <tr className="border-b border-slate-100 text-left">
                      <th className="py-2 text-xs font-bold text-slate-400">Fee Head</th>
                      <th className="py-2 text-xs font-bold text-slate-400 text-right pr-4">Amount (₹)</th>
                      <th className="py-2 text-xs font-bold text-slate-400 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/60">
                    {heads.map((h, i) => {
                      const isMandatory = h.mandatory !== false;
                      return (
                        <tr key={i} className="hover:bg-slate-50/40">
                          <td className="py-2.5">
                            <div className="text-sm font-semibold text-slate-700">{h.name}</div>
                            <div className="text-xs text-slate-400 font-semibold">{getFrequencyLabel(h.frequency)}</div>
                          </td>
                          <td className="py-2.5 text-right font-bold text-slate-700 text-sm pr-4">
                            ₹ {(h.amount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              isMandatory
                                ? "bg-green-50 text-green-700 border-green-100"
                                : "bg-blue-50 text-blue-600 border-blue-100"
                            }`}>
                              {isMandatory ? "Mandatory" : "Optional"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Academic Subtotal */}
              <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3">
                <span className="text-sm font-bold text-blue-700">Academic Subtotal</span>
                <span className="text-base font-black text-blue-700">{fmt(acadTotal)}</span>
              </div>
            </SectionCard>
          </div>
        </div>

        {/* ── Bottom: Adjustments + Final Summary ── */}
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
                {discounts.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold">No discounts applied.</p>
                ) : (
                  <>
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
                            <td className="py-2 text-right font-bold text-rose-500">- ₹ {(d.amount || 0).toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-600">Total Discounts</span>
                      <span className="text-sm font-black text-rose-500">- ₹ {discountsTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Additional Charges */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 text-xs font-bold">+</div>
                  <h4 className="text-sm font-bold text-slate-700">Additional Charges</h4>
                </div>
                {charges.length === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold">No additional charges applied.</p>
                ) : (
                  <>
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
                            <td className="py-2 text-right font-bold text-green-600">+ ₹ {(c.amount || 0).toLocaleString("en-IN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-600">Total Additional Charges</span>
                      <span className="text-sm font-black text-green-600">+ ₹ {additionalChargesTotal.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}
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
                  { label: "Academic Subtotal",  value: fmt(acadTotal),                    color: "text-blue-100"  },
                  { label: "Transport Fee",       value: fmt(transTotal),                   color: "text-blue-100"  },
                  { label: "Additional Charges",  value: `+ ${fmt(additionalChargesTotal)}`,color: "text-green-300" },
                  { label: "Discounts",           value: `- ${fmt(discountsTotal)}`,         color: "text-rose-300"  },
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
            onClick={() => {
              const { avatarFile, ...safe } = form;
              localStorage.setItem("studentAdmissionDraft", JSON.stringify(safe));
            }}
            className="flex items-center gap-2 h-10 px-5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>

          {/* ✅ The one and only API trigger button in the entire wizard */}
          <button
            type="button"
            onClick={handleConfirmAdmission}
            disabled={!confirmed || apiLoading || !form.academicPlanId}
            className={`flex items-center gap-2 h-10 px-6 text-sm font-black text-white rounded-xl transition active:scale-95 cursor-pointer shadow-md ${
              confirmed && !apiLoading && form.academicPlanId
                ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {apiLoading ? (
              <>
                <svg className="w-4.5 h-4.5 animate-spin" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4.5 h-4.5" />
                Confirm Admission
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}