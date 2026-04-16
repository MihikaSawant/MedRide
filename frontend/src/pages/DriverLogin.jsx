import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function DriverLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDriverLogin = async () => {
    if (!phone || !password) {
      alert("Please enter phone and password");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/api/drivers/login", {
        phone,
        password,
      });

      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverData");

      localStorage.setItem("driverToken", res.data.token);
      localStorage.setItem(
        "driverData",
        JSON.stringify({
          ...res.data.driver,
          role: "driver",
        })
      );

      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));

      navigate("/driver-dashboard");
    } catch (error) {
      console.log("Driver login error:", error);
      alert(error?.response?.data?.message || "Driver login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleDriverLogin();
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="admin-login-page">
          <div className="driver-login-card">
            <h2 className="driver-login-title">Driver Login</h2>
            <p className="driver-login-subtitle">
              Login to access assigned bookings and live tracking.
            </p>

            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <button className="driver-login-btn" onClick={handleDriverLogin}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "14px" }}>
              <span
                onClick={() => navigate("/driver-forgot-password")}
                style={{ cursor: "pointer", color: "#1d4ed8", textDecoration: "underline" }}
              >
                Forgot Password?
              </span>
            </p>

            <button
              className="location-btn"
              style={{ marginTop: "10px" }}
              onClick={() => navigate("/driver-register")}
            >
              Register New Driver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverLogin;