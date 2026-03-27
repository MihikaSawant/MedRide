import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://medride.onrender.com";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState("Personal");

  const registerUser = async () => {
    if (!name || !email || !password) {
      alert("Fill all fields");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        { name, email, password, accountType }
      );

      alert("Registration successful");
      navigate("/login");
    } catch (err) {
      alert("Registration failed");
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
          <h2>Create Account</h2>

          <p className="auth-subtext">
            Join MedRide for quick medical assistance
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <label>
              <input 
                type="radio" 
                value="Personal" 
                checked={accountType === "Personal"} 
                onChange={(e) => setAccountType(e.target.value)} 
              />
              Personal Profile
            </label>
            <label>
              <input 
                type="radio" 
                value="Family" 
                checked={accountType === "Family"} 
                onChange={(e) => setAccountType(e.target.value)} 
              />
              Family Profile
            </label>
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <button onClick={registerUser}>
            Register
          </button>

          <button
            className="google-login-btn"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </button>

          <p className="auth-switch">
            Already have an account?
            <span onClick={() => navigate("/login")}>
              {" "}Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;