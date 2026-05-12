import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Mail, ArrowRight, CheckCircle2, ShieldCheck, Lock, Eye, EyeOff, KeyRound } from "lucide-react";
import {
  forgotPasswordRequest,
  verifyResetOtp,
  resetPassword,
  clearForgotState,
} from "../../redux/slice/authslice";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Step indicators
const STEP_EMAIL = 1;
const STEP_OTP   = 2;
const STEP_RESET = 3;
const STEP_DONE  = 4;

function ForgotPasswordModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const {
    forgotLoading, forgotError, forgotSuccess,
    verifyResetLoading, verifyResetError, verifyResetSuccess,
    resetPasswordLoading, resetPasswordError, resetPasswordSuccess,
  } = useSelector((s) => s.auth);

  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [localError, setLocalError] = useState("");

  const overlayRef = useRef(null);
  const otpRefs = useRef([]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(STEP_EMAIL);
      setEmail("");
      setOtp(Array(6).fill(""));
      setNewPassword("");
      setConfirmPassword("");
      setShowNew(false);
      setShowConfirm(false);
      setLocalError("");
      dispatch(clearForgotState());
    }
  }, [isOpen]);

  // Advance step when step-1 succeeds
  useEffect(() => {
    if (forgotSuccess) setStep(STEP_OTP);
  }, [forgotSuccess]);

  // Advance step when step-2 succeeds
  useEffect(() => {
    if (verifyResetSuccess) setStep(STEP_RESET);
  }, [verifyResetSuccess]);

  // Advance step when step-3 succeeds
  useEffect(() => {
    if (resetPasswordSuccess) setStep(STEP_DONE);
  }, [resetPasswordSuccess]);

  // Auto-focus first OTP box when entering step 2
  useEffect(() => {
    if (step === STEP_OTP) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── OTP input handlers ──────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // ── Submit handlers ─────────────────────────────────
  const handleSendOtp = () => {
    if (!isValidEmail(email) || forgotLoading) return;
    dispatch(forgotPasswordRequest(email));
  };

  const handleVerifyOtp = () => {
    const code = otp.join("");
    if (code.length < 6 || verifyResetLoading) return;
    dispatch(verifyResetOtp({ email, otp: code }));
  };

  const handleResetPassword = () => {
    setLocalError("");
    if (!newPassword || !confirmPassword) {
      setLocalError("Both fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setLocalError("Passwords do not match.");
      return;
    }
    dispatch(resetPassword({ email, otp: otp.join(""), newPassword }));
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const otpComplete = otp.every((d) => d !== "");

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ── Step indicator dots ── */}
        {step !== STEP_DONE && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {[STEP_EMAIL, STEP_OTP, STEP_RESET].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  step === s
                    ? "w-6 bg-indigo-600"
                    : step > s
                    ? "w-3 bg-indigo-300"
                    : "w-3 bg-gray-200"
                }`}
              />
            ))}
          </div>
        )}

        {/* ══════════════════════════════════
            STEP 1 — Enter Email
        ══════════════════════════════════ */}
        {step === STEP_EMAIL && (
          <>
            <div className="mb-5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Forgot your password?</h3>
              <p className="text-sm text-gray-500 mt-1">
                Enter your email and we'll send you a reset OTP.
              </p>
            </div>

            {forgotError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {forgotError}
              </p>
            )}

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                  placeholder="Enter your email"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={!isValidEmail(email) || forgotLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
            >
              {forgotLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {forgotLoading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </>
        )}

        {/* ══════════════════════════════════
            STEP 2 — Enter OTP
        ══════════════════════════════════ */}
        {step === STEP_OTP && (
          <>
            <div className="mb-5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Enter OTP</h3>
              <p className="text-sm text-gray-500 mt-1">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-indigo-600">{email}</span>.
                It expires in 10 minutes.
              </p>
            </div>

            {verifyResetError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {verifyResetError}
              </p>
            )}

            {/* OTP boxes */}
            <div className="flex gap-2.5 justify-center mb-5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  onPaste={handleOtpPaste}
                  className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all duration-200
                    ${
                      verifyResetError
                        ? "border-red-300 bg-red-50 text-red-600"
                        : digit
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-gray-50 text-gray-700"
                    }
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={!otpComplete || verifyResetLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
            >
              {verifyResetLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {verifyResetLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(STEP_EMAIL);
                setOtp(Array(6).fill(""));
                dispatch(clearForgotState());
              }}
              className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
            >
              ← Back to email
            </button>
          </>
        )}

        {/* ══════════════════════════════════
            STEP 3 — New Password
        ══════════════════════════════════ */}
        {step === STEP_RESET && (
          <>
            <div className="mb-5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Set new password</h3>
              <p className="text-sm text-gray-500 mt-1">
                Choose a strong password for your account.
              </p>
            </div>

            {(localError || resetPasswordError) && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
                {localError || resetPasswordError}
              </p>
            )}

            {/* New Password */}
            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-sm font-semibold text-gray-700">New Password</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setLocalError(""); }}
                  placeholder="Min. 8 characters"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3 bg-white focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  placeholder="Re-enter your password"
                  className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleResetPassword}
              disabled={!newPassword || !confirmPassword || resetPasswordLoading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
            >
              {resetPasswordLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              {resetPasswordLoading ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* ══════════════════════════════════
            STEP 4 — Done
        ══════════════════════════════════ */}
        {step === STEP_DONE && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Password Reset!</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your password has been updated successfully. You can now log in with your new password.
            </p>
            <button
              onClick={onClose}
              className="mt-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-all"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordModal;