import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

function Reports() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const getAuthConfig = () => {
    const token = localStorage.getItem("userToken");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        alert("Please login first");
        return;
      }

      const res = await axios.get(
        "/api/reports/my-reports",
        getAuthConfig()
      );

      setReports(res.data);
    } catch (err) {
      console.log("Fetch reports error:", err);
      alert(err?.response?.data?.message || "Failed to fetch reports");
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const uploadReport = async () => {
    if (!file) {
      alert("Please select a report first");
      return;
    }

    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        alert("Please login first");
        return;
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("report", file);
      formData.append("description", description);

      await axios.post(
        "/api/reports/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Report uploaded successfully");
      setFile(null);
      setDescription("");

      const fileInput = document.getElementById("reportFileInput");
      if (fileInput) {
        fileInput.value = "";
      }

      fetchReports();
    } catch (err) {
      console.log("Upload report error:", err);
      alert(err?.response?.data?.message || "Error uploading report");
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id) => {
    if (!window.confirm("Delete this report?")) return;

    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        alert("Please login first");
        return;
      }

      await axios.delete(
        `/api/reports/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Report deleted");
      fetchReports();
    } catch (err) {
      console.log("Delete report error:", err);
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="reports-page">
          <div className="reports-header-card">
            <h2>Medical Reports</h2>
            <p>Upload and manage your medical reports.</p>
          </div>

          <div className="reports-upload-card">
            <input
              id="reportFileInput"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <input
              type="text"
              placeholder="Enter report description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="description-input"
            />

            <button
              className="upload-report-btn"
              onClick={uploadReport}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload Report"}
            </button>
          </div>

          <div className="reports-list">
            {reports.length === 0 ? (
              <div className="empty-report-card">
                <h3>No Reports Yet</h3>
              </div>
            ) : (
              reports.map((report) => (
                <div className="report-item-card" key={report._id}>
                  <div>
                    <h3>{report.fileName}</h3>
                    {report.description && (
                      <p className="report-description">{report.description}</p>
                    )}
                    <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="report-buttons">
                    <button
                      className="view-report-btn"
                      onClick={() => navigate(`/report/${report._id}`)}
                      style={{ 
                        padding: "8px 12px", 
                        background: "#4b6cb7", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginRight: "10px"
                      }}
                    >
                      View
                    </button>

                    <button
                      className="delete-report-btn"
                      onClick={() => deleteReport(report._id)}
                      disabled={loading}
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

export default Reports;