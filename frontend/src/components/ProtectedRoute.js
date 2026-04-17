import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";
import { hasAccess } from "../utils/permissions";

function ProtectedRoute({ children, module }) {
  // 🔐 Check login
  if (!isAuthenticated()) {
    return <Navigate to="/" />;
  }

  // 🔥 Check role access (RBAC)
  if (module && !hasAccess(module)) {
    return <h2 style={{ padding: "20px" }}>Access Denied</h2>;
  }

  return children;
}

export default ProtectedRoute;