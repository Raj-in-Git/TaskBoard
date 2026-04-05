import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../auth/auth";

function ProtectedRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" />;
}

export default ProtectedRoute;