import { useState, useRef, useEffect } from "react";
import { X, ShieldCheck, RotateCcw, CheckCircle2 } from "lucide-react";
import { BorderBeam } from "../ui/Borderbeam";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, resendOtp, clearAuthState } from "../../redux/slice/authslice"; 
const RESEND_SECONDS = 60;

function OtpModal({ isOpen, onClose, email }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resendFlash, setResendFlash] = useState(false);

  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  const { loading, error, success, message } = useSelector(
    (state) => state.auth
  );

  // RESET MODAL
  useEffect(() => {
    if (!isOpen) return;

    dispatch(clearAuthState()); 
    setOtp(Array(6).fill(""));
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setVerified(false);
  }, [isOpen]);

  // TIMER
  useEffect(() => {
    if (!isOpen) return;
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, isOpen]);

  // AUTO FOCUS
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  // SUCCESS
  useEffect(() => {
    if (success) {
      setVerified(true);
    }
  }, [success]);

  // OTP INPUT CHANGE
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // BACKSPACE
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // PASTE OTP
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  // VERIFY OTP
  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    dispatch(verifyOtp({ email, otp: code }));
  };

  // RESEND
  const handleResend = () => {
    if (!canResend) return;

    setOtp(Array(6).fill(""));
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setResendFlash(true);
    setTimeout(() => setResendFlash(false), 1500);
    inputRefs.current[0]?.focus();

    dispatch(resendOtp({ email })); 
  };

  // CLOSE
  const handleClose = () => {
    dispatch(clearAuthState()); 
    setOtp(Array(6).fill(""));
    setVerified(false);
    onClose();
  };

  const isComplete = otp.every((digit) => digit !== "");

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // BORDER BEAM COLORS
  const beam = error
    ? { colorFrom: "#f87171", colorTo: "#ef4444", duration: 0.9 }
    : verified
    ? { colorFrom: "#34d399", colorTo: "#10b981", duration: 2.5 }
    : { colorFrom: "#6366f1", colorTo: "#a855f7", duration: 2.5 };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <BorderBeam
          colorFrom={beam.colorFrom}
          colorTo={beam.colorTo}
          duration={beam.duration}
          size={300}
        />

        <div className="relative z-10 p-8 flex flex-col items-center gap-6">
          {/* CLOSE BUTTON */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>

          {verified ? (
            // SUCCESS STATE
            <div className="flex flex-col items-center gap-4 py-4 w-full">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-800">Verified!</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {message || "Your account has been successfully verified."}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200"
              >
                Continue
              </button>
            </div>
          ) : (
            <>
              {/* ICON */}
              <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8 text-indigo-500" />
              </div>

              {/* TITLE */}
              <div className="text-center flex flex-col gap-1">
                <h2 className="text-xl font-bold text-gray-800">
                  Verify your email
                </h2>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to{" "}
                  <span className="font-semibold text-indigo-600">{email}</span>
                </p>
              </div>

              {/* OTP INPUTS */}
              <div className="flex gap-2.5">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className={`w-11 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none transition-all duration-200
                      ${
                        error
                          ? "border-red-300 bg-red-50 text-red-600"
                          : digit
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 bg-gray-50 text-gray-700"
                      }
                      focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
                  />
                ))}
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-xs text-center text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 w-full">
                  {error}
                </p>
              )}

              {/* VERIFY BUTTON */}
              <button
                type="button"
                onClick={handleVerify}
                disabled={!isComplete || loading}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-xl transition-all duration-200"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* RESEND */}
              <div className="flex items-center justify-between w-full px-1">
                <span className="text-sm text-gray-500">
                  {resendFlash
                    ? "Code resent!"
                    : canResend
                    ? "Didn't receive the code?"
                    : "Resend in "}
                  {!canResend && !resendFlash && (
                    <span className="font-semibold text-indigo-500 tabular-nums">
                      {formatTime(timer)}
                    </span>
                  )}
                </span>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading}
                  className={`flex items-center gap-1 text-sm font-semibold transition-all duration-200
                    ${
                      canResend && !loading
                        ? "text-indigo-600 hover:text-indigo-700 cursor-pointer"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                >
                  <RotateCcw
                    className={`w-3.5 h-3.5 ${canResend && !loading ? "" : "opacity-40"}`}
                  />
                  Resend
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtpModal;