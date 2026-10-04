import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth";
import AppShell from "./layout/AppShell";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CompleteProfile from "./pages/CompleteProfile";
import Dashboard from "./pages/Dashboard";
import Attendance from "./pages/Attendance";
import Sgpa from "./pages/Sgpa";
import Timetable from "./pages/Timetable";
import CalendarPage from "./pages/CalendarPage";
import Resources from "./pages/Resources";
import Opportunities from "./pages/Opportunities";
import Campus from "./pages/Campus";
import Projects from "./pages/Projects";
import Alumni from "./pages/Alumni";
import Network from "./pages/Network";
import LostFound from "./pages/LostFound";
import Profile from "./pages/Profile";
import Credits from "./pages/Credits";
import Admin from "./pages/Admin";

function Guard({ children }) {
  const { user, loading, hasProfile } = useAuth();
  if (loading) return <div className="empty">Loading portal…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!hasProfile) return <Navigate to="/complete-profile" replace />;
  return children;
}

function Guest({ children }) {
  const { user, loading, hasProfile } = useAuth();
  if (loading) return <div className="empty">Loading…</div>;
  if (user && hasProfile) return <Navigate to="/" replace />;
  if (user && !hasProfile) return <Navigate to="/complete-profile" replace />;
  return children;
}

function ProfileGuard({ children }) {
  const { user, loading, hasProfile } = useAuth();
  if (loading) return <div className="empty">Loading portal…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (hasProfile) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <Guest>
            <Login />
          </Guest>
        }
      />
      <Route
        path="/register"
        element={
          <Guest>
            <Register />
          </Guest>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <Guest>
            <ForgotPassword />
          </Guest>
        }
      />
      <Route
        path="/reset-password"
        element={
          <Guest>
            <ResetPassword />
          </Guest>
        }
      />
      <Route
        path="/complete-profile"
        element={
          <ProfileGuard>
            <CompleteProfile />
          </ProfileGuard>
        }
      />
      <Route
        path="/"
        element={
          <Guard>
            <AppShell />
          </Guard>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="academics/attendance" element={<Attendance tab="table" />} />
        <Route path="academics/calculator" element={<Attendance tab="calc" />} />
        <Route path="academics/bunk" element={<Attendance tab="bunk" />} />
        <Route path="academics/todo" element={<Attendance tab="todo" />} />
        <Route path="academics/sgpa" element={<Sgpa />} />
        <Route path="academics/timetable" element={<Timetable />} />
        <Route path="academics/calendar" element={<CalendarPage />} />
        <Route path="resources/:kind" element={<Resources />} />
        <Route path="opportunities/:kind" element={<Opportunities />} />
        <Route path="campus/:kind" element={<Campus />} />
        <Route path="projects/:kind" element={<Projects />} />
        <Route path="community/alumni" element={<Alumni />} />
        <Route path="community/network" element={<Network />} />
        <Route path="lost-found" element={<LostFound />} />
        <Route path="profile" element={<Profile />} />
        <Route path="about/credits" element={<Credits />} />
        <Route path="admin" element={<Admin />} />
      </Route>
    </Routes>
  );
}
