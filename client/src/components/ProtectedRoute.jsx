import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Guards nested routes behind authentication, and optionally behind
 * a whitelist of roles.
 * Usage: <ProtectedRoute allowedRoles={['admin']} /> wrapping <Route>s.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, status } = useSelector((state) => state.auth);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
