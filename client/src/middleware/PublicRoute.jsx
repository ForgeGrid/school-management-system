import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { selectUser, selectAuthStatus } from "../redux/slice/getmeSelector";
import { fetchMe } from "../redux/slice/getmeslice";
import CheckLoader from "../assets/CheckLoader.gif";
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-white to-indigo-50">
        <div>
          <img src={CheckLoader} alt="Loading..." className="w-28 h-28 object-contain" />
        </div>
      </div>
    );
  }

  // Not logged in (status === "failed" or no user), allow public page access
  return children;
};

export default PublicRoute;