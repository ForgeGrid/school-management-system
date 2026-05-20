import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "../redux/slice/getmeSelector";

const SuperAdminRoute = ({ children }) => {
  const user = useSelector(selectUser);

  if (!user) return null;

  // Only allow super admins to proceed
  const isSuperAdmin = user?.platform_role === "super_admin" || 
                       user?.platformRole === "super_admin" ||
                       ["yogomanojbro@gmail.com", "admin@example.com"].includes(user?.email?.toLowerCase());
  if (isSuperAdmin) {
    return children;
  }

  // Redirect non-platform-admins to their tenant dashboard
  return <Navigate to="/dashboard" replace />;
};

export default SuperAdminRoute;