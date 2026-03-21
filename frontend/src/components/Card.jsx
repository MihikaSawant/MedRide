import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    setIsLoggedIn(!!token);

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setRole(parsedUser.role || "");
    } else {
      setUser(null);
      setRole("");
    }
  }, [location]);

  const handleNavigate = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuOpen(false);
    navigate("/login");
  };

  return (
    <>
      <div className="topbar">
        <div className="app-name" onClick={() => handleNavigate("/")}>
          MedRide
        </div>

        <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </div>

      {menuOpen && (
        <div className="menu-dropdown">
          {isLoggedIn ? (
            <>
              {user && <div className="welcome">Welcome, {user.name}</div>}

              {/* USER NAVBAR */}
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

                  <div onClick={() => handleNavigate("/sos")}>
                    SOS
                  </div>
                </>
              )}

              {/* DRIVER NAVBAR */}
              {role === "driver" && (
                <>
                  <div onClick={() => handleNavigate("/driver-dashboard")}>
                    Driver Dashboard
                  </div>

                  <div onClick={() => handleNavigate("/driver-live")}>
                    Live Requests
                  </div>

                  <div onClick={() => handleNavigate("/tracking")}>
                    Tracking
                  </div>

                  <div onClick={() => handleNavigate("/profile")}>
                    My Profile
                  </div>
                </>
              )}

              {/* ADMIN NAVBAR */}
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
                </>
              )}

              <div onClick={logoutUser}>Logout</div>
            </>
          ) : (
            <>
              <div onClick={() => handleNavigate("/about")}>
                About
              </div>

              <div onClick={() => handleNavigate("/faq")}>
                FAQ
              </div>

              <div onClick={() => handleNavigate("/login")}>
                Login
              </div>

              <div onClick={() => handleNavigate("/register")}>
                Register
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default Navbar;