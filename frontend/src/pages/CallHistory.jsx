import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const CallHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem("userToken");
        if (!token) return navigate("/login");

        const res = await axios.get("/api/consultations/patient", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConsultations(res.data);
      } catch (error) {
        console.error("Error fetching consultations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConsultations();
  }, [navigate]);

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen" style={{ overflowY: "auto" }}>
        <Navbar />
        <div className="page-with-navbar" style={{ padding: "20px" }}>
          <h2>My Video Call History</h2>
          {loading ? (
            <p>Loading records...</p>
          ) : consultations.length === 0 ? (
            <p>No past calls found.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
              {consultations.map((c) => (
                <div key={c._id} style={{ background: "white", padding: "15px", borderRadius: "12px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", color: "#0f172a" }}>Doctor: {c.doctorName || "Unknown"}</h3>
                    <span style={{ 
                      fontSize: "12px", 
                      padding: "4px 8px", 
                      borderRadius: "8px",
                      background: c.status === "Accepted" ? "#dcfce7" : c.status === "Rejected" ? "#fee2e2" : "#f1f5f9",
                      color: c.status === "Accepted" ? "#166534" : c.status === "Rejected" ? "#991b1b" : "#475569",
                      fontWeight: "bold"
                     }}>
                      {c.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Date: {new Date(c.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallHistory;
