import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStudent, selectStudentLoading, selectStudentNotification, clearStudentNotification } from "../../../redux/slice/schoolStudentSlice";
import { inputCls, Field, Section, SelectField, InfoBanner } from "./shared";

export function Step1BasicDetails({ form, onChange, goNext }) {
  const dispatch = useDispatch();

  const isLoading   = useSelector(selectStudentLoading("createStudent"));
  const notification = useSelector(selectStudentNotification);

  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showFooter, setShowFooter]     = useState(false);
  const [errors, setErrors]             = useState({});

  const photoRef = useRef(null);
  const scrollRef = useRef(null);

  // ── Scroll-to-reveal footer ──────────────────────────────────────────────
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowFooter(scrollTop + clientHeight >= scrollHeight - 30);
  };

  // ── Photo handling ────────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (photoRef.current) photoRef.current.value = "";
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const requiredFields = {
    studentName:     "Student Name",
    email:           "Email Address",
    password:        "Password",
    admissionNumber: "Admission Number",
    gender:          "Gender",
    dob:             "Date of Birth",
    grade:           "Requested Grade",
    parentName:      "Parent Name",
    parentEmail:     "Parent Email",
    parentPhone:     "Parent Phone",
    street:          "Street",
    city:            "City",
    state:           "State",
    postal:          "Postal Code",
    country:         "Country",
  };

  const validate = () => {
    const errs = {};
    Object.entries(requiredFields).forEach(([key, label]) => {
      if (!form[key]?.toString().trim()) errs[key] = `${label} is required`;
    });
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSaveAndContinue = async () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      // Scroll to first error
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});

    // Keys match exactly what createStudentService destructures from `data`
    const payload = {
      student_name:      form.studentName,
      email:             form.email,
      password:          form.password,
      admission_no:      form.admissionNumber,
      gender:            form.gender?.toLowerCase(),
      dob:               form.dob,
      requestedGrade:    form.grade,
      parent_name:       form.parentName,
      parent_email:      form.parentEmail,
      parent_phone:      form.parentPhone,
      guardian_name:     form.guardianName     || undefined,
      guardian_relation: form.guardianRelation || undefined,
      address: {
        street:  form.street,
        city:    form.city,
        state:   form.state,
        postal:  form.postal,
        country: form.country,
      },
      transport_required: form.transportRequired ?? false,
    };

    // Controller reads req.body directly (no multer) — always send JSON.
    // Photo upload can be wired separately once the backend adds multer.
    const result = await dispatch(createStudent(payload));

    if (createStudent.fulfilled.match(result)) {
      goNext(); // advance to Step 2 only on success
    }
    // On rejection the notification is set in the slice — shown in the UI below
  };

  // ── Save Draft (fire-and-forget, no validation) ───────────────────────────
  const handleSaveDraft = () => {
    // Persist form to localStorage so it survives a page refresh
    localStorage.setItem("studentAdmissionDraft", JSON.stringify(form));
  };

  // ── Dismiss notification ─────────────────────────────────────────────────
  const dismissNotification = () => dispatch(clearStudentNotification());

  // ── Field-error helper ───────────────────────────────────────────────────
  const fieldErr = (key) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-500">{errors[key]}</p>
    ) : null;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-blue-100/40 rounded-xl">

      {/* ── Toast notification (API success / error) ── */}
      {notification && (
        <div
          className={`mx-4 sm:mx-6 mt-4 flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium border
            ${notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"}`}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            onClick={dismissNotification}
            className="shrink-0 text-current opacity-60 hover:opacity-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

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
          <svg className="w-7 h-8 bg-blue-300/20 p-1" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
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
              <input className={`${inputCls} ${errors.studentName ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter full name" value={form.studentName} onChange={onChange("studentName")} />
              {fieldErr("studentName")}
            </Field>
            <Field label="Email Address" required>
              <input className={`${inputCls} ${errors.email ? "border-red-400 focus:ring-red-300" : ""}`}
                type="email" placeholder="Enter email address" value={form.email} onChange={onChange("email")} />
              {fieldErr("email")}
            </Field>
            <Field label="Password" required>
              <input className={`${inputCls} ${errors.password ? "border-red-400 focus:ring-red-300" : ""}`}
                type="password" placeholder="Enter password" value={form.password} onChange={onChange("password")} />
              {fieldErr("password")}
            </Field>
            <Field label="Admission Number" required hint={
              <span className="flex flex-row items-center gap-2 text-purple-500">
                <svg className="w-7 h-8 text-blue-400 bg-blue-300/20 p-1 rounded-xs" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
                </svg>
                Must be unique within this school
              </span>
            }>
              <input className={`${inputCls} ${errors.admissionNumber ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter admission number" value={form.admissionNumber} onChange={onChange("admissionNumber")} />
              {fieldErr("admissionNumber")}
            </Field>
          </div>
        </Section>

        {/* ── Student Basic Profile ── */}
        <Section title="Student Basic Profile" icon={
          <svg className="w-7 h-8 bg-blue-300/20 p-1" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
          </svg>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Gender" required>
              <SelectField value={form.gender} onChange={onChange("gender")}
                className={errors.gender ? "border-red-400" : ""}>
                <option value="">Select gender</option>
                <option value="male">Male</option><option value="female">Female</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option>
              </SelectField>
              {fieldErr("gender")}
            </Field>
            <Field label="Date of Birth" required>
              <input className={`${inputCls} ${errors.dob ? "border-red-400 focus:ring-red-300" : ""}`}
                type="date" value={form.dob} onChange={onChange("dob")} />
              {fieldErr("dob")}
            </Field>
            <Field label="Requested Grade" required hint="This will determine academic path">
              <SelectField value={form.grade} onChange={onChange("grade")}
                className={errors.grade ? "border-red-400" : ""}>
                <option value="">Select requested grade</option>
                {["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5",
                  "Grade 6","Grade 7","Grade 8","Grade 9","Grade 10"].map(g => <option key={g}>{g}</option>)}
              </SelectField>
              {fieldErr("grade")}
            </Field>
          </div>
        </Section>

        {/* ── Parent / Guardian Details ── */}
        <Section title="Parent / Guardian Details" icon={
          <svg className="w-7 h-8 bg-blue-300/20 p-1" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
          </svg>
        }>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Field label="Parent Name" required>
              <input className={`${inputCls} ${errors.parentName ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter parent name" value={form.parentName} onChange={onChange("parentName")} />
              {fieldErr("parentName")}
            </Field>
            <Field label="Parent Email" required>
              <input className={`${inputCls} ${errors.parentEmail ? "border-red-400 focus:ring-red-300" : ""}`}
                type="email" placeholder="Enter parent email" value={form.parentEmail} onChange={onChange("parentEmail")} />
              {fieldErr("parentEmail")}
            </Field>
            <Field label="Parent Phone" required>
              <input className={`${inputCls} ${errors.parentPhone ? "border-red-400 focus:ring-red-300" : ""}`}
                type="tel" placeholder="Enter parent phone" value={form.parentPhone} onChange={onChange("parentPhone")} />
              {fieldErr("parentPhone")}
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Guardian Name">
              <input className={inputCls} placeholder="Enter guardian name"
                value={form.guardianName} onChange={onChange("guardianName")} />
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
          <svg className="w-7 h-8 bg-blue-300/20 p-1" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        }>
          <div className="mb-4">
            <Field label="Street" required>
              <input className={`${inputCls} ${errors.street ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter street address" value={form.street} onChange={onChange("street")} />
              {fieldErr("street")}
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="City" required>
              <input className={`${inputCls} ${errors.city ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter city" value={form.city} onChange={onChange("city")} />
              {fieldErr("city")}
            </Field>
            <Field label="State" required>
              <input className={`${inputCls} ${errors.state ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter state" value={form.state} onChange={onChange("state")} />
              {fieldErr("state")}
            </Field>
            <Field label="Postal Code" required>
              <input className={`${inputCls} ${errors.postal ? "border-red-400 focus:ring-red-300" : ""}`}
                placeholder="Enter postal code" value={form.postal} onChange={onChange("postal")} />
              {fieldErr("postal")}
            </Field>
            <Field label="Country" required>
              <SelectField value={form.country} onChange={onChange("country")}
                className={errors.country ? "border-red-400" : ""}>
                <option value="">Select country</option>
                <option>India</option><option>United States</option>
                <option>United Kingdom</option><option>Australia</option><option>Canada</option>
              </SelectField>
              {fieldErr("country")}
            </Field>
          </div>
        </Section>

        {/* ── Transport Preference ── */}
        <Section title="Transport Preference" icon={
          <svg className="w-7 h-8 bg-blue-300/20 p-1" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
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
          style={{
            transform: showFooter ? "translateY(0)" : "translateY(100%)",
            opacity: showFooter ? 1 : 0,
            transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease",
          }}
          className="flex items-center justify-end gap-3 px-4 sm:px-6 py-4 border-t border-slate-100 bg-white"
        >
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isLoading}
            className="flex items-center gap-2 h-9 px-4 text-base font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14z" />
              <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            disabled={isLoading}
            className="flex items-center gap-2 h-9 px-5 text-base font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 transition"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={3} />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving…
              </>
            ) : (
              <>
                Save &amp; Continue
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}