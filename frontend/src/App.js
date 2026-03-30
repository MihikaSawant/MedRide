import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import BookAmbulance from "./pages/BookAmbulance";
import MyBookings from "./pages/MyBookings";
import EditProfile from "./pages/EditProfile";
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";
import GoogleSuccess from "./pages/GoogleSuccess";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminBookings from "./pages/AdminBookings";
import AdminMedicines from "./pages/AdminMedicines";
import MedicineStore from "./pages/MedicineStore";
import AdminOrders from "./pages/AdminOrders";
import AdminAmbulances from "./pages/AdminAmbulances";

import SOS from "./pages/SOS";
import SOSSearching from "./pages/SOSSearching";
import SOSTracking from "./pages/SOSTracking";

import DriverDashboard from "./pages/DriverDashboard";
import DriverLogin from "./pages/DriverLogin";
import DriverRegister from "./pages/DriverRegister";
import Tracking from "./pages/Tracking";
import DriverLive from "./pages/DriverLive";

import Chatbot from "./components/Chatbot";
import VoiceAssistant from "./components/VoiceAssistant";

function GestureHandler() {
  const navigate = useNavigate();

  React.useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistX = 50;
    const maxSwipeDistY = 30;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const distanceX = touchStartX - touchEndX;
      const distanceY = Math.abs(touchStartY - touchEndY);

      // Edge right-swipe (like native iOS):
      // Must start near the left edge (< 50px), move enough horizontally, and not too much vertically.
      if (touchStartX < 50 && distanceX < -minSwipeDistX && distanceY < maxSwipeDistY) {
        navigate(-1);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate]);

  return null;
}

function getAuthByRole(role) {
  if (role === "user") {
    return {
      token: localStorage.getItem("userToken"),
      data: localStorage.getItem("userData"),
    };
  }

  if (role === "driver") {
    return {
      token: localStorage.getItem("driverToken"),
      data: localStorage.getItem("driverData"),
    };
  }

  if (role === "admin") {
    return {
      token: localStorage.getItem("adminToken"),
      data: localStorage.getItem("adminData"),
    };
  }

  return { token: null, data: null };
}

function getLoginPathByRole(role) {
  if (role === "admin") return "/admin-login";
  if (role === "driver") return "/driver-login";
  return "/login";
}

function getDashboardPathByRole(role) {
  if (role === "admin") return "/admin-dashboard";
  if (role === "driver") return "/driver-dashboard";
  return "/dashboard";
}

function getCurrentLoggedInRole() {
  const checks = [
    {
      role: "admin",
      token: localStorage.getItem("adminToken"),
      data: localStorage.getItem("adminData"),
    },
    {
      role: "driver",
      token: localStorage.getItem("driverToken"),
      data: localStorage.getItem("driverData"),
    },
    {
      role: "user",
      token: localStorage.getItem("userToken"),
      data: localStorage.getItem("userData"),
    },
  ];

  for (const item of checks) {
    if (item.token && item.data) {
      try {
        const parsed = JSON.parse(item.data);
        if (parsed?.role === item.role) {
          return item.role;
        }
      } catch (error) {
        console.log("Role parse error:", error);
      }
    }
  }

  return null;
}

function ProtectedRoute({ children, allowedRoles }) {
  let matchedRole = null;
  let matchedUser = null;

  for (const role of allowedRoles) {
    const { token, data } = getAuthByRole(role);

    if (token && data) {
      try {
        const parsed = JSON.parse(data);

        if (parsed?.role === role) {
          matchedRole = role;
          matchedUser = parsed;
          break;
        }
      } catch (error) {
        console.log("Storage parse error:", error);
      }
    }
  }

  if (!matchedRole || !matchedUser) {
    return <Navigate to={getLoginPathByRole(allowedRoles[0])} replace />;
  }

  return children;
}

function PublicAuthRoute({ children, role }) {
  const loggedInRole = getCurrentLoggedInRole();

  if (loggedInRole === role) {
    return <Navigate to={getDashboardPathByRole(role)} replace />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <GestureHandler />
      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/login"
          element={
            <PublicAuthRoute role="user">
              <Login />
            </PublicAuthRoute>
          }
        />

        <Route
          path="/admin-login"
          element={
            <PublicAuthRoute role="admin">
              <AdminLogin />
            </PublicAuthRoute>
          }
        />

        <Route
          path="/driver-login"
          element={
            <PublicAuthRoute role="driver">
              <DriverLogin />
            </PublicAuthRoute>
          }
        />

        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver-register" element={<DriverRegister />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute allowedRoles={["user", "driver", "admin"]}>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/book-ambulance"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <BookAmbulance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Tracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report/:id"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <ReportDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/medicine"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MedicineStore />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sos"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SOS />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sos-searching"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SOSSearching />
            </ProtectedRoute>
          }
        />

        <Route
          path="/sos-tracking"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <SOSTracking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-dashboard"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/driver-live"
          element={
            <ProtectedRoute allowedRoles={["driver"]}>
              <DriverLive />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-bookings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-medicines"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminMedicines />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminOrders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin-ambulances"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminAmbulances />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
      <VoiceAssistant />
    </Router>
  );
}

export default App;