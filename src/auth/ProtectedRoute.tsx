import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "./authStore";
import { hasAnyRole, type Role } from "./roles";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !hasAnyRole(user?.roles, allowedRoles)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
