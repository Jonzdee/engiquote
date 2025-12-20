import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const role = localStorage.getItem("role"); // "user" | "guest"

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
