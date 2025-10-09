import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { PrivateRoute, GuestRoute } from "./routes/ProtectedRoute";

const Home = lazy(() => import("./pages/Home"));
const LogIn = lazy(() => import("./pages/LogIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Profile = lazy(() => import("./pages/Profile"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const ItemsOverlay = lazy(() => import("./pages/ItemsOverlay"));

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Loading…</div>}>
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route path="lists/:listId/items" element={<ItemsOverlay />} />
          </Route>
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </Suspense>
  );
}
