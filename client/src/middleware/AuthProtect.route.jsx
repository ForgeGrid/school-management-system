import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser, selectAuthStatus } from "../redux/slice/getmeSelector";
import { fetchMe } from "../redux/slice/getmeslice";
import CheckLoader from "../assets/CheckLoader.gif";

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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-indigo-50">
        <div className="flex flex-col items-center gap-3">
          <img src={CheckLoader} alt="Loading..." className="w-28 h-28 object-contain" />
          <p className="text-sm text-indigo-600 font-semibold animate-pulse">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return <Navigate to="/login" replace />;
  }

  return children;
}