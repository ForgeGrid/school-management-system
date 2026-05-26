// import { useState, useRef, useEffect } from "react";
// import {
//   GraduationCap,
//   Bus,
//   Info,
//   CheckCircle2,
//   ChevronDown,
//   ChevronUp,
//   Plus,
//   Trash2,
//   ArrowLeft,
//   ArrowRight,
//   Save,
//   Percent,
//   Receipt,
//   AlertCircle,
//   FileText
// } from "lucide-react";

// // ══════════════════════════════════════════════════════════════════════════════
// // Step2AcademicFee — select academic & transport plan + adjustments
// // Props: { form, onChange, goNext, goBack }
// // ══════════════════════════════════════════════════════════════════════════════

// const PLAN_FEE_HEADS = {
//   basic: [
//     { name: "Tuition Fee", period: "Monthly", amount: 9000, type: "Mandatory" },
//     { name: "Exam Fee", period: "Term", amount: 1500, type: "Mandatory" },
//     { name: "Library Fee", period: "Yearly", amount: 1000, type: "Mandatory" },
//     { name: "Annual Fee", period: "Yearly", amount: 4000, type: "Mandatory" },
//     { name: "Miscellaneous Fee", period: "Yearly", amount: 1000, type: "Optional" }
//   ],
//   standard: [
//     { name: "Tuition Fee", period: "Monthly", amount: 12000, type: "Mandatory" },
//     { name: "Exam Fee", period: "Term", amount: 2000, type: "Mandatory" },
//     { name: "Lab Fee", period: "Term", amount: 1500, type: "Optional" },
//     { name: "Library Fee", period: "Yearly", amount: 1000, type: "Mandatory" },
//     { name: "Annual Fee", period: "Yearly", amount: 5000, type: "Mandatory" },
//     { name: "Development Fee", period: "Yearly", amount: 2500, type: "Optional" },
//     { name: "Miscellaneous Fee", period: "Yearly", amount: 1000, type: "Optional" }
//   ],
//   premium: [
//     { name: "Tuition Fee", period: "Monthly", amount: 18000, type: "Mandatory" },
//     { name: "Exam Fee", period: "Term", amount: 3000, type: "Mandatory" },
//     { name: "Lab Fee", period: "Term", amount: 3000, type: "Mandatory" },
//     { name: "Library Fee", period: "Yearly", amount: 2000, type: "Mandatory" },
//     { name: "Annual Fee", period: "Yearly", amount: 6000, type: "Mandatory" },
//     { name: "Development Fee", period: "Yearly", amount: 4000, type: "Mandatory" },
//     { name: "Miscellaneous Fee", period: "Yearly", amount: 2000, type: "Optional" }
//   ]
// };

// export function Step2AcademicFee({ form, onChange, goNext, goBack }) {
//   const [academicYear, setAcademicYear] = useState("2025 - 2026");
//   const [grade, setGrade] = useState(form.grade || "Grade 8");
//   const [feeStructure, setFeeStructure] = useState(form.academicPlan || "standard");

//   // Transport details
//   const [transportRoute, setTransportRoute] = useState(form.transportRoute || "Route 3 - City Center to School");
//   const [transportStop, setTransportStop] = useState(form.transportStop || "Green Park Colony");
//   const [transportFee, setTransportFee] = useState(4800);
//   const [transportFrequency, setTransportFrequency] = useState("Yearly");
//   const [transportStatus, setTransportStatus] = useState("Confirmed");

//   // Adjustments (Discounts & Additional Charges)
//   const [discounts, setDiscounts] = useState([
//     { id: 1, type: "Scholarship", amount: 2000 },
//     { id: 2, type: "Sibling Discount", amount: 1000 }
//   ]);
//   const [charges, setCharges] = useState([
//     { id: 1, name: "Late Admission Fee", amount: 600 },
//     { id: 2, name: "Activity Fee", amount: 400 }
//   ]);
//   const [adjustmentsExpanded, setAdjustmentsExpanded] = useState(true);

//   // Footer visibility via scroll
//   const [showFooter, setShowFooter] = useState(false);
//   const scrollRef = useRef(null);

//   const checkScroll = () => {
//     if (scrollRef.current) {
//       const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
//       setShowFooter(scrollTop + clientHeight >= scrollHeight - 30);
//     }
//   };

//   const handleScroll = () => {
//     checkScroll();
//   };

//   useEffect(() => {
//     checkScroll();
//   }, [feeStructure, adjustmentsExpanded, discounts, charges]);

//   // Discount Handlers
//   const handleDiscountChange = (index, field, value) => {
//     setDiscounts((prev) => {
//       const next = [...prev];
//       next[index] = { ...next[index], [field]: value };
//       return next;
//     });
//   };

//   const addDiscount = () => {
//     setDiscounts((prev) => [
//       ...prev,
//       { id: Date.now(), type: "Custom Discount", amount: 0 }
//     ]);
//   };

//   const removeDiscount = (id) => {
//     setDiscounts((prev) => prev.filter((d) => d.id !== id));
//   };

//   // Charge Handlers
//   const handleChargeChange = (index, field, value) => {
//     setCharges((prev) => {
//       const next = [...prev];
//       next[index] = { ...next[index], [field]: value };
//       return next;
//     });
//   };

//   const addCharge = () => {
//     setCharges((prev) => [
//       ...prev,
//       { id: Date.now(), name: "", amount: 0 }
//     ]);
//   };

