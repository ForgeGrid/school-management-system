import { useState, useEffect, useRef } from "react";
import {
  Mail, ArrowRight, ShieldCheck, KeyRound,
  Lock, Eye, EyeOff, CheckCircle2,
} from "lucide-react";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const STEP_EMAIL = 1;
export const STEP_OTP   = 2;
export const STEP_RESET = 3;
export const STEP_DONE  = 4;

function ForgotSteps({
  step,
  email, setEmail,
  otp, setOtp,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  localError, setLocalError,
  onSendOtp, onVerifyOtp, onResetPassword, onBackToEmail, onClose,
  forgotLoading, forgotError,
  verifyResetLoading, verifyResetError,
  resetPasswordLoading, resetPasswordError,
}) {
  const [showNew, setShowNew]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const otpRefs = useRef([]);

  // Auto-focus first OTP box on step 2
  useEffect(() => {
    if (step === STEP_OTP) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── OTP handlers ────────────────────────────────────
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

  const otpComplete = otp.every((d) => d !== "");

  if (step === STEP_EMAIL) return (
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
            onKeyDown={(e) => e.key === "Enter" && onSendOtp()}
            placeholder="Enter your email"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
            autoFocus
          />
        </div>
      </div>

      <button
        onClick={onSendOtp}
        disabled={!isValidEmail(email) || forgotLoading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
      >
        {forgotLoading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <ArrowRight className="w-4 h-4" />}
        {forgotLoading ? "Sending OTP..." : "Send Reset OTP"}
      </button>
    </>
  );


  if (step === STEP_OTP) return (
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
              ${verifyResetError
                ? "border-red-300 bg-red-50 text-red-600"
                : digit
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-gray-50 text-gray-700"}
              focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
          />
        ))}
      </div>

      <button
        onClick={onVerifyOtp}
        disabled={!otpComplete || verifyResetLoading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
      >
        {verifyResetLoading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <ShieldCheck className="w-4 h-4" />}
        {verifyResetLoading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        type="button"
        onClick={onBackToEmail}
        className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors text-center"
      >
        ← Back to email
      </button>
    </>
  );

  
  if (step === STEP_RESET) return (
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
          <button type="button" onClick={() => setShowNew(!showNew)} className="text-gray-400 hover:text-gray-600 transition-colors">
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
            onKeyDown={(e) => e.key === "Enter" && onResetPassword()}
            placeholder="Re-enter your password"
            className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent"
          />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="text-gray-400 hover:text-gray-600 transition-colors">
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        onClick={onResetPassword}
        disabled={!newPassword || !confirmPassword || resetPasswordLoading}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-[0.98]"
      >
        {resetPasswordLoading
          ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <KeyRound className="w-4 h-4" />}
        {resetPasswordLoading ? "Resetting..." : "Reset Password"}
      </button>
    </>
  );

  // ── STEP 4 — Done ────────────────────────────────────
  if (step === STEP_DONE) return (
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
  );

  return null;
}

export default ForgotSteps;