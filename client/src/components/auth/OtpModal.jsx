import { useState, useRef, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp, resendOtp, clearAuthState } from "../../redux/slice/authslice"; 
import { Button } from "@/components/ui/button";

const RESEND_SECONDS = 300; 

function OtpModal({ isOpen, onClose, email }) {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [resendFlash, setResendFlash] = useState(false);

  const inputRefs = useRef([]);
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isOpen) return;
    dispatch(clearAuthState()); 
    setOtp(Array(6).fill(""));
    setTimer(RESEND_SECONDS);
    setCanResend(false);
  }, [isOpen]);

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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (success) {
      onClose(); 
    }
  }, [success]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = Array(6).fill("");
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    dispatch(verifyOtp({ email, otp: code }));
  };

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

  const handleClose = () => {
    dispatch(clearAuthState()); 
    setOtp(Array(6).fill(""));
    onClose();
  };

  const isComplete = otp.every((digit) => digit !== "");
  const formatTime = (s) => `${String(Math.floor(s / 60))}:${String(s % 60).padStart(2, "0")}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-[460px] rounded-2xl overflow-hidden bg-white shadow-2xl p-6 md:p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Texts */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Verify your email
          </h2>
          <p className="text-[15px] text-slate-600 mt-2">
            Code expires in <span className="font-bold text-slate-800">{formatTime(timer)}</span>
          </p>
          <p className="text-[15px] text-slate-500">
            Enter the 6-digit code sent to <span className="font-semibold text-slate-600">{email}</span>
          </p>
          {error && (
            <p className="text-[14px] font-bold text-red-500 mt-1">
              {error}
            </p>
          )}
        </div>

        {/* OTP Inputs */}
        <div className="flex gap-2 w-full justify-between">
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
              className={`w-12 h-14 md:w-14 md:h-14 text-center text-xl font-bold rounded-xl border outline-none transition-all duration-200
                ${
                  error
                    ? "border-red-300 bg-red-50 text-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-200 bg-white text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                }
              `}
            />
          ))}
        </div>

        {/* Static Alert Box */}
        <div className="w-full bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-[18px] h-[18px] text-[#ef4444]" fill="#ef4444" stroke="#fef2f2" />
            <h3 className="font-semibold text-[#ef4444] text-[15px]">Verification required</h3>
          </div>
          <p className="text-sm text-[#7f1d1d] pl-7 leading-relaxed">
            Do not close this tab. If verification is not completed, <span className="font-bold">you will need to restart the registration process.</span>
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || loading}
            className={`text-[15px] font-bold transition-all duration-200 ${canResend && !loading ? "text-[#8b5cf6] hover:text-[#7c3aed]" : "text-[#8b5cf6] opacity-70 cursor-not-allowed"}`}
          >
            {resendFlash ? "Code resent!" : "Resend code"}
          </button>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="px-6 h-11 rounded-xl border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 text-[15px]"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerify}
              disabled={!isComplete || loading}
              className={`px-8 h-11 rounded-xl text-white font-semibold text-[15px] transition-colors border-0
                ${isComplete && !loading ? "bg-[#a78bfa] hover:bg-[#8b5cf6]" : "bg-slate-300 hover:bg-slate-300 cursor-not-allowed opacity-90"}
              `}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OtpModal;