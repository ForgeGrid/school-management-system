import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser, selectAuthStatus } from "../redux/slice/getmeSelector";
import { fetchMe } from "../redux/slice/getmeslice";

export default function AuthProtectRoute({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const status = useSelector(selectAuthStatus);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMe());
    }
  }, [dispatch, status]);

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

  if (status === "failed") {
    return <Navigate to="/login" replace />;
  }

  return children;
}