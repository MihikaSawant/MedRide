import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, X, LogOut, Home, User, UserPlus, 
  MapPin, LayoutDashboard, Truck, FileText, PlusCircle, 
  Pill, LogIn, HeartPulse, Settings, FileSearch, ShieldCheck
} from "lucide-react";
import "./Navigation.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const syncAuthState = () => {
      const userToken = localStorage.getItem("userToken");
      const userData = localStorage.getItem("userData");

      const driverToken = localStorage.getItem("driverToken");
      const driverData = localStorage.getItem("driverData");

      const adminToken = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminData");

      const doctorToken = localStorage.getItem("doctorToken");
      const doctorData = localStorage.getItem("doctorData");

      if (userToken && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setCurrentUser(parsedUser);
          setRole("user");
          return;
        } catch (error) {
          console.log("User parse error:", error);
          localStorage.removeItem("userToken");
          localStorage.removeItem("userData");
        }
      }

      if (driverToken && driverData) {
        try {
          const parsedDriver = JSON.parse(driverData);
          setIsLoggedIn(true);
          setCurrentUser(parsedDriver);
          setRole("driver");
          return;
        } catch (error) {
          console.log("Driver parse error:", error);
          localStorage.removeItem("driverToken");
          localStorage.removeItem("driverData");
        }
      }

      if (adminToken && adminData) {
        try {
          const parsedAdmin = JSON.parse(adminData);
          setIsLoggedIn(true);
          setCurrentUser(parsedAdmin);
          setRole("admin");
          return;
        } catch (error) {
          console.log("Admin parse error:", error);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
        }
      }

      if (doctorData) {
        try {
          const parsedDoctor = JSON.parse(doctorData);
          setIsLoggedIn(true);
          setCurrentUser(parsedDoctor);
          setRole("doctor");
          return;
        } catch (error) {
          console.log("Doctor parse error:", error);
          localStorage.removeItem("doctorToken");
          localStorage.removeItem("doctorData");
        }
      }

      setIsLoggedIn(false);
      setCurrentUser(null);
      setRole("");
    };

    syncAuthState();
    setMenuOpen(false);

    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('Token') || e.key.includes('Data'))) {
        syncAuthState();
      }
    };

    const handleAuthChange = () => {
      syncAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [location]);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const logoutUser = () => {
    if (role === "driver") {
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverData");
      navigate("/driver-login");
    } else if (role === "admin") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      navigate("/admin-login");
    } else if (role === "doctor") {
      localStorage.removeItem("doctorToken");
      localStorage.removeItem("doctorData");
      navigate("/doctor-login");
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      navigate("/login");
    }

    setMenuOpen(false);
    setCurrentUser(null);
    setRole("");
    setIsLoggedIn(false);

    window.dispatchEvent(new Event('authStateChanged'));
  };

  const handleHomeClick = () => {
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            className="app-name"
            onClick={handleHomeClick}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <img src="/medride_logo.png" alt="MedRide Logo" style={{ height: "35px", width: "auto" }} />
          </div>
        </div>

        <div
          className="menu-btn"
          onClick={() => setMenuOpen(true)}
          style={{ cursor: "pointer", display: "flex", alignItems: "center", color: "#1e293b" }}
        >
          <Menu size={28} />
        </div>
      </div>

      {menuOpen && (
        <>
          <div className="sliding-drawer-overlay" onClick={() => setMenuOpen(false)}></div>
          <div className={`sliding-drawer ${menuOpen ? 'open' : ''}`}>
            
            <div className="drawer-header">
              <div className="drawer-title">
                {isLoggedIn && currentUser ? `Hello, ${currentUser.name || role}` : "Welcome"}
              </div>
              <button className="close-btn" onClick={() => setMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="drawer-content">
              {isLoggedIn ? (
                <>
                  {role === "user" && (
                    <>
                      <div className="drawer-item" onClick={() => handleNavigate("/dashboard")}>
                        <LayoutDashboard size={20} /> Dashboard
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/book-ambulance")}>
                        <Truck size={20} /> Book Ambulance
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/my-bookings")}>
                        <FileText size={20} /> My Bookings
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/medicine")}>
                        <Pill size={20} /> Order Medicine
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/reports")}>
                        <FileSearch size={20} /> Medical Reports
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/sos")}>
                        <HeartPulse size={20} color="#ef4444" /> SOS Alert
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/profile")}>
                        <Settings size={20} /> Account Settings
                      </div>
                    </>
                  )}

                  {role === "driver" && (
                    <>
                      <div className="drawer-item" onClick={() => handleNavigate("/driver-dashboard")}>
                        <LayoutDashboard size={20} /> Driver Dashboard
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/tracking")}>
                        <MapPin size={20} /> Track Bookings
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/profile")}>
                        <Settings size={20} /> Account Settings
                      </div>
                    </>
                  )}

                  {role === "admin" && (
                    <>
                      <div className="drawer-item" onClick={() => handleNavigate("/admin-dashboard")}>
                        <LayoutDashboard size={20} /> Admin Panel
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/admin-bookings")}>
                        <FileText size={20} /> Manage Bookings
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/admin-ambulances")}>
                        <Truck size={20} /> Manage Ambulances
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/admin-medicines")}>
                        <Pill size={20} /> Manage Medicines
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/admin-orders")}>
                        <FileSearch size={20} /> Medicine Orders
                      </div>
                      <div className="drawer-item" onClick={() => handleNavigate("/profile")}>
                        <ShieldCheck size={20} /> Account Settings
                      </div>
                    </>
                  )}

                  {role === "doctor" && (
                    <>
                      <div className="drawer-item" onClick={() => handleNavigate("/doctor-dashboard")}>
                        <LayoutDashboard size={20} /> Doctor Dashboard
                      </div>
                    </>
                  )}

                  <div className="drawer-footer">
                    <div className="drawer-item logout-btn" onClick={logoutUser}>
                      <LogOut size={20} /> Logout
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="drawer-item" onClick={() => handleNavigate("/")}>
                    <Home size={20} /> Home
                  </div>
                  <div className="drawer-item" onClick={() => handleNavigate("/login")}>
                    <LogIn size={20} /> User Login
                  </div>
                  <div className="drawer-item" onClick={() => handleNavigate("/driver-login")}>
                    <LogIn size={20} /> Driver Login
                  </div>
                  <div className="drawer-item" onClick={() => handleNavigate("/doctor-login")}>
                    <LogIn size={20} /> Doctor Login
                  </div>
                  <div className="drawer-item" onClick={() => handleNavigate("/admin-login")}>
                    <ShieldCheck size={20} /> Admin Login
                  </div>
                  <div className="drawer-item" onClick={() => handleNavigate("/register")}>
                    <UserPlus size={20} /> Register
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Navbar;
