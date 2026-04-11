import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";

const AdminConsultations = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConsultations = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.get("/api/consultations/admin", {
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
  }, []);

  return (
    <div className="admin-page">
      <AdminNavbar />
      <div className="admin-content">
        <h2>Video Consultations Log</h2>
        {loading ? (
          <p>Loading records...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Doctor Name</th>
                <th>Room ID</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {consultations.length === 0 ? (
                <tr><td colSpan="5">No visual consultations found.</td></tr>
              ) : (
                consultations.map((c) => (
                  <tr key={c._id}>
                    <td>{c.patientName}</td>
                    <td>{c.doctorName}</td>
                    <td>{c.roomID}</td>
                    <td>
                      <span className={`status-badge ${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>{new Date(c.date).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminConsultations;