//   const removeCharge = (id) => {
//     setCharges((prev) => prev.filter((c) => c.id !== id));
//   };

//   // Totals calculations
//   const heads = PLAN_FEE_HEADS[feeStructure] || [];
//   const academicSubtotal = heads.reduce((sum, h) => sum + h.amount, 0);
//   const discountsTotal = discounts.reduce((sum, d) => sum + d.amount, 0);
//   const additionalChargesTotal = charges.reduce((sum, c) => sum + c.amount, 0);
//   const transportSubtotal = form.transportRequired ? transportFee : 0;
//   const estimatedTotal = academicSubtotal + transportSubtotal + additionalChargesTotal - discountsTotal;

//   const handleContinue = () => {
//     // Sync state back to the parent form component
//     onChange("academicPlan")({ target: { value: feeStructure } });
//     onChange("transportRoute")({ target: { value: transportRoute } });
//     onChange("transportStop")({ target: { value: transportStop } });
//     goNext();
//   };

//   return (
//     <div className="flex flex-col h-full bg-blue-100/30 rounded-xl  ">
//       {/* ── Scrollable main body ── */}
//       <div
//         ref={scrollRef}
//         onScroll={handleScroll}
//         className="flex-1 overflow-y-auto px-6 py-6"
//       >
//         {/* Page Header */}
//         <div className="mb-5">
//           <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">Student Admission - Fee Plan Selection</h2>
//           <p className="text-base text-slate-450 mt-1">Step 2 of 3 &bull; Confirm the academic and transport fee plan for this student</p>
//         </div>

//         {/* Callout Info Banner */}
//         <div className="mb-6 bg-blue-100/55 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center justify-between text-base text-blue-700 shadow-2xs">
//           <div className="flex items-center gap-2">
//             <Info className="w-5 h-5 text-blue-550 shrink-0" />
//             <span>
//               Student: <strong className="font-semibold text-blue-900">{form.studentName || "Aryan Sharma"}</strong>
//               <span className="mx-2 text-blue-300">|</span>
//               Grade Requested: <strong className="font-semibold text-blue-900">{form.grade || "Grade 8"}</strong>
//               <span className="mx-2 text-blue-300">|</span>
//               Transport Required: <strong className="font-semibold text-blue-900">{form.transportRequired ? "Yes" : "No"}</strong>
//             </span>
//           </div>
//         </div>

//         {/* Upper Grid - Two columns (Academic + Transport) */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
//           {/* Left: Academic Fee Plan (Col Span 7) */}
//           <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
//             <div>
//               {/* Header */}
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2.5">
//                   <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
//                     <GraduationCap className="w-5.5 h-5.5" />
//                   </div>
//                   <h3 className="text-base font-bold text-slate-800">Academic Fee Plan</h3>
//                 </div>
//                 <button type="button" className="text-slate-400 hover:text-slate-600 transition">
//                   <Info className="w-5 h-5" />
//                 </button>
//               </div>
//               <p className="text-sm text-slate-400 mb-5">Selected fee structure will be applied for the academic year.</p>

//               {/* Row of Dropdowns */}
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-600 mb-1.5">Academic Year</label>
//                   <div className="relative">
//                     <select
//                       value={academicYear}
//                       onChange={(e) => setAcademicYear(e.target.value)}
//                       className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
//                     >
//                       <option>2025 - 2026</option>
//                       <option>2026 - 2027</option>
//                     </select>
//                     <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-600 mb-1.5">Grade / Standard</label>
//                   <div className="relative">
//                     <select
//                       value={grade}
//                       onChange={(e) => setGrade(e.target.value)}
//                       className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
//                     >
//                       {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(g => (
//                         <option key={g} value={g}>{g}</option>
//                       ))}
//                     </select>
//                     <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-600 mb-1.5">Fee Structure</label>
//                   <div className="relative flex items-center">
//                     <select
//                       value={feeStructure}
//                       onChange={(e) => setFeeStructure(e.target.value)}
//                       className="w-full h-11 pl-3 pr-20 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-bold"
//                     >
//                       <option value="basic">Grade 8 - Basic Academic Plan</option>
//                       <option value="standard">Grade 8 - Standard Academic Plan</option>
//                       <option value="premium">Grade 8 - Premium Academic Plan</option>
//                     </select>
//                     <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
//                     <span className="absolute right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-205 pointer-events-none">
//                       Active
//                     </span>
//                   </div>
//                 </div>
//               </div>

