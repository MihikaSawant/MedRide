import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [profileStatus, setProfileStatus] = useState("Incomplete");

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    const token = localStorage.getItem("userToken");

    if (!storedUser || !token) {
      navigate("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (parsedUser?.role !== "user") {
        navigate("/login");
        return;
      }

      setUser(parsedUser);

      const isProfileComplete =
        parsedUser.name &&
        parsedUser.email &&
        parsedUser.phone &&
        parsedUser.bloodGroup &&
        parsedUser.allergies &&
        parsedUser.medicalConditions &&
        parsedUser.emergencyContact &&
        parsedUser.photo;

      setProfileStatus(isProfileComplete ? "Completed" : "Incomplete");

      fetchAnalytics(token);
    } catch (error) {
      console.log("Dashboard user parse error:", error);
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      navigate("/login");
    }
  }, [navigate]);

  const fetchAnalytics = async (token) => {
    try {
      const bookingsRes = await axios.get(
        "http://https://medride-project.onrender.com/api/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookingCount(Array.isArray(bookingsRes.data) ? bookingsRes.data.length : 0);

      const reportsRes = await axios.get(
        "http://https://medride-project.onrender.com/api/reports/my-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReportCount(Array.isArray(reportsRes.data) ? reportsRes.data.length : 0);
    } catch (error) {
      console.log("Dashboard analytics error:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar dashboard-page">
          <div className="dashboard-hero">
            <p className="dashboard-subtitle">Welcome back</p>
            <h2 className="dashboard-title">{user ? user.name : "User"}</h2>
            <p className="dashboard-text">
              Manage your emergency services quickly and easily.
            </p>
          </div>

          <div className="analytics-section">
            <div className="analytics-card">
              <h4>Total Bookings</h4>
              <h2>{bookingCount}</h2>
            </div>

            <div className="analytics-card">
              <h4>Total Reports</h4>
              <h2>{reportCount}</h2>
            </div>

            <div className="analytics-card">
              <h4>Profile Status</h4>
              <h2>{profileStatus}</h2>
            </div>
          </div>

          <div className="dashboard-section-title">Quick Services</div>

          <div className="dashboard-grid-modern">
            <div
              className="dashboard-card-modern booking-card"
              onClick={() => navigate("/book-ambulance")}
            >
              <div className="dashboard-icon">🚑</div>
              <h3>Book Ambulance</h3>
              <p>Request emergency ambulance support instantly.</p>
            </div>

            <div
              className="dashboard-card-modern history-card"
              onClick={() => navigate("/my-bookings")}
            >
              <div className="dashboard-icon">📜</div>
              <h3>Booking History</h3>
              <p>View all your previous ambulance bookings.</p>
            </div>

            <div
              className="dashboard-card-modern medicine-card"
              onClick={() => navigate("/medicine")}
            >
              <div className="dashboard-icon">💊</div>
              <h3>Buy Medicines</h3>
              <p>Order medicines and health essentials easily.</p>
            </div>

            <div
              className="dashboard-card-modern reports-card"
              onClick={() => navigate("/reports")}
            >
              <div className="dashboard-icon">📄</div>
              <h3>Reports</h3>
              <p>Upload and view your medical reports anytime.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;