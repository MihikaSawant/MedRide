import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthConfig = () => {
    const token = localStorage.getItem("userToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get(`/api/reports/${id}`, getAuthConfig());
        setReport(res.data);
      } catch (err) {
        console.error("Fetch report error:", err);
        alert(err?.response?.data?.message || "Failed to fetch report");
        navigate("/reports");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="mobile-wrapper">
        <div className="phone-screen">
          <Navbar />
          <div style={{ padding: "20px", textAlign: "center", marginTop: "50px" }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5052';
  const fileUrl = `${API_BASE_URL}/uploads/${report.fileName}`;
  const isImage = report.fileName.match(/\.(jpeg|jpg|gif|png)$/i) != null;
  const isPdf = report.fileName.match(/\.(pdf)$/i) != null;

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen" style={{ overflowY: "auto" }}>
        <Navbar />

        <div className="report-details-page" style={{ padding: "20px", marginTop: "20px" }}>
          <button 
            onClick={() => navigate("/reports")} 
            style={{ 
              marginBottom: "20px", 
              padding: "8px 15px", 
              background: "#4b6cb7", 
              color: "white", 
              border: "none", 
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            ← Back to Reports
          </button>

          <div style={{ background: "white", padding: "20px", borderRadius: "10px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
            <h2 style={{ marginBottom: "10px", color: "#333", fontSize: "20px" }}>Report Details</h2>
            <div style={{ marginBottom: "15px", fontSize: "14px", lineHeight: "1.5" }}>
              <p><strong>File Name:</strong> {report.fileName}</p>
              <p><strong>Date:</strong> {new Date(report.createdAt).toLocaleDateString()}</p>
              {report.description && <p><strong>Description:</strong> {report.description}</p>}
            </div>

            <div style={{ marginTop: "20px", borderTop: "1px solid #eee", paddingTop: "20px" }}>
              {isImage ? (
                <img src={fileUrl} alt="Report" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px", objectFit: "contain" }} />
              ) : isPdf ? (
                <iframe src={fileUrl} title="Report PDF" style={{ width: "100%", height: "400px", border: "1px solid #ddd", borderRadius: "8px" }} />
              ) : (
                 <div style={{ padding: "30px", background: "#f9f9f9", borderRadius: "8px", textAlign: "center" }}>
                   <p style={{marginBottom: "15px"}}>Preview not available for this file type.</p>
                   <a href={fileUrl} target="_blank" rel="noreferrer" style={{ display: "inline-block", padding: "10px 20px", background: "#4b6cb7", color: "white", textDecoration: "none", borderRadius: "5px" }}>
                     Download / Open File
                   </a>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetails;
