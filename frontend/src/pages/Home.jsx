import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSOS = () => {
    if (!user) {
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
            <h1 className="home-title">Medirush</h1>
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

          {!user && (
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