//               {/* Fee Heads Table */}
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="border-b border-slate-100 text-left">
//                       <th className="py-2.5 text-sm font-bold text-slate-400">Fee Head</th>
//                       <th className="py-2.5 text-sm font-bold text-slate-400 text-right pr-6">Amount (₹)</th>
//                       <th className="py-2.5 text-sm font-bold text-slate-400 text-center">Type</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-slate-100/60">
//                     {PLAN_FEE_HEADS[feeStructure]?.map((head, i) => (
//                       <tr key={i} className="hover:bg-slate-50/45 transition-colors">
//                         <td className="py-3">
//                           <div className="font-semibold text-slate-700 text-sm">{head.name}</div>
//                           <div className="text-xs text-slate-400 font-semibold">{head.period}</div>
//                         </td>
//                         <td className="py-3 text-right font-bold text-slate-750 text-sm pr-6">
//                           ₹ {head.amount.toLocaleString("en-IN")}
//                         </td>
//                         <td className="py-3 text-center">
//                           <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${head.type === "Mandatory"
//                               ? "bg-green-50 text-green-650 border-green-100"
//                               : "bg-blue-50 text-blue-650 border-blue-100"
//                             }`}>
//                             {head.type}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Academic Subtotal Row */}
//             <div className="mt-4 border-t border-slate-100 pt-4">
//               <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 mb-3.5 shadow-2xs">
//                 <span className="text-sm font-bold text-blue-700">Academic Subtotal</span>
//                 <span className="text-base font-black text-blue-700">₹ {academicSubtotal.toLocaleString("en-IN")}</span>
//               </div>
//               <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
//                 <Info className="w-4 h-4 text-blue-405 shrink-0" />
//                 <span>Mandatory fee heads are applicable for all students. Optional fee heads may vary.</span>
//               </div>
//             </div>
//           </div>

//           {/* Right: Transport Fee Plan (Col Span 5) */}
//           <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
//             <div>
//               {/* Header */}
//               <div className="flex items-center justify-between mb-2">
//                 <div className="flex items-center gap-2.5">
//                   <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
//                     <Bus className="w-5.5 h-5.5" />
//                   </div>
//                   <h3 className="text-base font-bold text-slate-800">Transport Fee Plan</h3>
//                 </div>
//                 <button type="button" className="text-slate-400 hover:text-slate-600 transition">
//                   <Info className="w-5 h-5" />
//                 </button>
//               </div>
//               <p className="text-sm text-slate-400 mb-5">Selected route and drop point for this student.</p>

//               {/* Transport Required Banner */}
//               {form.transportRequired ? (
//                 <div className="mb-5 bg-green-50/50 border border-green-150 rounded-xl p-4 flex items-start gap-3.5 animate-fade-in">
//                   <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
//                   <div>
//                     <div className="text-sm font-bold text-green-800">Transport is required for this student</div>
//                     <div className="text-xs text-green-600 font-semibold mt-0.5">Selected transport plan is shown below.</div>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
//                   <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
//                   <div>
//                     <div className="text-sm font-bold text-slate-700">Transport is not requested</div>
//                     <div className="text-xs text-slate-400 font-semibold mt-0.5">Go back to step 1 to request transport.</div>
//                   </div>
//                 </div>
//               )}

//               {/* Transport Details Fields */}
//               <div className="space-y-4.5">
//                 <div>
//                   <label className="block text-sm font-semibold text-slate-600 mb-1.5">Route</label>
//                   <div className="relative flex items-center">
//                     <select
//                       value={transportRoute}
//                       onChange={(e) => setTransportRoute(e.target.value)}
//                       disabled={!form.transportRequired}
//                       className="w-full h-11 pl-3 pr-20 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-bold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
//                     >
//                       <option value="Route 3 - City Center to School">Route 3 - City Center to School</option>
//                       <option value="Route 1 - North Zone">Route 1 - North Zone</option>
//                       <option value="Route 2 - South Zone">Route 2 - South Zone</option>
//                     </select>
//                     <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
//                     {form.transportRequired && (
//                       <span className="absolute right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 pointer-events-none">
//                         Active
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-600 mb-1.5">Drop Point / Stop</label>
//                   <input
//                     type="text"
//                     value={transportStop}
//                     onChange={(e) => setTransportStop(e.target.value)}
//                     disabled={!form.transportRequired}
//                     placeholder="e.g. Green Park Colony"
//                     className="w-full h-11 px-3 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
//                   />
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-semibold text-slate-600 mb-1.5">Transport Fee</label>
//                     <div className="relative">
//                       <span className="absolute left-3 top-3.5 text-sm text-slate-400 font-bold">₹</span>
//                       <input
//                         type="number"
//                         value={transportFee}
//                         onChange={(e) => setTransportFee(parseFloat(e.target.value) || 0)}
//                         disabled={!form.transportRequired}
//                         className="w-full h-11 pl-7 pr-3 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm font-semibold text-slate-600 mb-1.5">Frequency</label>
//                     <div className="relative">
//                       <select
//                         value={transportFrequency}
//                         onChange={(e) => setTransportFrequency(e.target.value)}
//                         disabled={!form.transportRequired}
//                         className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
//                       >
//                         <option>Yearly</option>
//                         <option>Monthly</option>
//                         <option>Termly</option>
//                       </select>
//                       <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
//                     </div>
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-semibold text-slate-600 mb-1.5">Status</label>
//                   <div className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center">
//                     <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${form.transportRequired
//                         ? "bg-green-50 text-green-600 border-green-100"
//                         : "bg-slate-100 text-slate-400 border-slate-200"
//                       }`}>
//                       {form.transportRequired ? transportStatus : "N/A"}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Transport Subtotal Row */}
//             <div className="mt-6 border-t border-slate-100 pt-4">
//               <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 shadow-2xs">
//                 <span className="text-sm font-bold text-blue-700">Transport Subtotal</span>
//                 <span className="text-base font-black text-blue-700">₹ {transportSubtotal.toLocaleString("en-IN")}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Row - Adjustments + Summary stacked vertically */}
//         <div className="flex flex-col gap-5">
//           {/* Adjustments - full width */}
//           <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
//             {/* Header / Toggle button */}
//             <button
//               type="button"
//               onClick={() => setAdjustmentsExpanded(!adjustmentsExpanded)}
//               className="w-full flex items-center justify-between px-6 py-4.5 bg-slate-50/40 border-b border-slate-200/60 hover:bg-slate-50/60 transition cursor-pointer"
//             >
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550 shadow-xs">
//                   <Receipt className="w-5 h-5" />
//                 </div>
//                 <div className="text-left">
//                   <h3 className="text-base font-bold text-slate-800">Additional Adjustments</h3>
//                   <p className="text-xs text-slate-400 mt-0.5 font-semibold">Add discounts, concessions, or additional charges if applicable.</p>
//                 </div>
//               </div>
//               {adjustmentsExpanded ? (
//                 <ChevronUp className="w-5 h-5 text-slate-400" />
//               ) : (
//                 <ChevronDown className="w-5 h-5 text-slate-400" />
//               )}
//             </button>

