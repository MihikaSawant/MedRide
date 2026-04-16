import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5052";

function AdminForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState("");

  const handleForgotPassword = async (e) => {
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
      setSubmitted(true);
    } catch (err) {
      alert(err?.response?.data?.message || "Error requesting password reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <div className="admin-login-page">
          <div className="admin-login-card">
            {!submitted ? (
              <>
                <h2 className="admin-login-title">Admin Password Reset</h2>
                <p className="admin-login-subtitle">
                  Enter your email and we'll send you a temporary password
                </p>

                <form onSubmit={handleForgotPassword}>
                  <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />

                  <button
                    type="submit"
                    className="admin-login-btn"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Temporary Password"}
                  </button>
                </form>

                <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
                  <span
                    onClick={() => navigate("/admin-login")}
                    style={{ cursor: "pointer", color: "#111827", textDecoration: "underline" }}
                  >
                    Back to Login
                  </span>
                </p>
              </>
            ) : (
              <>
                <h2 className="admin-login-title">Check Your Email</h2>
                <p className="admin-login-subtitle">{message}</p>
                <p className="admin-login-subtitle" style={{ marginTop: "20px", fontSize: "13px" }}>
                  Use the temporary password to login and change your password in profile settings.
                </p>

                <button
                  onClick={() => navigate("/admin-login")}
                  className="admin-login-btn"
                  style={{ marginTop: "20px" }}
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminForgotPassword;
