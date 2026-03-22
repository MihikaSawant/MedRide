import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

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

      if (userToken && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsLoggedIn(true);
          setCurrentUser(parsedUser);
          setRole("user");
          return;
        } catch (error) {
          console.log("User parse error:", error);
          // Clear invalid data
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
          // Clear invalid data
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
          // Clear invalid data
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
        }
      }

      setIsLoggedIn(false);
      setCurrentUser(null);
      setRole("");
    };

    syncAuthState();
    setMenuOpen(false);

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = (e) => {
      if (e.key && (e.key.includes('Token') || e.key.includes('Data'))) {
        syncAuthState();
      }
    };

    // Listen for custom auth state change events (for same-tab updates)
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
    } else {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      navigate("/login");
    }

    setMenuOpen(false);
    setCurrentUser(null);
    setRole("");
    setIsLoggedIn(false);

    // Dispatch auth state change event
    window.dispatchEvent(new Event('authStateChanged'));
  };

  // CLICKING MEDRIDE WILL ALWAYS OPEN HOME PAGE
  const handleHomeClick = () => {
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <>
      <div className="topbar">
        <div
          className="app-name"
          onClick={handleHomeClick}
          style={{ cursor: "pointer" }}
        >
          MedRide
        </div>

        <div
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ cursor: "pointer" }}
        >
          ☰
        </div>
      </div>

      {menuOpen && (
        <div className="menu-dropdown">
          {isLoggedIn ? (
            <>
              {currentUser && (
                <div className="welcome">
                  Welcome, {currentUser.name || role}
                </div>
              )}

              {role === "user" && (
                <>
                  <div onClick={() => handleNavigate("/dashboard")}>
                    Dashboard
                  </div>
                  <div onClick={() => handleNavigate("/profile")}>
                    My Profile
                  </div>
                  <div onClick={() => handleNavigate("/book-ambulance")}>
                    Book Ambulance
                  </div>
                  <div onClick={() => handleNavigate("/my-bookings")}>
                    My Bookings
                  </div>
                  <div onClick={() => handleNavigate("/reports")}>
                    Reports
                  </div>
                  <div onClick={() => handleNavigate("/medicine")}>
                    Medicines
                  </div>
                  <div onClick={() => handleNavigate("/sos")}>SOS</div>
                </>
              )}

              {role === "driver" && (
                <>
                  <div onClick={() => handleNavigate("/driver-dashboard")}>
                    Driver Dashboard
                  </div>
                  <div onClick={() => handleNavigate("/profile")}>
                    My Profile
                  </div>
                  <div onClick={() => handleNavigate("/tracking")}>
                    Tracking
                  </div>
                </>
              )}

              {role === "admin" && (
                <>
                  <div onClick={() => handleNavigate("/admin-dashboard")}>
                    Admin Dashboard
                  </div>
                  <div onClick={() => handleNavigate("/admin-bookings")}>
                    Manage Bookings
                  </div>
                  <div onClick={() => handleNavigate("/admin-ambulances")}>
                    Ambulances
                  </div>
                  <div onClick={() => handleNavigate("/admin-medicines")}>
                    Medicines
                  </div>
                  <div onClick={() => handleNavigate("/admin-orders")}>
                    Orders
                  </div>
                  <div onClick={() => handleNavigate("/profile")}>
                    My Profile
                  </div>
                </>
              )}

              <div onClick={logoutUser}>Logout</div>
            </>
          ) : (
            <>
              <div onClick={() => handleNavigate("/")}>Home</div>
              <div onClick={() => handleNavigate("/login")}>User Login</div>
              <div onClick={() => handleNavigate("/driver-login")}>
                Driver Login
              </div>
              <div onClick={() => handleNavigate("/admin-login")}>
                Admin Login
              </div>
              <div onClick={() => handleNavigate("/register")}>Register</div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;