import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/loginSlice";

export function PrivateRoute() {
  const user = useSelector(selectCurrentUser);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
  const user = useSelector(selectCurrentUser);
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
