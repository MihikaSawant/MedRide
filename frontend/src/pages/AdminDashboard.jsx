import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [bookingCount, setBookingCount] = useState(0);
  const [medicineCount, setMedicineCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [ambulanceCount, setAmbulanceCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const headers = {
        Authorization: token ? `Bearer ${token}` : "",
      };

      const bookings = await axios.get("/api/bookings", { headers });
      setBookingCount(bookings.data.length);

      const medicines = await axios.get("/api/medicines", { headers });
      setMedicineCount(medicines.data.length);

      const orders = await axios.get("/api/orders", { headers });
      setOrderCount(orders.data.length);

      const ambulances = await axios.get("/api/ambulances", { headers });
      setAmbulanceCount(ambulances.data.length);
    } catch (err) {
      console.log("Admin dashboard fetch error:", err);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="admin-page">
          <div className="admin-hero">
            <h2>Admin Dashboard</h2>
            <p>Manage bookings, medicines, drivers and ambulance fleet.</p>
          </div>

          <div className="analytics-section">
            <div className="analytics-card">
              <h4>Total Bookings</h4>
              <h2>{bookingCount}</h2>
            </div>

            <div className="analytics-card">
              <h4>Total Medicines</h4>
              <h2>{medicineCount}</h2>
            </div>

            <div className="analytics-card">
              <h4>Total Orders</h4>
              <h2>{orderCount}</h2>
            </div>

            <div className="analytics-card">
              <h4>Total Ambulances</h4>
              <h2>{ambulanceCount}</h2>
            </div>
          </div>

          <div className="dashboard-grid-modern">
            <div
              className="dashboard-card-modern consult-card"
              onClick={() => navigate("/admin-doctors")}
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "white" }}
            >
              <div className="dashboard-icon">👨‍⚕️</div>
              <h3>Manage Doctors</h3>
              <p>Add doctors, send credentials & manage them.</p>
            </div>

            <div
              className="dashboard-card-modern booking-card"
              onClick={() => navigate("/admin-bookings")}
            >
              <div className="dashboard-icon">🚑</div>
              <h3>Manage Bookings</h3>
              <p>View and update ambulance bookings.</p>
            </div>

            <div
              className="dashboard-card-modern medicine-card"
              onClick={() => navigate("/admin-medicines")}
            >
              <div className="dashboard-icon">💊</div>
              <h3>Manage Medicines</h3>
              <p>Add and manage medicines in store.</p>
            </div>

            <div
              className="dashboard-card-modern reports-card"
              onClick={() => navigate("/admin-orders")}
            >
              <div className="dashboard-icon">📦</div>
              <h3>Medicine Orders</h3>
              <p>Accept and dispatch medicine orders.</p>
            </div>

            <div
              className="dashboard-card-modern history-card"
              onClick={() => navigate("/admin-ambulances")}
            >
              <div className="dashboard-icon">🛻</div>
              <h3>Ambulances & Drivers</h3>
              <p>Add ambulances, create drivers and manage fleet status.</p>
            </div>

            <div
              className="dashboard-card-modern reports-card"
              onClick={() => navigate("/admin-reports")}
            >
              <div className="dashboard-icon">📄</div>
              <h3>View Reports</h3>
              <p>View user uploaded reports and documents.</p>
            </div>

            <div
              className="dashboard-card-modern consult-card"
              onClick={() => {
                const roomID = prompt("Enter Room ID provided by the patient:");
                if (roomID) navigate(`/video-consultation/${roomID}`);
              }}
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" }}
            >
              <div className="dashboard-icon">👨‍⚕️</div>
              <h3>Join Consultation</h3>
              <p>Join a patient's video consultation room.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;