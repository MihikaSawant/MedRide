import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

function Reports() {
  const [file, setFile] = useState(null);
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
        "https://medride-project.onrender.com/api/reports/my-reports",
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

      await axios.post(
        "https://medride-project.onrender.com/api/reports/upload",
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
        `https://medride-project.onrender.com/api/reports/delete/${id}`,
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
                    <p>{new Date(report.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="report-buttons">
                    <a
                      href={`https://medride-project.onrender.com/uploads/${report.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="view-report-btn"
                    >
                      View
                    </a>

                    <button
                      className="delete-report-btn"
                      onClick={() => deleteReport(report._id)}
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