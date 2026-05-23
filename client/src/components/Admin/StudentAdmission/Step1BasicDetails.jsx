import { useState, useRef } from "react";
import { inputCls, Field, Section, SelectField, InfoBanner } from "./shared";


export function Step1BasicDetails({ form, onChange, goNext }) {
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showFooter, setShowFooter] = useState(false);
  const photoRef = useRef(null);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setShowFooter(scrollTop + clientHeight >= scrollHeight - 30);
    }
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = "";
  };

  return (
    <div className="flex flex-col h-full">

      {/* ── Scrollable body ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5"
      >
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-slate-800 leading-tight">Student Admission</h1>
          <p className="text-base text-slate-400 mt-0.5">Collect the student's basic information to begin admission</p>
        </div>

        {/* ── Student Account Details ── */}
        <Section title="Student Account Details" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        }>
          {/* Photo uploader */}
          <div className="flex items-center gap-5 mb-5 pb-5 border-b border-slate-100">
            <div className="relative shrink-0">
              <div
                onClick={() => photoRef.current?.click()}
                className="w-20 h-20 rounded-full bg-linear-to-br from-blue-50 to-slate-100 border-2 border-dashed border-blue-300 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-500 transition-all group"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-7 h-7 text-blue-300 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
              {!photoPreview && (
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <p className="text-base font-semibold text-slate-700 mb-0.5">Student Photo</p>
              <p className="text-sm text-slate-400 mb-2">JPG or PNG · Max 5 MB</p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="h-8 px-3 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
                  {photoPreview ? "Change photo" : "Upload photo"}
                </button>
                {photoPreview && (
                  <button type="button" onClick={removePhoto}
                    className="h-8 px-3 text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition">
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input ref={photoRef} type="file" accept="image/png,image/jpeg,image/jpg" className="hidden" onChange={handlePhoto} />
          </div>

          {/* Account fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="Student Name" required>
              <input className={inputCls} placeholder="Enter full name" value={form.studentName} onChange={onChange("studentName")} />
            </Field>
            <Field label="Email Address" required>
              <input className={inputCls} type="email" placeholder="Enter email address" value={form.email} onChange={onChange("email")} />
            </Field>
            <Field label="Password" required>
              <input className={inputCls} type="password" placeholder="Enter password" value={form.password} onChange={onChange("password")} />
            </Field>
            <Field label="Admission Number" required hint={
              <span className="flex items-center gap-1 text-slate-400">
                <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                </svg>
                Must be unique within this school
              </span>
            }>
              <input className={inputCls} placeholder="Enter admission number" value={form.admissionNumber} onChange={onChange("admissionNumber")} />
            </Field>
          </div>
        </Section>

        {/* ── Student Basic Profile ── */}
        <Section title="Student Basic Profile" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Gender" required>
              <SelectField value={form.gender} onChange={onChange("gender")}>
                <option value="">Select gender</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </SelectField>
            </Field>
            <Field label="Date of Birth" required>
              <input className={inputCls} type="date" value={form.dob} onChange={onChange("dob")} />
            </Field>
            <Field label="Requested Grade" required hint="This will determine academic path">
              <SelectField value={form.grade} onChange={onChange("grade")}>
                <option value="">Select requested grade</option>
                {["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
                  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"].map(g => <option key={g}>{g}</option>)}
              </SelectField>
            </Field>
          </div>
        </Section>

        {/* ── Parent / Guardian Details ── */}
        <Section title="Parent / Guardian Details" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Field label="Parent Name" required>
              <input className={inputCls} placeholder="Enter parent name" value={form.parentName} onChange={onChange("parentName")} />
            </Field>
            <Field label="Parent Email" required>
              <input className={inputCls} type="email" placeholder="Enter parent email" value={form.parentEmail} onChange={onChange("parentEmail")} />
            </Field>
            <Field label="Parent Phone" required>
              <input className={inputCls} type="tel" placeholder="Enter parent phone" value={form.parentPhone} onChange={onChange("parentPhone")} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Guardian Name">
              <input className={inputCls} placeholder="Enter guardian name" value={form.guardianName} onChange={onChange("guardianName")} />
            </Field>
            <Field label="Guardian Relation">
              <SelectField value={form.guardianRelation} onChange={onChange("guardianRelation")}>
                <option value="">e.g. Father, Mother, Uncle…</option>
                <option>Father</option><option>Mother</option><option>Uncle</option>
                <option>Aunt</option><option>Grandparent</option>
              </SelectField>
            </Field>
            <InfoBanner>
              If parent and guardian are the same person, you can fill the details accordingly.
            </InfoBanner>
          </div>
        </Section>

        {/* ── Address ── */}
        <Section title="Address" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        }>
          <div className="mb-4">
            <Field label="Street" required>
              <input className={inputCls} placeholder="Enter street address" value={form.street} onChange={onChange("street")} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="City" required>
              <input className={inputCls} placeholder="Enter city" value={form.city} onChange={onChange("city")} />
            </Field>
            <Field label="State" required>
              <input className={inputCls} placeholder="Enter state" value={form.state} onChange={onChange("state")} />
            </Field>
            <Field label="Postal Code" required>
              <input className={inputCls} placeholder="Enter postal code" value={form.postal} onChange={onChange("postal")} />
            </Field>
            <Field label="Country" required>
              <SelectField value={form.country} onChange={onChange("country")}>
                <option value="">Select country</option>
                <option>India</option><option>United States</option>
                <option>United Kingdom</option><option>Australia</option><option>Canada</option>
              </SelectField>
            </Field>
          </div>
        </Section>

        {/* ── Transport Preference ── */}
        <Section title="Transport Preference" icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="1" y="6" width="22" height="13" rx="2" />
            <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 19v2m14-2v2" />
          </svg>
        }>
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" role="switch" aria-checked={form.transportRequired}
                  onClick={() => onChange("transportRequired")({ target: { value: !form.transportRequired } })}
                  className={`relative w-11 h-6 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 ${form.transportRequired ? "bg-blue-600" : "bg-slate-300"}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${form.transportRequired ? "translate-x-5" : "translate-x-0"}`} />
                </button>
                <span className="text-base font-semibold text-slate-700">Transport Required</span>
              </div>
              <p className="text-sm text-slate-400">If enabled, transport fee selection will appear in the next step.</p>
            </div>
            {form.transportRequired && (
              <div className="flex-1">
                <div className="flex items-start gap-2.5 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-xs text-green-700 leading-relaxed">
                  <svg className="w-4 h-4 mt-0.5 shrink-0 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                  </svg>
                  Transport fee will be configured in the next step.
                </div>
              </div>
            )}
          </div>
        </Section>
      </div>

      {/* ── Footer — slides in when user reaches bottom ── */}
      <div style={{ maxHeight: showFooter ? "80px" : "0px", overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)" }}>
        <div
          style={{ transform: showFooter ? "translateY(0)" : "translateY(100%)", opacity: showFooter ? 1 : 0, transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease" }}
          className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 bg-white"
        >
          <button type="button" className="flex items-center gap-2 h-9 px-4 text-base font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14z" />
              <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>
          <button type="button" onClick={goNext} className="flex items-center gap-2 h-9 px-5 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 transition">
            Save &amp; Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
