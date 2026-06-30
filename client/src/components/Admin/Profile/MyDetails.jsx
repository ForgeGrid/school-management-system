import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateProfile,
  updateAvatar,
  selectProfileUser,
  selectProfileAvatar,
  selectLoadingUpdateProfile,
  selectLoadingUpdateAvatar,
  selectErrorUpdateProfile,
  selectErrorUpdateAvatar,
  clearError,
  clearSuccessMessage,
  selectSuccessMessage,
} from "../../../redux/slice/profileSlice"; 

/* ── Toast ───────────────────────────────────────────────────────────────── */
const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-500 text-white"}`}>
      {message}
    </div>
  );
};

/* ── Shared Primitives ───────────────────────────────────────────────────── */
const inputBase = "w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm text-gray-800 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-gray-400";
const Inp = (p) => <input {...p} className={inputBase} />;

const Lbl = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-800 mb-1.5">
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const BadgeGreen = ({ children }) => (
  <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{children}</span>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const SectionHead = ({ title, subtitle, action }) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div>
      <h2 className="text-base font-bold text-gray-900 leading-tight">{title}</h2>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

/* ── Info Card ───────────────────────────────────────────────────────────── */
const InfoCard = ({ icon, label, value, badge }) => (
  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${badge ? "bg-green-50" : "bg-blue-50"}`}>
      <span className={badge ? "text-green-600" : "text-blue-500"}>{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-gray-400 mb-0.5">{label}</p>
      {badge
        ? <BadgeGreen>{value}</BadgeGreen>
        : <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
      }
    </div>
  </div>
);

/* ── Icons ───────────────────────────────────────────────────────────────── */
const IcoUser  = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>;
const IcoCheck = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>;
const IcoCal   = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="4" width="18" height="18" rx="2"/><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18"/></svg>;
const IcoClock = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>;
const IcoMail  = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>;
const IcoBadge = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><rect x="4" y="3" width="16" height="18" rx="2"/><path strokeLinecap="round" d="M9 7h6M9 11h6M9 15h4"/></svg>;
const IcoBrief = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>;
const IcoBldg  = () => <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 7l9-4 9 4M4 7v14M20 7v14M9 21v-4a3 3 0 016 0v4"/></svg>;

/* ── Component ───────────────────────────────────────────────────────────── */
export default function MyDetails() {
  const dispatch = useDispatch();

  const user           = useSelector(selectProfileUser);
  const avatar         = useSelector(selectProfileAvatar);
  const loadingProfile = useSelector(selectLoadingUpdateProfile);
  const loadingAvatar  = useSelector(selectLoadingUpdateAvatar);
  const successMessage = useSelector(selectSuccessMessage);
  const errorProfile   = useSelector(selectErrorUpdateProfile);
  const errorAvatar    = useSelector(selectErrorUpdateAvatar);

  const [name, setName]                   = useState(user?.name ?? "");
  const [avatarPreview, setAvatarPreview] = useState(avatar?.secure_url ?? null);
  const [avatarFile, setAvatarFile]       = useState(null); // pending file, only sent on Submit
  const [toast, setToast]                 = useState(null);

  const isSaving = loadingProfile || loadingAvatar;

  // Sync name when user loads from Redux
  useEffect(() => { if (user?.name) setName(user.name); }, [user?.name]);

  // Sync avatar preview when Redux avatar updates after upload
  useEffect(() => { if (avatar?.secure_url) setAvatarPreview(avatar.secure_url); }, [avatar?.secure_url]);

  // Success toast
  useEffect(() => {
    if (successMessage) {
      setToast({ message: successMessage, type: "success" });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  // Error toasts
  useEffect(() => {
    if (errorProfile) {
      setToast({ message: errorProfile, type: "error" });
      dispatch(clearError("updateProfile"));
    }
  }, [errorProfile, dispatch]);

  useEffect(() => {
    if (errorAvatar) {
      setToast({ message: errorAvatar, type: "error" });
      dispatch(clearError("updateAvatar"));
    }
  }, [errorAvatar, dispatch]);

  // Only update local preview + hold the file — no API call until Submit is pressed
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    setAvatarFile(file);
  };

  const nameChanged   = name.trim() !== "" && name !== (user?.name ?? "");
  const avatarChanged = !!avatarFile;
  const hasChanges     = nameChanged || avatarChanged;

  // Single Submit handler — fires the relevant API calls only here
  const handleSubmit = () => {
    if (!hasChanges || isSaving) return;

    if (nameChanged) {
      dispatch(updateProfile({ name }));
    }
    if (avatarChanged) {
      dispatch(updateAvatar(avatarFile));
      setAvatarFile(null); // clear pending file once submitted
    }
  };

  const SubmitButton = (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={!hasChanges || isSaving}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shrink-0"
    >
      {isSaving ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Saving...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Submit
        </>
      )}
    </button>
  );

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-6">
        {/* Personal Information */}
        <Card>
          <div className="p-6">
            <SectionHead
              title="Personal Information"
              subtitle="Update your personal and contact details."
              action={SubmitButton}
            />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* LEFT: inputs */}
              <div className="lg:col-span-8 flex flex-col gap-4 max-w-xl">
                <div>
                  <Lbl required>Full Name</Lbl>
                  <Inp
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Lbl required>Email Address</Lbl>
                  <Inp
                    value={user?.email ?? ""}
                    readOnly
                    disabled
                  />
                </div>

              </div>

              {/* RIGHT: profile photo upload — original markup preserved */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="flex flex-col items-center gap-4 w-fit">
                  <p className="text-sm font-medium text-gray-800 self-start">Profile Photo</p>
                  <label className="relative flex items-center justify-center w-[100px] h-[100px] rounded-[1.25rem] border-2 border-dashed border-blue-200 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer group overflow-hidden">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 text-blue-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m7-7H5" />
                      </svg>
                    </div>
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isSaving} />
                  </label>
                  <p className="text-[11px] text-gray-400 text-center leading-tight mt-1">
                    {avatarFile ? "New photo selected — click Submit to save." : "JPG, PNG or GIF. Max size 2MB."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information — unchanged */}
        <Card>
          <div className="p-6">
            <SectionHead title="Contact Information" subtitle="Update your contact numbers." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Lbl required>Phone Number</Lbl>
                <Inp defaultValue="+1 (415) 555-0199" />
              </div>
              <div>
                <Lbl>Alternate Phone Number <span className="text-gray-400 font-normal ml-0.5">(Optional)</span></Lbl>
                <Inp placeholder="+1 (415) 555-0108 (Optional)" />
              </div>
            </div>
          </div>
        </Card>

        {/* Account Information — static values kept, role/email/status wired */}
        <Card>
          <div className="p-6">
            <SectionHead title="Account Information" subtitle="View your account and activity details." />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <InfoCard icon={<IcoUser />}  label="Role"                value={user?.role ?? "Teacher"} />
              <InfoCard icon={<IcoCheck />} label="Account Status"      value={user?.status ?? "Active"} badge />
              <InfoCard icon={<IcoClock />} label="Last Login"          value="23 Jun 2026, 09:12 AM" />
              <InfoCard icon={<IcoCheck />} label="Verification Status" value="Verified"               badge />
              <InfoCard icon={<IcoCal />}   label="Joined On"           value="18 Jul 2024" />
              <InfoCard icon={<IcoMail />}  label="Login Email"         value={user?.email ?? "priya.sharma@sunrisepublicschool.edu"} />
            </div>
          </div>
        </Card>

        {/* Employment Snapshot — unchanged */}
        <Card>
          <div className="p-6">
            <SectionHead title="Employment Snapshot" subtitle="Your employment and staff details." />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <InfoCard icon={<IcoBadge />} label="Employee ID"         value="EMP-205" />
              <InfoCard icon={<IcoBrief />} label="Employment Status"   value="Employed" badge />
              <InfoCard icon={<IcoCheck />} label="Verification Status" value="Verified" badge />
              <InfoCard icon={<IcoBldg />}  label="Department"          value="Teaching Staff" />
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}