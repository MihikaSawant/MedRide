import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthState = () => {
      const userToken = localStorage.getItem("userToken");
      const userData = localStorage.getItem("userData");
      const driverToken = localStorage.getItem("driverToken");
      const driverData = localStorage.getItem("driverData");
      const adminToken = localStorage.getItem("adminToken");
      const adminData = localStorage.getItem("adminData");

      setIsLoggedIn(!!((userToken && userData) || (driverToken && driverData) || (adminToken && adminData)));
    };

    checkAuthState();

    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuthState();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleSOS = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/sos");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
  <Navbar />

        <div className="page-with-navbar">
          <div className="home-hero">
            <h1 className="home-title">MedRide</h1>
            <p className="home-subtitle">
              Emergency medical help at your fingertips.
              Book ambulance, manage reports and access your health info anytime.
            </p>
          </div>

          <div className="sos-container">
            <div className="sos-circle" onClick={handleSOS}>
              SOS
            </div>
          </div>

          {!isLoggedIn && (
            <div className="auth-buttons">
              <button className="login-btn" onClick={() => navigate("/login")}>
                Login
              </button>

              <button
                className="register-btn"
                onClick={() => navigate("/register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;