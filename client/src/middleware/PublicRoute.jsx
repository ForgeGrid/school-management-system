import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {
  const { user } = useSelector((state) => state.auth);

  // Already logged in and verified
  if (user && user.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicRoute;