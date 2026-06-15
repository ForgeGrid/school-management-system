import { useState, useRef } from "react";
import { inputCls, Field, Section, SelectField } from "./shared";
import { LinkExistingParent } from "./LinkExistingParent";

export function Step1BasicDetails({ form, onChange, goNext }) {
  const [photoFile,    setPhotoFile]    = useState(form.avatarFile    || null);
  const [photoPreview, setPhotoPreview] = useState(form.avatarPreview || null);
  const [showFooter,   setShowFooter]   = useState(false);
  const [errors,       setErrors]       = useState({});

  const [parentMode, setParentMode] = useState(
    form.parentMode === "existing" ? "link" : "create"
  );

  const photoRef  = useRef(null);
  const scrollRef = useRef(null);

  // ── Scroll → reveal footer ───────────────────────────────────────────────
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setShowFooter(scrollTop + clientHeight >= scrollHeight - 30);
  };

  // ── Photo handling ───────────────────────────────────────────────────────
  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    onChange("avatarFile")({ target: { value: file } });
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result);
      onChange("avatarPreview")({ target: { value: reader.result } });
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    onChange("avatarFile")({ target: { value: null } });
    onChange("avatarPreview")({ target: { value: null } });
    if (photoRef.current) photoRef.current.value = "";
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const baseRequiredFields = {
    student_name:   "Student Name",
    email:          "Email Address",
    password:       "Password",
    admission_no:   "Admission Number",
    requestedGrade: "Requested Grade",
    gender:         "Gender",
    dob:            "Date of Birth",
    street:         "Street",
    city:           "City",
    state:          "State",
    postalCode:     "Postal Code",
    country:        "Country",
  };

  const newParentRequiredFields = {
    parent_name:  "Parent Name",
    parent_email: "Parent Email",
    parent_phone: "Parent Phone",
  };

  const validate = () => {
    const errs = {};

    Object.entries(baseRequiredFields).forEach(([key, label]) => {
      if (!form[key]?.toString().trim()) errs[key] = `${label} is required`;
    });

    if (parentMode === "create") {
      Object.entries(newParentRequiredFields).forEach(([key, label]) => {
        if (!form[key]?.toString().trim()) errs[key] = `${label} is required`;
      });
    } else {
      if (!form.parentUserId) {
        errs.parentUserId =
          "Please select an existing parent, or switch to 'Create New Parent'";
      }
    }

    return errs;
  };

  // ── Save & Continue ──────────────────────────────────────────────────────
  const handleSaveAndContinue = () => {
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setErrors({});

    // ✅ Build parent block — include guardian fields for new parent mode
    const parent =
      parentMode === "link"
        ? { mode: "existing", parentUserId: form.parentUserId }
        : {
            mode:               "new",
            name:               form.parent_name,
            email:              form.parent_email,
            primary_phone:      form.parent_phone,
            // optional guardian fields — sent only when filled
            ...(form.guardian_name     ? { guardian_name:     form.guardian_name     } : {}),
            ...(form.guardian_relation ? { guardian_relation: form.guardian_relation } : {}),
          };

    const address = {
      street:     form.street,
      city:       form.city,
      state:      form.state,
      postalCode: form.postalCode,
      country:    form.country,
    };

    onChange("parent")     ({ target: { value: parent      } });
    onChange("parentMode") ({ target: { value: parent.mode } });
    onChange("address")    ({ target: { value: address     } });

    goNext();
  };

  // ── Draft ────────────────────────────────────────────────────────────────
  const handleSaveDraft = () => {
    const { avatarFile, ...draftSafeForm } = form;
    localStorage.setItem("studentAdmissionDraft", JSON.stringify(draftSafeForm));
  };

  // ── Inline error helper ──────────────────────────────────────────────────
  const fieldErr = (key) =>
    errors[key] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
        {errors[key]}
      </p>
    ) : null;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full  rounded-2xl bg-blue-100/30 overflow-hidden hide-scrollbar">

      {/* ── Scrollable body ── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-0 hide-scrollbar "
      >
        {/* Page header */}
        <div className="mb-5 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Student Admission</h1>
          </div>
          <p className="text-sm text-slate-400 ml-3.5">
            Collect the student's basic information to begin admission
          </p>
        </div>

        {/* ── Student Account Details ── */}
        <Section
          title="Student Account Details"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
            </svg>
          }
        >
          {/* Photo uploader */}
          <div className="flex items-center gap-5 mb-5 pb-5 border-b border-slate-50">
            <div className="relative shrink-0">
              <div
                onClick={() => photoRef.current?.click()}
                className="w-[72px] h-[72px] rounded-2xl bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center cursor-pointer overflow-hidden hover:border-blue-400 hover:bg-blue-100/50 transition-all group"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Student" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-6 h-6 text-blue-300 group-hover:text-blue-500 transition" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                )}
              </div>
              {!photoPreview && (
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center shadow hover:bg-blue-700 transition"
                >
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 mb-0.5">Student Photo</p>
              <p className="text-xs text-slate-400 mb-2.5">JPG or PNG · Max 5 MB</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  className="h-7 px-3 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
                >
                  {photoPreview ? "Change photo" : "Upload photo"}
                </button>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="h-7 px-3 text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <input
              ref={photoRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={handlePhoto}
            />
          </div>

          {/* Account fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="Student Name" required>
              <input
                className={`${inputCls} ${errors.student_name ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                placeholder="Full name"
                value={form.student_name || ""}
                onChange={onChange("student_name")}
              />
              {fieldErr("student_name")}
            </Field>

            <Field label="Email Address" required>
              <input
                className={`${inputCls} ${errors.email ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                type="email"
                placeholder="student@example.com"
                value={form.email || ""}
                onChange={onChange("email")}
              />
              {fieldErr("email")}
            </Field>

            <Field label="Password" required>
              <input
                className={`${inputCls} ${errors.password ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                type="password"
                placeholder="Create password"
                value={form.password || ""}
                onChange={onChange("password")}
              />
              {fieldErr("password")}
            </Field>

            <Field
              label="Admission Number"
              required
              hint={
                <span className="flex items-center gap-1.5 text-violet-500 font-semibold">
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Must be unique within this school
                </span>
              }
            >
              <input
                className={`${inputCls} ${errors.admission_no ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                placeholder="e.g. ADM-2026-001"
                value={form.admission_no || ""}
                onChange={onChange("admission_no")}
              />
              {fieldErr("admission_no")}
            </Field>
          </div>
        </Section>

        {/* ── Student Basic Profile ── */}
        <Section
          title="Student Basic Profile"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
            </svg>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Gender" required>
              <SelectField
                value={form.gender || ""}
                onChange={onChange("gender")}
                className={errors.gender ? "border-red-300" : ""}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </SelectField>
              {fieldErr("gender")}
            </Field>

            <Field label="Date of Birth" required>
              <input
                className={`${inputCls} ${errors.dob ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                type="date"
                value={form.dob || ""}
                onChange={onChange("dob")}
              />
              {fieldErr("dob")}
            </Field>

            <Field
              label="Requested Grade"
              required
              hint={
                <span className="text-xs text-slate-400 font-medium">
                  This will determine academic path
                </span>
              }
            >
              <SelectField
                value={form.requestedGrade || ""}
                onChange={onChange("requestedGrade")}
                className={errors.requestedGrade ? "border-red-300" : ""}
              >
                <option value="">Select requested grade</option>
                {[
                  "LKG","UKG",
                  "Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6",
                  "Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12",
                ].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </SelectField>
              {fieldErr("requestedGrade")}
            </Field>
          </div>
        </Section>

        {/* ── Parent / Guardian Details ── */}
        <Section
          title="Parent / Guardian Details"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
        >
          {/* Mode toggle */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-5">
            <button
              type="button"
              onClick={() => setParentMode("link")}
              className={`flex items-center gap-1.5 h-8 px-4 text-xs font-bold rounded-lg transition-all ${
                parentMode === "link"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              Link Existing Parent
            </button>
            <button
              type="button"
              onClick={() => setParentMode("create")}
              className={`flex items-center gap-1.5 h-8 px-4 text-xs font-bold rounded-lg transition-all ${
                parentMode === "create"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              Create New Parent
            </button>
          </div>

          {/* Link mode */}
          {parentMode === "link" && (
            <>
              <LinkExistingParent
                studentName={form.student_name}
                admissionNumber={form.admission_no}
                onParentLinked={(parent) => {
                  onChange("parentUserId") ({ target: { value: parent.parentUserId } });
                  onChange("parent_name")  ({ target: { value: parent.name        } });
                  onChange("parent_email") ({ target: { value: parent.email       } });
                  onChange("parent_phone") ({ target: { value: parent.phone       } });
                }}
                onCreateNew={() => setParentMode("create")}
              />
              {fieldErr("parentUserId")}
              {form.parentUserId && (
                <div className="mt-3 flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-xs text-emerald-700 font-semibold">
                  <svg className="w-4 h-4 shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Linked to: {form.parent_name} ({form.parent_email})
                </div>
              )}
            </>
          )}

          {/* Create mode */}
          {parentMode === "create" && (
            <div className="space-y-4">
              {/* Row 1: Required parent fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Parent Name" required>
                  <input
                    className={`${inputCls} ${errors.parent_name ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                    placeholder="Parent full name"
                    value={form.parent_name || ""}
                    onChange={onChange("parent_name")}
                  />
                  {fieldErr("parent_name")}
                </Field>

                <Field label="Parent Email" required>
                  <input
                    className={`${inputCls} ${errors.parent_email ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                    type="email"
                    placeholder="parent@example.com"
                    value={form.parent_email || ""}
                    onChange={onChange("parent_email")}
                  />
                  {fieldErr("parent_email")}
                </Field>

                <Field label="Parent Phone" required>
                  <input
                    className={`${inputCls} ${errors.parent_phone ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.parent_phone || ""}
                    onChange={onChange("parent_phone")}
                  />
                  {fieldErr("parent_phone")}
                </Field>
              </div>

              {/* Row 2: Optional guardian fields + info hint */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                <Field label="Guardian Name">
                  <input
                    className={inputCls}
                    placeholder="Enter guardian name"
                    value={form.guardian_name || ""}
                    onChange={onChange("guardian_name")}
                  />
                </Field>

                <Field label="Guardian Relation">
                  <SelectField
                    value={form.guardian_relation || ""}
                    onChange={onChange("guardian_relation")}
                  >
                    <option value="">e.g. Father, Mother, Uncle...</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Other">Other</option>
                  </SelectField>
                </Field>

                {/* Info hint — matches the screenshot */}
                <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 font-semibold mt-0 sm:mt-6">
                  <svg className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                  </svg>
                  If parent and guardian are the same person, you can fill the details accordingly.
                </div>
              </div>
            </div>
          )}
        </Section>

        {/* ── Address ── */}
        <Section
          title="Address"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          }
        >
          <div className="mb-4">
            <Field label="Street" required>
              <input
                className={`${inputCls} ${errors.street ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                placeholder="Street address"
                value={form.street || ""}
                onChange={onChange("street")}
              />
              {fieldErr("street")}
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Field label="City" required>
              <input
                className={`${inputCls} ${errors.city ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                placeholder="City"
                value={form.city || ""}
                onChange={onChange("city")}
              />
              {fieldErr("city")}
            </Field>
            <Field label="State" required>
              <input
                className={`${inputCls} ${errors.state ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                placeholder="State"
                value={form.state || ""}
                onChange={onChange("state")}
              />
              {fieldErr("state")}
            </Field>
            <Field label="Postal Code" required>
              <input
                className={`${inputCls} ${errors.postalCode ? "border-red-300 focus:ring-red-100 bg-red-50/30" : ""}`}
                placeholder="Postal code"
                value={form.postalCode || ""}
                onChange={onChange("postalCode")}
              />
              {fieldErr("postalCode")}
            </Field>
            <Field label="Country" required>
              <SelectField
                value={form.country || ""}
                onChange={onChange("country")}
                className={errors.country ? "border-red-300" : ""}
              >
                <option value="">Select country</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Canada">Canada</option>
              </SelectField>
              {fieldErr("country")}
            </Field>
          </div>
        </Section>

        {/* ── Transport Preference ── */}
        <Section
          title="Transport Preference"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="1" y="6" width="22" height="13" rx="2" />
              <path d="M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2M5 19v2m14-2v2" strokeLinecap="round" />
            </svg>
          }
        >
          <div
            className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer w-full sm:w-auto ${
              form.transport_required
                ? "bg-blue-50/60 border-blue-200"
                : "bg-slate-50 border-slate-100"
            }`}
            onClick={() =>
              onChange("transport_required")({ target: { value: !form.transport_required } })
            }
          >
            <button
              type="button"
              role="switch"
              aria-checked={form.transport_required}
              className={`relative w-11 h-6 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1 ${
                form.transport_required ? "bg-blue-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                  form.transport_required ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <div>
              <p className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                Transport Required
                {form.transport_required && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Enabled
                  </span>
                )}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                {form.transport_required
                  ? "Route & stop will be assigned in the next step"
                  : "Enable to assign a bus route in Step 2"}
              </p>
            </div>
          </div>

          {form.transport_required && (
            <div className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 font-semibold">
              <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
              Transport is enabled. You'll select the route, stop, and fee in Step 2.
            </div>
          )}
        </Section>

        <div className="h-2" />
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          maxHeight:  showFooter ? "72px" : "0px",
          overflow:   "hidden",
          transition: "max-height 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div
          style={{
            transform:  showFooter ? "translateY(0)" : "translateY(100%)",
            opacity:    showFooter ? 1 : 0,
            transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.2s ease",
          }}
          className="flex items-center justify-end gap-2.5 px-4 sm:px-5 py-3.5 border-t border-slate-100 bg-white"
        >
          <button
            type="button"
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 h-9 px-4 text-sm font-semibold text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-700 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v14z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            Save Draft
          </button>

          <button
            type="button"
            onClick={handleSaveAndContinue}
            className="flex items-center gap-1.5 h-9 px-5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200/60"
          >
            Save &amp; Continue
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}