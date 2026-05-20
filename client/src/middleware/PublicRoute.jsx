import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser, selectAuthStatus } from "../redux/slice/getmeSelector";
import { fetchMe } from "../redux/slice/getmeslice";

const PublicRoute = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);
  const authUser = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMe());
    }
  }, [dispatch, status]);

  // If successfully logged in via auth form (just now) OR via session check
  if ((authUser && authUser.emailVerified) || (status === "succeeded" && user)) {
    return <Navigate to="/dashboard" replace />;
  }

  // While checking auth status, show a premium loading indicator
  if (status === "idle" || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  // Not logged in (status === "failed" or no user), allow public page access
  return children;
};

export default PublicRoute;