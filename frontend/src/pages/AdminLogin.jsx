import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5052";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/admin/login`, {
        email,
        password,
      });

      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverData");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.user));

      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));

      navigate("/admin-dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <div className="admin-login-page">
          <div className="admin-login-card">
            <h2 className="admin-login-title">Admin Login</h2>
            <p className="admin-login-subtitle">
              Manage bookings, assign ambulances, and update emergency status.
            </p>

            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button type="submit" className="admin-login-btn">
                Login as Admin
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;