import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Camera, X } from "lucide-react";
import { registerUser, clearAuthState } from "../../redux/slice/authslice";
import PasswordStrengthBar from "../../components/auth/PasswordStrengthbar";
import OtpModal from "../../components/auth/OtpModal";

function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, success, registered } = useSelector((state) => state.auth);

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
    if (registered) {
      setShowOtpModal(true);
    }
  }, [registered]);

  // Warn on refresh if form has data
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
  };

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) return;
    if (form.password !== form.confirmPassword) return;

    const payload = new FormData();
    payload.append("name", form.fullName);
    payload.append("email", form.email);
    payload.append("password", form.password);
    if (avatarFile) payload.append("profile-avatar", avatarFile);

    dispatch(registerUser(payload));
  };

  const passwordMismatch =
    form.confirmPassword && form.password !== form.confirmPassword;

  return (
    <>
      {/*  OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        email={form.email}
      />

      <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">

        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-1.5">
          <div className="relative w-20 h-20">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-full border-2 border-dashed border-indigo-300 bg-indigo-50 flex items-center justify-center cursor-pointer hover:bg-indigo-100 hover:border-indigo-400 transition-all overflow-hidden"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover rounded-full" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Camera className="w-6 h-6 text-indigo-400" />
                  <span className="text-[10px] text-indigo-400 font-medium leading-none">Upload</span>
                </div>
              )}
            </div>
            {avatarPreview && (
              <button onClick={removeAvatar} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors">
                <X className="w-3 h-3 text-white" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">Click to upload profile photo</p>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
        </div>

        {/* API Error */}
        {error && (
          <p className="text-xs text-center text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Full Name</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="text" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Enter your full name" className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-700">Email Address</label>
          <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent" />
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Password</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input type={showPassword ? "text" : "password"} name="password" value={form.password} onChange={handleChange} placeholder="Password" className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent min-w-0" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 shrink-0">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <PasswordStrengthBar password={form.password} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Confirm</label>
            <div className={`flex items-center gap-2 border rounded-xl px-3 py-3 bg-white focus-within:ring-2 transition-all ${passwordMismatch ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-50" : "border-gray-200 focus-within:border-indigo-400 focus-within:ring-indigo-50"}`}>
              <Lock className="w-4 h-4 text-gray-400 shrink-0" />
              <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm" className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent min-w-0" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 shrink-0">
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {passwordMismatch && <p className="text-[10px] text-red-500 leading-tight">Passwords don't match</p>}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !!passwordMismatch}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200 active:scale-[0.98] mt-1"
        >
          {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </>
  );
}

export default Register;