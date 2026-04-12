import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Navbar from "../components/Navbar";
import "../App.css";

const SOCKET_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookingCount, setBookingCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [profileStatus, setProfileStatus] = useState("Incomplete");
  const [isCalling, setIsCalling] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("call_accepted", ({ roomID, doctorName }) => {
      setIsCalling(false);
      toast.success(`Call accepted by Dr. ${doctorName}! Joining room...`);
      navigate(`/video-consultation/${roomID}`);
    });

    newSocket.on("call_rejected", () => {
      setIsCalling(false);
      toast.error("Doctors are currently busy. Please try again later.");
    });

    return () => newSocket.disconnect();
  }, [navigate]);

  const requestDoctorCall = () => {
    if (!socket || !user) return;
    
    setIsCalling(true);
    toast.loading("Ringing available doctors...", { id: "callingToast" });
    
    const roomID = `room-${Math.floor(Math.random() * 10000)}`;
    socket.emit("request_call", {
      patientId: user.id || user._id,
      patientName: user.name,
      roomID: roomID,
      patientSocketId: socket.id
    });
    
    // Auto timeout after 30 seconds
    setTimeout(() => {
      setIsCalling((prev) => {
        if (prev) {
          toast.error("No doctor picked up. Try again later.", { id: "callingToast" });
          return false;
        }
        return prev;
      });
    }, 30000);
  };

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

      if (!isProfileComplete) {
        alert("Please complete your medical details to ensure better emergency assistance.");
      }

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
        "/api/bookings/my-bookings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookingCount(Array.isArray(bookingsRes.data) ? bookingsRes.data.length : 0);

      const reportsRes = await axios.get(
        "/api/reports/my-reports",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setReportCount(Array.isArray(reportsRes.data) ? reportsRes.data.length : 0);

      const ordersRes = await axios.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrderCount(Array.isArray(ordersRes.data) ? ordersRes.data.length : 0);
    } catch (error) {
      console.log("Dashboard analytics error:", error);

      if (error?.response?.status === 401) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    }
  };

  const chartData = [
    { name: "Bookings", value: bookingCount, color: "#e74c3c" },
    { name: "Reports", value: reportCount, color: "#3498db" },
    { name: "Orders", value: orderCount, color: "#2ecc71" },
  ];

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />
        <Toaster />

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
              <h4>Total Orders</h4>
              <h2>{orderCount}</h2>
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

            <div
              className={`dashboard-card-modern consult-card ${isCalling ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => {
                if (!isCalling) requestDoctorCall();
              }}
              style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", color: "white" }}
            >
              <div className="dashboard-icon">👨‍⚕️</div>
              <h3>{isCalling ? 'Ringing...' : 'Consult Doctor'}</h3>
              <p>{isCalling ? 'Waiting for a doctor to answer...' : 'Connect with a doctor over a video call instantly.'}</p>
            </div>
            </div>

          <div className="dashboard-section-title" style={{ marginTop: '20px' }}>Overview</div>
          <div className="charts-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#1f2937', fontWeight: 'bold' }}>Activity Breakdown</h4>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', height: '350px', display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#1f2937', fontWeight: 'bold' }}>Activity Comparison</h4>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    );
  }

export default Dashboard;