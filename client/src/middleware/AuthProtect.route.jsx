import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthProtectRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Not logged in or not verified
  if (!user || !user.emailVerified) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AuthProtectRoute;