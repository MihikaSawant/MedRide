import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function AdminReports() {
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      const res = await axios.get("/api/reports/all", { headers });
      setReports(res.data);
    } catch (err) {
      console.log("Fetch reports error:", err);
    }
  };

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5052';

  const deleteReport = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      await axios.delete(`/api/reports/delete/${id}`, { headers });
      fetchReports();
    } catch (err) {
      console.error("Delete report error:", err);
      alert("Failed to delete report.");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />
        
        <div className="page-content" style={{ padding: "20px", display: "flex", flexDirection: "column", height: "100%", overflowY: "auto", paddingBottom: "80px" }}>
          <div className="dashboard-hero" style={{ padding: "20px", background: "linear-gradient(135deg, #1d4ed8, #60a5fa)", borderRadius: "20px", color: "white", marginBottom: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "700" }}>User Reports</h2>
              <button 
                onClick={() => navigate("/admin-dashboard")}
                style={{ 
                  background: "rgba(255,255,255,0.2)", 
                  color: "white", 
                  border: "none", 
                  padding: "8px 16px", 
                  borderRadius: "12px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Back
              </button>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "14px", opacity: 0.9 }}>
              View and manage documents uploaded by users
            </p>
          </div>

          <div className="data-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reports.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", background: "#f8fafc", borderRadius: "16px", color: "#64748b" }}>
                No reports uploaded yet.
              </div>
            ) : (
              reports.map((report) => (
                <div key={report._id} style={{
                  background: "white",
                  padding: "20px",
                  borderRadius: "20px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, marginRight: "12px", overflow: "hidden" }}>
                      <h4 style={{ margin: "0 0 4px", fontSize: "17px", color: "#1e293b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {report.fileName.split('-').slice(1).join('-') || report.fileName}
                      </h4>
                      <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>
                        Uploaded by <strong>{report.user?.name || "Unknown"}</strong>
                      </p>
                    </div>
                    <span style={{ 
                      background: "#ecfdf5", 
                      color: "#059669", 
                      padding: "4px 10px", 
                      borderRadius: "8px", 
                      fontSize: "12px", 
                      fontWeight: "600" 
                    }}>
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {report.description && (
                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "12px" }}>
                      <p style={{ margin: 0, fontSize: "14px", color: "#475569" }}>
                        {report.description}
                      </p>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                    <a 
                      href={`${API_BASE_URL}/uploads/${report.fileName}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ 
                        flex: 1,
                        background: "#eff6ff",
                        color: "#2563eb",
                        textDecoration: 'none', 
                        textAlign: 'center',
                        padding: "10px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "14px"
                      }}
                    >
                      View Document
                    </a>
                    <button 
                      onClick={() => deleteReport(report._id)}
                      style={{ 
                        flex: 1,
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "none",
                        padding: "10px",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "14px",
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminReports;