import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/loginSlice";

export function PrivateRoute() {
  const user = useSelector(selectCurrentUser);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  // Only redirect to dashboard if user is authenticated and trying to access login/signup
  // Allow access to landing page ("/") for both authenticated and non-authenticated users
  if (user && (location.pathname === "/login" || location.pathname === "/signup")) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