//             {/* Expanded content */}
//             {adjustmentsExpanded && (
//               <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white animate-slide-down overflow-hidden">
//                 {/* Discounts Column */}
//                 <div className="border-r border-slate-100 pr-0 md:pr-6">
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-7 h-7 rounded-md bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
//                       <Percent className="w-4 h-4" />
//                     </div>
//                     <h4 className="text-sm font-bold text-slate-700">Discounts</h4>
//                   </div>

//                   {/* Column headers */}
//                   <div className="flex items-center gap-2 mb-2 px-0.5">
//                     <span className="text-xs font-semibold text-slate-400 flex-1">Discount Type</span>
//                     <span className="text-xs font-semibold text-slate-400 w-20 text-left pl-1">Amount (₹)</span>
//                     <span className="w-8" />
//                   </div>

//                   <div className="space-y-3 mb-4">
//                     {discounts.map((discount, index) => (
//                       <div key={discount.id} className="flex items-center gap-2">
//                         <div className="relative flex-1 min-w-0">
//                           <select
//                             value={discount.type}
//                             onChange={(e) => handleDiscountChange(index, "type", e.target.value)}
//                             className="w-full h-10 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
//                           >
//                             <option value="Scholarship">Scholarship</option>
//                             <option value="Sibling Discount">Sibling Discount</option>
//                             <option value="Staff Discount">Staff Discount</option>
//                             <option value="Custom Discount">Custom Discount</option>
//                           </select>
//                           <ChevronDown className="pointer-events-none absolute right-2.5 top-3 w-4 h-4 text-slate-400" />
//                         </div>

//                         <div className="relative w-20 shrink-0">
//                           <span className="absolute left-2.5 top-2.5 text-sm text-slate-400 font-bold">₹</span>
//                           <input
//                             type="number"
//                             value={discount.amount}
//                             onChange={(e) => handleDiscountChange(index, "amount", parseFloat(e.target.value) || 0)}
//                             className="w-full h-10 pl-5 pr-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
//                           />
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => removeDiscount(discount.id)}
//                           className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-rose-100 hover:border-rose-250 text-rose-500 hover:bg-rose-50/50 transition cursor-pointer"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={addDiscount}
//                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-sm font-bold text-slate-605 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
//                   >
//                     <Plus className="w-4 h-4" /> Add Discount
//                   </button>
//                 </div>

//                 {/* Additional Charges Column */}
//                 <div>
//                   <div className="flex items-center gap-2 mb-4">
//                     <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
//                       <Plus className="w-4 h-4" />
//                     </div>
//                     <h4 className="text-sm font-bold text-slate-700">Additional Charges</h4>
//                   </div>

//                   {/* Column headers */}
//                   <div className="flex items-center gap-2 mb-2 px-0.5">
//                     <span className="text-xs font-semibold text-slate-400 flex-1">Charge Name</span>
//                     <span className="text-xs font-semibold text-slate-400 w-20 text-left pl-1">Amount (₹)</span>
//                     <span className="w-8" />
//                   </div>

//                   <div className="space-y-3 mb-4">
//                     {charges.map((charge, index) => (
//                       <div key={charge.id} className="flex items-center gap-2">
//                         <input
//                           type="text"
//                           value={charge.name}
//                           placeholder="Charge name"
//                           onChange={(e) => handleChargeChange(index, "name", e.target.value)}
//                           className="flex-1 min-w-0 h-10 px-3 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
//                         />

//                         <div className="relative w-20 shrink-0">
//                           <span className="absolute left-2.5 top-2.5 text-sm text-slate-400 font-bold">₹</span>
//                           <input
//                             type="number"
//                             value={charge.amount}
//                             onChange={(e) => handleChargeChange(index, "amount", parseFloat(e.target.value) || 0)}
//                             className="w-full h-10 pl-5 pr-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
//                           />
//                         </div>

//                         <button
//                           type="button"
//                           onClick={() => removeCharge(charge.id)}
//                           className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-rose-100 hover:border-rose-250 text-rose-500 hover:bg-rose-50/50 transition cursor-pointer"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={addCharge}
//                     className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-sm font-bold text-slate-605 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
//                   >
//                     <Plus className="w-4 h-4" /> Add Charge
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Fee Plan Summary - full width below */}
//           <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-xs">
//             <div>
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550">
//                   <FileText className="w-5 h-5" />
//                 </div>
//                 <h3 className="text-base font-bold text-slate-800 font-sans">Fee Plan Summary <span className="text-slate-400 font-normal text-sm">(Estimated)</span></h3>
//               </div>

