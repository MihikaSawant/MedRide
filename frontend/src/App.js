import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";

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
import AdminReports from "./pages/AdminReports";

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
    let startX = 0;
    let startY = 0;
    const edgeThreshold = window.innerWidth; // Allow swipe from anywhere
    const requiredSwipeDistance = 75; // How far right you must swipe
    const maxVerticalVariance = 100; // How much you can accidentally swipe up/down while swiping right

    const handleStart = (clientX, clientY) => {
      startX = clientX;
      startY = clientY;
    };

    const handleEnd = (clientX, clientY) => {
      const diffX = clientX - startX; // Positive means swiped right, negative means swiped left
      const diffY = Math.abs(clientY - startY);

      // Swiped left (right to left) -> go back
      if (diffX < -requiredSwipeDistance && diffY < maxVerticalVariance) {
        navigate(-1);
      }
      // Swiped right (left to right) -> go forward
      else if (diffX > requiredSwipeDistance && diffY < maxVerticalVariance) {
        navigate(1);
      }
    };

    // Touch events for mobile phones
    const handleTouchStart = (e) => handleStart(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    const handleTouchEnd = (e) => handleEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);

    // Mouse events for desktop testing
    const handleMouseDown = (e) => handleStart(e.clientX, e.clientY);
    const handleMouseUp = (e) => handleEnd(e.clientX, e.clientY);

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
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
  useEffect(() => {
    // Override the default browser alert with react-hot-toast
    window.alert = (message) => {
      // Small heuristic: if message implies success, use toast.success. If error, use toast.error. 
      // Otherwise just use normal toast.
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("success") || lowerMsg.includes("added") || lowerMsg.includes("completed")) {
        toast.success(message, { duration: 3000 });
      } else if (lowerMsg.includes("fail") || lowerMsg.includes("error") || lowerMsg.includes("please") || lowerMsg.includes("invalid") || lowerMsg.includes("denied")) {
        toast.error(message, { duration: 4000 });
      } else {
        toast(message, { duration: 3000 });
      }
    };
  }, []);

  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '14px'
          }
        }} 
      />
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

        <Route
          path="/admin-reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminReports />
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