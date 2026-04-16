import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5052";

function DriverForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email,
      });

      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      alert(err?.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) {
      alert("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email,
        otp,
      });

      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email,
        newPassword,
      });

      alert(res.data.message);
      navigate("/driver-login");
    } catch (err) {
      alert(err?.response?.data?.message || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="admin-login-page">
          <div className="driver-login-card">
            {step === 1 && (
              <>
                <h2 className="driver-login-title">Driver Password Reset</h2>
                <p className="driver-login-subtitle">
                  Enter your email to receive an OTP
                </p>

                <form onSubmit={handleSendOTP}>
                  <input
                    type="email"
                    placeholder="Registered Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="driver-login-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
                  <span
                    onClick={() => navigate("/driver-login")}
                    style={{ cursor: "pointer", color: "#1d4ed8", textDecoration: "underline" }}
                  >
                    Back to Login
                  </span>
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="driver-login-title">Enter OTP</h2>
                <p className="driver-login-subtitle">
                  We've sent a 6-digit OTP to your email
                </p>

                <form onSubmit={handleVerifyOTP}>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength="6"
                    required
                  />

                  <button
                    type="submit"
                    className="driver-login-btn"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
                  <span
                    onClick={() => { setStep(1); setOtp(""); }}
                    style={{ cursor: "pointer", color: "#1d4ed8", textDecoration: "underline" }}
                  >
                    Back to Email
                  </span>
                </p>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="driver-login-title">Set New Password</h2>
                <p className="driver-login-subtitle">
                  Enter your new password
                </p>

                <form onSubmit={handleResetPassword}>
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />

                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="driver-login-btn"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
                  <span
                    onClick={() => { setStep(2); setNewPassword(""); setConfirmPassword(""); }}
                    style={{ cursor: "pointer", color: "#1d4ed8", textDecoration: "underline" }}
                  >
                    Back to OTP
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverForgotPassword;
