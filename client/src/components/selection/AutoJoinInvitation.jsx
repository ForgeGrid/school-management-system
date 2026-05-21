import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Loader2, CheckCircle2, AlertCircle, RefreshCw, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { acceptInvitation } from "../../redux/slice/Invitationslice";
import { fetchMe } from "../../redux/slice/getmeslice";
import { logout } from "../../redux/slice/getmeslice";
import { logoutUserThunk } from "../../redux/slice/authslice";
import { Button } from "../ui/Button";

export default function AutoJoinInvitation() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userEmail = useSelector((state) => state.getme?.user?.email || "");
  const invitation = useSelector((state) => state.getme?.invitation);
  const token = invitation?.token;
  const orgName = invitation?.adminName || "your organization";

  const [step, setStep] = useState("loading"); // "loading" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");
  const [loadingText, setLoadingText] = useState("Setting up your workspace...");

  // Progress percentage to show visual movement
  const [progress, setProgress] = useState(15);

  // Auto-changing text steps for premium transitional feel
  useEffect(() => {
    if (step !== "loading") return;

    const timer1 = setTimeout(() => {
      setLoadingText("Joining your organization...");
      setProgress(55);
    }, 1200);

    const timer2 = setTimeout(() => {
      setLoadingText("Configuring permissions...");
      setProgress(85);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [step]);

  // Perform invitation acceptance on mount
  useEffect(() => {
    let active = true;

    const executeAcceptance = async () => {
      if (!token) {
        if (active) {
          setStep("error");
          setErrorMessage("No invitation token detected. Please contact your administrator.");
        }
        return;
      }

      try {
        // Call the accept endpoint via Redux thunk
        await dispatch(acceptInvitation({ token })).unwrap();
        
        if (!active) return;
        
        // Acceptance succeeded!
        setProgress(100);
        setStep("success");
        
        // Wait a brief moment so the user sees the success state before redirecting
        setTimeout(async () => {
          try {
            await dispatch(fetchMe()).unwrap();
          } catch (fetchErr) {
            console.error("Failed to fetch fresh user profile:", fetchErr);
            if (active) {
              setStep("error");
              setErrorMessage("Invitation accepted, but failed to load dashboard. Please refresh.");
            }
          }
        }, 1200);

      } catch (err) {
        console.error("Invitation acceptance error:", err);
        if (active) {
          setStep("error");
          setErrorMessage(err || "Failed to join the organization. The invitation may be invalid or expired.");
        }
      }
    };

    executeAcceptance();

    return () => {
      active = false;
    };
  }, [dispatch, token]);

  const handleRetry = () => {
    setStep("loading");
    setErrorMessage("");
    setLoadingText("Re-joining your organization...");
    setProgress(30);
    
    // Trigger retry
    dispatch(acceptInvitation({ token }))
      .unwrap()
      .then(async () => {
        setProgress(100);
        setStep("success");
        setTimeout(async () => {
          await dispatch(fetchMe()).unwrap();
        }, 1200);
      })
      .catch((err) => {
        setStep("error");
        setErrorMessage(err || "Failed to join the organization. Please try again.");
      });
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUserThunk()).unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (e) {
      console.error("Logout failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="w-full max-w-md relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP: LOADING */}
          {step === "loading" && (
            <motion.div
              key="loading-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 flex flex-col items-center text-center"
            >
              {/* Spinning Logo Container */}
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-inner">
                  <Loader2 size={36} className="text-indigo-600 animate-spin" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-bold">ERP</span>
                </div>
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
                Workspace Onboarding
              </h2>
              <p className="text-slate-500 text-sm font-medium mb-6">
                Please wait a moment while we set things up for you.
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-1.5 mb-4 overflow-hidden">
                <motion.div
                  className="bg-indigo-600 h-1.5 rounded-full"
                  initial={{ width: "15%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Transitional Message */}
              <p className="text-indigo-600 text-sm font-semibold tracking-wide animate-pulse">
                {loadingText}
              </p>
            </motion.div>
          )}

          {/* STEP: SUCCESS */}
          {step === "success" && (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/40 flex flex-col items-center text-center"
            >
              {/* Success Badge */}
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner mb-6">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
                Welcome Aboard!
              </h2>
              <p className="text-slate-500 text-sm font-medium max-w-xs mb-6">
                You have successfully joined <span className="font-bold text-slate-700">{orgName}</span>.
              </p>

              <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Redirecting to your dashboard...</span>
              </div>
            </motion.div>
          )}

          {/* STEP: ERROR */}
          {step === "error" && (
            <motion.div
              key="error-state"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-red-50 flex flex-col items-center text-center"
            >
              {/* Error Badge */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center border border-red-100 mb-6">
                <AlertCircle size={32} className="text-red-500" />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-2">
                Onboarding Interrupted
              </h2>
              
              <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl p-4 mb-6 w-full text-justify font-medium">
                {errorMessage}
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-3">
                <Button
                  onClick={handleRetry}
                  className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-200 text-base flex items-center justify-center gap-2"
                >
                  <RefreshCw size={18} />
                  Try Again
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full h-12 rounded-xl bg-slate-50 border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 text-base flex items-center justify-center gap-2"
                >
                  <LogOut size={18} />
                  Logout and Use Another Account
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
