import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Camera, X } from "lucide-react";
import { toast } from "sonner";
import { registerUser, resendOtp, clearAuthState } from "../../redux/slice/authslice";
import PasswordStrengthBar from "../../components/Auth/PasswordStrengthbar";
import OtpModal from "../../components/Auth/OtpModal";

function Register({ onSwitchToLogin }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, registered, resendLoading, resendError } = useSelector((state) => state.auth);

  const fileRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (registered) setShowOtpModal(true);
  }, [registered]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  useEffect(() => {
    if (resendError) {
      toast.error(resendError);
    }
  }, [resendError]);

  useEffect(() => {
    const hasData = Object.values(form).some((val) => val.trim() !== "") || avatarFile;
    const handleBeforeUnload = (e) => {
      if (hasData) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form, avatarFile]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearAuthState());
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const needsVerification = error && error.toLowerCase().includes("already exists");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (needsVerification) {
      // resendOtp will succeed if unverified, or fail with "already verified" if verified
      dispatch(resendOtp({ email: form.email })).then((res) => {
        if (res.meta.requestStatus === "fulfilled") {
          setShowOtpModal(true);
        }
      });
      return;
    }
    if (!form.fullName || !form.email || !form.password) return;
    if (form.password !== form.confirmPassword) return;
    const payload = new FormData();
    payload.append("name", form.fullName);
    payload.append("email", form.email);
    payload.append("password", form.password);
    if (avatarFile) payload.append("profile-avatar", avatarFile);
    dispatch(registerUser(payload));
  };

  const passwordMismatch = form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <>
      <OtpModal isOpen={showOtpModal} onClose={() => setShowOtpModal(false)} email={form.email} />

      <div className="flex flex-col gap-3 sm:gap-4">

        {/* Avatar */}
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-14 h-14 sm:w-20 sm:h-20">
            <div
              onClick={() => !avatarPreview && fileRef.current?.click()}
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50 flex items-center justify-center cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 transition-all overflow-hidden"
            >
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
                : <div className="flex flex-col items-center gap-0.5">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  <span className="text-[9px] sm:text-[10px] text-indigo-400 font-medium leading-none">Upload</span>
                </div>
              }
            </div>
            {avatarPreview && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  setAvatarPreview(null); setAvatarFile(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
                className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all cursor-pointer"
              >
                <X className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white pointer-events-none" />
              </button>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-gray-400">Click to upload profile photo</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>



        {/* Full Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700">Full Name</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text" name="fullName" value={form.fullName} onChange={handleChange}
              placeholder="Enter your full name"
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700">Email Address</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="Enter your email"
              className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Password</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 sm:py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"} name="password"
                value={form.password} onChange={handleChange} placeholder="Password"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent min-w-0"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 shrink-0">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="h-4 sm:h-5">
              <PasswordStrengthBar password={form.password} />
            </div>
          </div>

          {/* Confirm */}
          <div className="flex flex-col gap-1">
            <label className="text-xs sm:text-sm font-semibold text-gray-700">Confirm Password</label>
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 sm:py-3 bg-white focus-within:ring-2 transition-all ${passwordMismatch
              ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50"
              : "border-gray-200 focus-within:border-indigo-400 focus-within:ring-indigo-50"
              }`}>
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type={showConfirm ? "text" : "password"} name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange} placeholder="Confirm"
                className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent min-w-0"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 shrink-0">
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="h-4 sm:h-5">
              {passwordMismatch && (
                <p className="text-[10px] text-red-500 leading-tight">Passwords don't match</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button" onClick={handleSubmit}
          disabled={loading || resendLoading || !!passwordMismatch}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3 sm:py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200 active:scale-[0.98]"
        >
          {loading || resendLoading
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <UserPlus className="w-4 h-4" />}
          {loading || resendLoading ? "Processing..." : (needsVerification ? "Verify Email" : "Create Account")}
        </button>

        {/* Login link */}
        <p className="text-center text-xs sm:text-sm text-gray-400 pb-1">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin ?? (() => navigate('/login'))}
            className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
          >
            Login
          </button>
        </p>

      </div>
    </>
  );
}

export default Register;