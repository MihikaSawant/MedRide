import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (email === "admin@medride.com" && password === "admin123") {
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverData");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      localStorage.setItem("adminToken", "admin-token");
      localStorage.setItem(
        "adminData",
        JSON.stringify({
          name: "Admin",
          email,
          role: "admin",
        })
      );

      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));

      navigate("/admin-dashboard");
    } else {
      alert("Invalid admin credentials");
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