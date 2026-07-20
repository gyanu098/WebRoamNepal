import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly }) => {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (adminOnly && role !== "admin") {
    return <Navigate to="/home" />;
  }
  return children;
};
export default ProtectedRoute;

