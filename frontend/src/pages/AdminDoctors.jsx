import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    specialization: "",
    password: "",
  });

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/doctors/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDoctors(res.data);
    } catch (error) {
      console.error("Fetch doctors error", error);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("adminToken");
      const toastId = toast.loading("Creating doctor and sending email...");
      const res = await axios.post("/api/doctors/create", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const createdPassword = res.data.password || formData.password;
      toast.success(`Doctor created! Password generated: ${createdPassword}`, { id: toastId, duration: 8000 });
      setFormData({ name: "", email: "", specialization: "", password: "" });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create doctor");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />
        <Toaster />

        <div className="page-with-navbar admin-page">
          <div className="admin-hero">
            <h2>Manage Doctors</h2>
            <p>Add new doctors and manage your active personnel.</p>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "16px", marginBottom: "25px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>Add New Doctor</h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input
                type="text"
                placeholder="Dr. Name"
                required
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
              <input
                type="email"
                placeholder="Doctor Email"
                required
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <input
                type="text"
                placeholder="Specialization (e.g. Cardiologist)"
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
              />
              <input
                type="text"
                placeholder="Set Password"
                required
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0" }}
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
              <button
                type="submit"
                style={{ background: "#059669", color: "white", padding: "12px", borderRadius: "10px", fontWeight: "bold", border: "none", marginTop: "5px" }}
              >
                Add Doctor
              </button>
            </form>
          </div>

          <div style={{ background: "white", padding: "20px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "15px" }}>Registered Doctors</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {doctors.map(doc => (
                <div key={doc._id} style={{ padding: "15px", border: "1px solid #e2e8f0", borderRadius: "10px" }}>
                  <h4 style={{ fontWeight: "bold", fontSize: "15px" }}>{doc.name}</h4>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>{doc.email}</p>
                  <p style={{ fontSize: "13px", color: "#64748b" }}>{doc.specialization}</p>
                </div>
              ))}
              {doctors.length === 0 && (
                <p style={{ textAlign: "center", color: "#94a3b8", padding: "20px 0" }}>No doctors added yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDoctors;
