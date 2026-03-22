import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://medride.onrender.com";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        { email, password }
      );

      const loggedInUser = {
        ...res.data.user,
        role: "user",
      };

      localStorage.removeItem("driverToken");
      localStorage.removeItem("driverData");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminData");

      localStorage.setItem("userToken", res.data.token);
      localStorage.setItem("userData", JSON.stringify(loggedInUser));

      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));

      navigate("/dashboard");
    } catch (err) {
      alert(err?.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="auth-card">
          <h2>Welcome Back</h2>

          <p className="auth-subtext">
            Login to continue using MedRide
          </p>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={loginUser}>Login</button>

          <button
            className="google-login-btn"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          <p className="auth-switch">
            Don't have an account?
            <span onClick={() => navigate("/register")}> Register</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;