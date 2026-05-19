import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock, Eye, EyeOff, LogIn, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  loginUser,
  fetchUserPreview,
  clearAuthState,
  clearPreview,
  resendOtp,
} from "../../redux/slice/authslice";
import ForgotPasswordModal from "../../components/Auth/ForgotPasswordModal";
import OtpModal from "../../components/Auth/OtpModal";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function Login({ onSwitchToRegister }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loginLoading, loginError, success, preview, previewFound, previewLoading, resendLoading, resendError } =
    useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);

  const debounceRef = useRef(null);

  useEffect(() => {
    if (success) {
      dispatch(clearAuthState());
      navigate("/dashboard");
    }
  }, [success]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthState());
      dispatch(clearPreview());
    };
  }, []);

  useEffect(() => {
    if (loginError) {
      toast.error(loginError);
    }
  }, [loginError]);

  useEffect(() => {
    if (resendError) {
      toast.error(resendError);
    }
  }, [resendError]);



  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!isValidEmail(form.email)) {
      dispatch(clearPreview());
      return;
    }
    debounceRef.current = setTimeout(() => {
      dispatch(fetchUserPreview(form.email));
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [form.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (loginError) dispatch(clearAuthState());
    if (name === "email") {
      setEmailBlurred(false);
      if (!value) dispatch(clearPreview());
    }
  };

  const needsVerification = loginError && loginError.toLowerCase().includes("verify your email");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (needsVerification) {
      setIsOtpOpen(true);
      dispatch(resendOtp({ email: form.email }));
      return;
    }
    if (!form.email || !form.password) return;
    dispatch(loginUser({ email: form.email, password: form.password }));
  };

  const showPreviewCard = emailBlurred && isValidEmail(form.email);

  return (
    <div className="flex flex-col gap-5">

      {/* Avatar Preview Card */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${showPreviewCard ? "max-h-36 opacity-100 mb-1" : "max-h-0 opacity-0"
          }`}
      >
        <div className="flex flex-col items-center gap-2 py-3 px-4 rounded-2xl border-gray-100">
          {previewLoading ? (
            <>
              <div className="w-14 h-14 rounded-full bg-indigo-200 animate-pulse" />
              <div className="h-3 w-24 rounded bg-indigo-200 animate-pulse" />
            </>
          ) : previewFound && preview ? (
            <>
              <div className="relative">
                {preview.avatar ? (
                  <img
                    src={preview.avatar}
                    alt={preview.username}
                    className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-300 shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-200 ring-2 ring-indigo-300 flex items-center justify-center shadow">
                    <span className="text-indigo-700 font-bold text-xl">
                      {preview.username?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <p className="text-sm font-semibold text-gray-700 leading-none">
                {preview.username}
              </p>
            </>
          ) : (
            <>
              <UserCircle2 className="w-14 h-14 text-gray-300" />
              <p className="text-xs text-gray-400">No account found for this email</p>
            </>
          )}
        </div>
      </div>


      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Email Address</label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white transition-all">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={() => setEmailBlurred(true)}
            onFocus={() => setEmailBlurred(false)}
            placeholder="Enter your email"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent
              [&:-webkit-autofill]:bg-transparent
              [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0px_1000px_white_inset]
              [&:-webkit-autofill]:[-webkit-text-fill-color:#374151]"
          />
        </div>
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-700">Password</label>
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
          <Lock className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Forgot Password */}
      <div className="flex justify-end -mt-2">
        <button
          type="button"
          onClick={() => setIsForgotOpen(true)}
          className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      {/* Login Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={loginLoading || resendLoading || !form.email || !form.password}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200 shadow-md shadow-indigo-200 active:scale-[0.98]"
      >
        {loginLoading || resendLoading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <LogIn className="w-4 h-4" />
        )}
        {loginLoading || resendLoading ? "Processing..." : (needsVerification ? "Verify Email" : "Login")}
      </button>

      {/* Register Link — now uses prop instead of navigate */}
      <p className="text-center text-sm text-gray-400 mt-1">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
        >
          Register
        </button>
      </p>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
      />

      {/* OTP Modal */}
      <OtpModal
        isOpen={isOtpOpen}
        onClose={() => setIsOtpOpen(false)}
        email={form.email}
      />
    </div>
  );
}

export default Login;