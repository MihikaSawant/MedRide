import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

const DoctorLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const toastId = toast.loading("Logging in...");
      const res = await axios.post("/api/doctors/login", { email, password });
      
      localStorage.setItem("doctorToken", res.data.token);
      localStorage.setItem("doctorData", JSON.stringify({ ...res.data.doctor, role: "doctor" }));
      
      toast.success("Login successful!", { id: toastId });
      navigate("/doctor-dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />
        <Toaster />

        <div className="page-with-navbar auth-page">
          <h2>Doctor Portal</h2>
          <p className="auth-subtext">Login to access your consultations</p>
        
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", width: "100%", gap: "10px", marginTop: "20px" }}>
            <input
              type="email"
              placeholder="Doctor Email"
              style={{ padding: "14px", border: "1px solid #ddd", borderRadius: "12px", width: "100%", fontSize: "15px" }}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              style={{ padding: "14px", border: "1px solid #ddd", borderRadius: "12px", width: "100%", fontSize: "15px" }}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" style={{ marginTop: "10px", background: "#059669", color: "white", border: "none", padding: "14px", borderRadius: "12px", fontSize: "16px", fontWeight: "bold" }}>
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorLogin;
