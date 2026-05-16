import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { fetchMe, logout } from "../redux/slice/getmeslice";
import { logoutUserThunk } from "../redux/slice/authslice";
import {
  selectAppState,
  selectAuthStatus,
  selectSchool,
  selectUser,
} from "../redux/slice/getmeSelector";
import PendingApproval from "../components/selection/PendingApproval";

export default function AppGate({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const appState = useSelector(selectAppState);
  const status = useSelector(selectAuthStatus);
  const school = useSelector(selectSchool);
  const user = useSelector(selectUser);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  // Loading
  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading your account...</p>
        </div>
      </div>
    );
  }

  // Auth failed
  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-600 mb-4">Session expired. Please log in again.</p>
          <button
            onClick={() => { dispatch(logout()); navigate("/login"); }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // NO_SCHOOL — let TenantMain render (Register / Join cards)
  // if (appState === "NO_SCHOOL" || appState === "INVITED") {
  //   return <>{children}</>;
  // }
  if (appState === "NO_SCHOOL" || appState === "INVITED") {
    if (location.pathname !== "/dashboard") {
      return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // PENDING — full screen block
  if (appState === "PENDING_VERIFICATION") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <PendingApproval
            schoolName={school?.name}
            onRefresh={() => dispatch(fetchMe())}
            onLogout={() => { 
              dispatch(logoutUserThunk());
              dispatch(logout()); 
              navigate("/login"); 
            }}
          />
        </div>
      </div>
    );
  }

  // REJECTED
  if (appState === "REJECTED_VERIFICATION") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-red-100">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-8 h-8">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Verification Rejected</h2>
            <div className="p-4 bg-red-50 rounded-xl text-red-700 text-sm font-medium">
              Reason: {school?.rejection_reason || "No reason provided."}
            </div>
            <p className="text-slate-500 text-sm">
              Please contact support or register a new institution if you believe this is an error.
            </p>
            <button
              onClick={() => { 
                dispatch(logoutUserThunk());
                dispatch(logout()); 
                navigate("/login"); 
              }}
              className="w-full h-11 bg-slate-800 text-white rounded-xl text-sm font-semibold mt-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCHOOL_INACTIVE
  if (appState === "SCHOOL_INACTIVE") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-xl border border-amber-100">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-8 h-8">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">School Inactive</h2>
            <p className="text-slate-500 text-sm">
              Your school account has been disabled. Please contact your administrator or support.
            </p>
            <button
              onClick={() => { 
                dispatch(logoutUserThunk());
                dispatch(logout()); 
                navigate("/login"); 
              }}
              className="w-full h-11 bg-slate-800 text-white rounded-xl text-sm font-semibold mt-4"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE — redirect to correct portal based on role
  if (appState === "ACTIVE") {
    const role = user?.role; // "school_admin" | "teacher" | "student" etc.
    // const isAdmin = role === "admin" || user?.platformRole === "super_admin";
    const isAdmin = role === "school_admin" || role === "admin" || user?.platformRole === "super_admin";

    // If already on the right page, render it
    if (isAdmin && location.pathname.startsWith("/admin")) {
      return <>{children}</>;
    }
    if (!isAdmin && location.pathname.startsWith("/portal")) {
      return <>{children}</>;
    }

    // Redirect to correct portal
    // if (isAdmin) {
    //   navigate("/admin", { replace: true });
    // } else {
    //   navigate("/portal", { replace: true });
    // }
    // return null;
    
    if (isAdmin) {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/portal" replace />;
    }
  }

  // Fallback
  return <>{children}</>;
}