//               <div className="space-y-4 text-sm mb-5 font-semibold text-slate-500">
//                 <div className="flex justify-between items-center">
//                   <span>Academic Subtotal</span>
//                   <span className="font-bold text-slate-705">₹ {academicSubtotal.toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Transport Fee</span>
//                   <span className="font-bold text-slate-705">₹ {transportSubtotal.toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Additional Charges</span>
//                   <span className="font-bold text-green-600">+ ₹ {additionalChargesTotal.toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Discounts</span>
//                   <span className="font-bold text-rose-500">- ₹ {discountsTotal.toLocaleString("en-IN")}</span>
//                 </div>

//                 <div className="h-px bg-slate-100 my-2" />

//                 <div className="flex justify-between items-center text-base">
//                   <span className="font-bold text-slate-800">Estimated Total</span>
//                   <span className="text-2xl font-black text-blue-650">₹ {estimatedTotal.toLocaleString("en-IN")}</span>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3.5 text-xs text-blue-700 leading-relaxed mt-auto font-semibold">
//               <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
//               <span>Final payable amount will be confirmed in the review step.</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Footer ── */}
//       <div style={{ maxHeight: showFooter ? "80px" : "0px", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
//         <div
//           style={{ transform: showFooter ? "translateY(0)" : "translateY(100%)", opacity: showFooter ? 1 : 0, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease" }}
//           className="flex items-center justify-between px-6 py-4.5 border-t border-slate-200 bg-white"
//         >
//           <button
//             type="button"
//             onClick={goBack}
//             className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
//           >
//             <ArrowLeft className="w-4.5 h-4.5" />
//             Back to Step 1
//           </button>

//           <div className="flex items-center gap-3">
//             <button
//               type="button"
//               className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
//             >
//               <Save className="w-4.5 h-4.5" />
//               Save Draft
//             </button>
//             <button
//               type="button"
//               onClick={handleContinue}
//               className="flex items-center gap-2 h-10 px-6 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-blue-100"
//             >
//               Continue to Next Step
//               <ArrowRight className="w-4.5 h-4.5" />
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GraduationCap,
  Bus,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  Save,
  Percent,
  Receipt,
  AlertCircle,
  FileText,
  Loader2,
} from "lucide-react";

import {
  getAcademicFeeStructures,
  getActiveAcademicFeeStructure,
  selectStructures,
  selectActiveStructure,
  selectLoading,
  selectError,
} from "../../../redux/slice/academicFeeStructureSlice";

// ══════════════════════════════════════════════════════════════════════════════
// Step2AcademicFee — select academic & transport plan + adjustments
// Props: { form, onChange, goNext, goBack }
// ══════════════════════════════════════════════════════════════════════════════

export function Step2AcademicFee({ form, onChange, goNext, goBack }) {
  const dispatch = useDispatch();

  // ── Redux state ──────────────────────────────────────────────────────────
  const structures = useSelector(selectStructures);   // all fee structures from API
  const activeStructure = useSelector(selectActiveStructure); // currently active one
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // ── Local UI state ───────────────────────────────────────────────────────
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [grade, setGrade] = useState(form.grade || "8th Grade");
  const [selectedStructureId, setSelectedStructureId] = useState(
    form.academicPlanId || null
  );

  // Transport
  const [transportRoute, setTransportRoute] = useState(form.transportRoute || "Route 3 - City Center to School");
  const [transportStop, setTransportStop] = useState(form.transportStop || "Green Park Colony");
  const [transportFee, setTransportFee] = useState(4800);
  const [transportFrequency, setTransportFrequency] = useState("Yearly");
  const [transportStatus] = useState("Confirmed");

  // Adjustments
  const [discounts, setDiscounts] = useState([
    { id: 1, type: "Scholarship", amount: 2000 },
    { id: 2, type: "Sibling Discount", amount: 1000 },
  ]);
  const [charges, setCharges] = useState([
    { id: 1, name: "Late Admission Fee", amount: 600 },
    { id: 2, name: "Activity Fee", amount: 400 },
  ]);
  const [adjustmentsExpanded, setAdjustmentsExpanded] = useState(true);

  // Footer scroll reveal
  const [showFooter, setShowFooter] = useState(false);
  const scrollRef = useRef(null);

  // ── Fetch fee structures on mount ────────────────────────────────────────
  useEffect(() => {
    dispatch(getAcademicFeeStructures());
  }, [dispatch]);

  // Re-fetch active structure whenever academicYear or grade changes
  useEffect(() => {
    if (academicYear && grade) {
      dispatch(getActiveAcademicFeeStructure({ academicYear, standard: grade }));
    }
  }, [dispatch, academicYear, grade]);

  // ── Filter fee structures dynamically based on active academicYear and grade ──
  const filteredStructures = structures.filter(
    (s) => s.academicYear === academicYear && s.standard === grade
  );

  // ── Auto-select structure based on chosen grade / year ───────────────────
  useEffect(() => {
    if (filteredStructures.length === 0) {
      setSelectedStructureId(null);
      return;
    }

    const active = filteredStructures.find((s) => s.status === "active" || s.isActive);
    
    // Auto select if currently selected ID is not part of the newly filtered list
    if (!selectedStructureId || !filteredStructures.some(s => s._id === selectedStructureId)) {
      setSelectedStructureId(active?._id || filteredStructures[0]._id);
    }
  }, [filteredStructures, selectedStructureId]);

  // ── Derive selected structure object ─────────────────────────────────────
  const selectedStructure = filteredStructures.find((s) => s._id === selectedStructureId) || filteredStructures[0] || null;

  // fee heads come from the API: structure.feeHeads
  const heads = selectedStructure?.feeHeads || [];

  // ── Scroll / footer logic ─────────────────────────────────────────────────
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowFooter(scrollTop + clientHeight >= scrollHeight - 30);
  };

  useEffect(() => { checkScroll(); }, [selectedStructure, adjustmentsExpanded, discounts, charges]);

  // ── Totals ────────────────────────────────────────────────────────────────
  const academicSubtotal = heads.reduce((sum, h) => sum + (h.amount || 0), 0);
  const discountsTotal = discounts.reduce((sum, d) => sum + (d.amount || 0), 0);
  const additionalChargesTotal = charges.reduce((sum, c) => sum + (c.amount || 0), 0);
  const transportSubtotal = form.transportRequired ? transportFee : 0;
  const estimatedTotal = academicSubtotal + transportSubtotal + additionalChargesTotal - discountsTotal;

  // ── Discount handlers ─────────────────────────────────────────────────────
  const handleDiscountChange = (index, field, value) => {
    setDiscounts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addDiscount = () => setDiscounts((prev) => [...prev, { id: Date.now(), type: "Custom Discount", amount: 0 }]);
  const removeDiscount = (id) => setDiscounts((prev) => prev.filter((d) => d.id !== id));

  // ── Charge handlers ───────────────────────────────────────────────────────
  const handleChargeChange = (index, field, value) => {
    setCharges((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };
  const addCharge = () => setCharges((prev) => [...prev, { id: Date.now(), name: "", amount: 0 }]);
  const removeCharge = (id) => setCharges((prev) => prev.filter((c) => c.id !== id));

  // ── Continue ──────────────────────────────────────────────────────────────
  const handleContinue = () => {
    onChange("academicPlanId")({ target: { value: selectedStructureId } });
    onChange("academicPlan")({ target: { value: selectedStructure?.name || "" } });
    onChange("transportRoute")({ target: { value: transportRoute } });
    onChange("transportStop")({ target: { value: transportStop } });
    onChange("discounts")({ target: { value: discounts } });
    onChange("additionalCharges")({ target: { value: charges } });
    goNext();
  };

  // ── Loading / error states ────────────────────────────────────────────────
  const isLoadingStructures = loading.getAll || loading.getActive;

  return (
    <div className="flex flex-col h-full bg-blue-100/30 rounded-xl">
      {/* ── Scrollable main body ── */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex-1 overflow-y-auto px-6 py-6"
      >
        {/* Page Header */}
        <div className="mb-5">
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-tight">
            Student Admission - Fee Plan Selection
          </h2>
          <p className="text-base text-slate-450 mt-1">
            Step 2 of 3 &bull; Confirm the academic and transport fee plan for this student
          </p>
        </div>

        {/* Callout Info Banner */}
        <div className="mb-6 bg-blue-100/55 border border-blue-100 rounded-xl px-5 py-3.5 flex items-center justify-between text-base text-blue-700 shadow-2xs">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-550 shrink-0" />
            <span>
              Student: <strong className="font-semibold text-blue-900">{form.studentName || "Aryan Sharma"}</strong>
              <span className="mx-2 text-blue-300">|</span>
              Grade Requested: <strong className="font-semibold text-blue-900">{form.grade || "Grade 8"}</strong>
              <span className="mx-2 text-blue-300">|</span>
              Transport Required: <strong className="font-semibold text-blue-900">{form.transportRequired ? "Yes" : "No"}</strong>
            </span>
          </div>
        </div>

        {/* API Error — only show for hard errors, not missing active structure */}
        {error && (
          <div className="mb-5 bg-rose-50 border border-rose-200 rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm text-rose-700 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Soft warning — no active structure found for this grade/year */}
        {!isLoadingStructures && !activeStructure && structures.length > 0 && (
          <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-3.5 flex items-center gap-3 text-sm text-amber-700 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            No active fee structure found for <strong className="mx-1">{grade}</strong> in <strong className="mx-1">{academicYear}</strong>. Please select one manually below.
          </div>
        )}

        {/* Upper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

          {/* ── Left: Academic Fee Plan ── */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <GraduationCap className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Academic Fee Plan</h3>
                </div>
                <button type="button" className="text-slate-400 hover:text-slate-600 transition">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-5">
                Selected fee structure will be applied for the academic year.
              </p>

              {/* Row of Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {/* Academic Year */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Academic Year</label>
                  <div className="relative">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
                    >
                      <option>2025-2026</option>
                      <option>2026-2027</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Grade */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Grade / Standard</label>
                  <div className="relative">
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
                    >
                      {["LKG", "UKG", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade"].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                {/* Fee Structure — from API */}
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Fee Structure</label>
                  <div className="relative flex items-center">
                    {isLoadingStructures ? (
                      <div className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-2 text-sm text-slate-400 font-semibold">
                        <Loader2 className="w-4 h-4 animate-spin" /> Loading...
                      </div>
                    ) : (
                      <>
                        <select
                          value={selectedStructureId || ""}
                          onChange={(e) => setSelectedStructureId(e.target.value)}
                          className="w-full h-11 pl-3 pr-20 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-bold"
                        >
                          {filteredStructures.length === 0 && (
                            <option value="">No structures available</option>
                          )}
                          {filteredStructures.map((s) => (
                            <option key={s._id} value={s._id}>
                              {s.standard} - Academic Plan ({s.academicYear})
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                        {selectedStructure && (selectedStructure.status === "active" || selectedStructure.isActive) && (
                          <span className="absolute right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-205 pointer-events-none">
                            Active
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Heads Table — from selected structure */}
              {isLoadingStructures ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm font-semibold">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading fee heads...
                </div>
              ) : heads.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-slate-400 gap-2 text-sm font-semibold">
                  <AlertCircle className="w-5 h-5" /> No fee heads found for this structure.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="py-2.5 text-sm font-bold text-slate-400">Fee Head</th>
                        <th className="py-2.5 text-sm font-bold text-slate-400 text-right pr-6">Amount (₹)</th>
                        <th className="py-2.5 text-sm font-bold text-slate-400 text-center">Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/60">
                      {heads.map((head, i) => {
                        const isMandatory = head.mandatory !== false;
                        const freqLabel = head.frequency === "one-time"
                          ? "One-time"
                          : (head.frequency || "").charAt(0).toUpperCase() + (head.frequency || "").slice(1);
                        return (
                          <tr key={i} className="hover:bg-slate-50/45 transition-colors">
                            <td className="py-3">
                              <div className="font-semibold text-slate-700 text-sm">{head.name}</div>
                              <div className="text-xs text-slate-400 font-semibold">{freqLabel}</div>
                            </td>
                            <td className="py-3 text-right font-bold text-slate-750 text-sm pr-6">
                              ₹ {(head.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="py-3 text-center">
                              <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${
                                isMandatory
                                  ? "bg-green-50 text-green-650 border-green-100"
                                  : "bg-blue-50 text-blue-650 border-blue-100"
                              }`}>
                                {isMandatory ? "Mandatory" : "Optional"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Academic Subtotal */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 mb-3.5 shadow-2xs">
                <span className="text-sm font-bold text-blue-700">Academic Subtotal</span>
                <span className="text-base font-black text-blue-700">₹ {academicSubtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                <Info className="w-4 h-4 text-blue-405 shrink-0" />
                <span>Mandatory fee heads are applicable for all students. Optional fee heads may vary.</span>
              </div>
            </div>
          </div>

          {/* ── Right: Transport Fee Plan ── */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500">
                    <Bus className="w-5.5 h-5.5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Transport Fee Plan</h3>
                </div>
                <button type="button" className="text-slate-400 hover:text-slate-600 transition">
                  <Info className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-400 mb-5">Selected route and drop point for this student.</p>

              {form.transportRequired ? (
                <div className="mb-5 bg-green-50/50 border border-green-150 rounded-xl p-4 flex items-start gap-3.5">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-green-800">Transport is required for this student</div>
                    <div className="text-xs text-green-600 font-semibold mt-0.5">Selected transport plan is shown below.</div>
                  </div>
                </div>
              ) : (
                <div className="mb-5 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5">
                  <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-slate-700">Transport is not requested</div>
                    <div className="text-xs text-slate-400 font-semibold mt-0.5">Go back to step 1 to request transport.</div>
                  </div>
                </div>
              )}

              <div className="space-y-4.5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Route</label>
                  <div className="relative flex items-center">
                    <select
                      value={transportRoute}
                      onChange={(e) => setTransportRoute(e.target.value)}
                      disabled={!form.transportRequired}
                      className="w-full h-11 pl-3 pr-20 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-bold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                      <option value="Route 3 - City Center to School">Route 3 - City Center to School</option>
                      <option value="Route 1 - North Zone">Route 1 - North Zone</option>
                      <option value="Route 2 - South Zone">Route 2 - South Zone</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                    {form.transportRequired && (
                      <span className="absolute right-8 px-2 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 pointer-events-none">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Drop Point / Stop</label>
                  <input
                    type="text"
                    value={transportStop}
                    onChange={(e) => setTransportStop(e.target.value)}
                    disabled={!form.transportRequired}
                    placeholder="e.g. Green Park Colony"
                    className="w-full h-11 px-3 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Transport Fee</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-sm text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        value={transportFee}
                        onChange={(e) => setTransportFee(parseFloat(e.target.value) || 0)}
                        disabled={!form.transportRequired}
                        className="w-full h-11 pl-7 pr-3 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1.5">Frequency</label>
                    <div className="relative">
                      <select
                        value={transportFrequency}
                        onChange={(e) => setTransportFrequency(e.target.value)}
                        disabled={!form.transportRequired}
                        className="w-full h-11 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
                      >
                        <option>Yearly</option>
                        <option>Monthly</option>
                        <option>Termly</option>
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-2.5 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">Status</label>
                  <div className="w-full h-11 px-3 rounded-lg border border-slate-200 bg-slate-50/70 flex items-center">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${form.transportRequired
                        ? "bg-green-50 text-green-600 border-green-100"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                      }`}>
                      {form.transportRequired ? transportStatus : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between bg-blue-50/40 border border-blue-100/50 rounded-xl p-4 shadow-2xs">
                <span className="text-sm font-bold text-blue-700">Transport Subtotal</span>
                <span className="text-base font-black text-blue-700">₹ {transportSubtotal.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col gap-5">
          {/* Adjustments */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
            <button
              type="button"
              onClick={() => setAdjustmentsExpanded(!adjustmentsExpanded)}
              className="w-full flex items-center justify-between px-6 py-4.5 bg-slate-50/40 border-b border-slate-200/60 hover:bg-slate-50/60 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-base font-bold text-slate-800">Additional Adjustments</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-semibold">Add discounts, concessions, or additional charges if applicable.</p>
                </div>
              </div>
              {adjustmentsExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>

            {adjustmentsExpanded && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                {/* Discounts */}
                <div className="border-r border-slate-100 pr-0 md:pr-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-md bg-green-50 border border-green-100 flex items-center justify-center text-green-500">
                      <Percent className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">Discounts</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <span className="text-xs font-semibold text-slate-400 flex-1">Discount Type</span>
                    <span className="text-xs font-semibold text-slate-400 w-20 text-left pl-1">Amount (₹)</span>
                    <span className="w-8" />
                  </div>
                  <div className="space-y-3 mb-4">
                    {discounts.map((discount, index) => (
                      <div key={discount.id} className="flex items-center gap-2">
                        <div className="relative flex-1 min-w-0">
                          <select
                            value={discount.type}
                            onChange={(e) => handleDiscountChange(index, "type", e.target.value)}
                            className="w-full h-10 px-3 pr-8 text-sm rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition appearance-none cursor-pointer font-semibold"
                          >
                            <option value="Scholarship">Scholarship</option>
                            <option value="Sibling Discount">Sibling Discount</option>
                            <option value="Staff Discount">Staff Discount</option>
                            <option value="Custom Discount">Custom Discount</option>
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-3 w-4 h-4 text-slate-400" />
                        </div>
                        <div className="relative w-20 shrink-0">
                          <span className="absolute left-2.5 top-2.5 text-sm text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={discount.amount}
                            onChange={(e) => handleDiscountChange(index, "amount", parseFloat(e.target.value) || 0)}
                            className="w-full h-10 pl-5 pr-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDiscount(discount.id)}
                          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-rose-100 hover:border-rose-250 text-rose-500 hover:bg-rose-50/50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addDiscount}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-sm font-bold text-slate-605 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Discount
                  </button>
                </div>

                {/* Additional Charges */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-md bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                      <Plus className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">Additional Charges</h4>
                  </div>
                  <div className="flex items-center gap-2 mb-2 px-0.5">
                    <span className="text-xs font-semibold text-slate-400 flex-1">Charge Name</span>
                    <span className="text-xs font-semibold text-slate-400 w-20 text-left pl-1">Amount (₹)</span>
                    <span className="w-8" />
                  </div>
                  <div className="space-y-3 mb-4">
                    {charges.map((charge, index) => (
                      <div key={charge.id} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={charge.name}
                          placeholder="Charge name"
                          onChange={(e) => handleChargeChange(index, "name", e.target.value)}
                          className="flex-1 min-w-0 h-10 px-3 text-sm font-semibold rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                        />
                        <div className="relative w-20 shrink-0">
                          <span className="absolute left-2.5 top-2.5 text-sm text-slate-400 font-bold">₹</span>
                          <input
                            type="number"
                            value={charge.amount}
                            onChange={(e) => handleChargeChange(index, "amount", parseFloat(e.target.value) || 0)}
                            className="w-full h-10 pl-5 pr-2.5 text-sm font-bold rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCharge(charge.id)}
                          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg border border-rose-100 hover:border-rose-250 text-rose-500 hover:bg-rose-50/50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addCharge}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:text-blue-600 text-sm font-bold text-slate-605 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Charge
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Fee Plan Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-550">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 font-sans">
                  Fee Plan Summary <span className="text-slate-400 font-normal text-sm">(Estimated)</span>
                </h3>
              </div>

              <div className="space-y-4 text-sm mb-5 font-semibold text-slate-500">
                <div className="flex justify-between items-center">
                  <span>Academic Subtotal</span>
                  <span className="font-bold text-slate-705">₹ {academicSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Transport Fee</span>
                  <span className="font-bold text-slate-705">₹ {transportSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Additional Charges</span>
                  <span className="font-bold text-green-600">+ ₹ {additionalChargesTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discounts</span>
                  <span className="font-bold text-rose-500">- ₹ {discountsTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="h-px bg-slate-100 my-2" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-bold text-slate-800">Estimated Total</span>
                  <span className="text-2xl font-black text-blue-650">₹ {estimatedTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl px-4 py-3.5 text-xs text-blue-700 leading-relaxed mt-auto font-semibold">
              <Info className="w-4.5 h-4.5 text-blue-500 shrink-0 mt-0.5" />
              <span>Final payable amount will be confirmed in the review step.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div style={{ maxHeight: showFooter ? "80px" : "0px", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div
          style={{ transform: showFooter ? "translateY(0)" : "translateY(100%)", opacity: showFooter ? 1 : 0, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease" }}
          className="flex items-center justify-between px-6 py-4.5 border-t border-slate-200 bg-white"
        >
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            Back to Step 1
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={handleContinue}
              disabled={!selectedStructureId || isLoadingStructures}
              className="flex items-center gap-2 h-10 px-6 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition active:scale-95 cursor-pointer shadow-md shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Next Step
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}