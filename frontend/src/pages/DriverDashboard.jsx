import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function DriverDashboard() {
  const navigate = useNavigate();

  const [driver, setDriver] = useState(null);
  const [ambulance, setAmbulance] = useState(null);
  const [assignedBooking, setAssignedBooking] = useState(null);
  const [availableBookings, setAvailableBookings] = useState([]);
  const [watching, setWatching] = useState(false);
  const [driverStatusText, setDriverStatusText] = useState("Idle");
  const [loading, setLoading] = useState(true);

  const watchIdRef = useRef(null);
  const pollRef = useRef(null);

  const getStoredDriver = () => {
    try {
      return JSON.parse(localStorage.getItem("driverData") || "null");
    } catch (error) {
      console.log("Driver parse error:", error);
      return null;
    }
  };

  const getDriverToken = () => localStorage.getItem("driverToken");

  const logoutDriver = () => {
    localStorage.removeItem("driverToken");
    localStorage.removeItem("driverData");
    navigate("/driver-login");
  };

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${getDriverToken()}`,
    },
  });

  const loadDashboard = async () => {
    try {
      const storedDriver = getStoredDriver();
      const token = getDriverToken();

      if (!token || !storedDriver || storedDriver.role !== "driver" || !storedDriver._id) {
        logoutDriver();
        return;
      }

      const res = await axios.get(
        `/api/drivers/dashboard/${storedDriver._id}`,
        authHeader()
      );

      setDriver(res.data.driver || null);
      setAmbulance(res.data.ambulance || null);
      setAssignedBooking(res.data.assignedBooking || null);
    } catch (error) {
      console.log("Driver dashboard fetch error:", error);
      alert(error?.response?.data?.message || "Failed to load driver dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableBookings = async () => {
    try {
      if (driver && driver.isOnline && driver.status === "available" && !assignedBooking) {
        const res = await axios.get("/api/bookings/unassigned", authHeader());
        setAvailableBookings(res.data || []);
      } else {
        setAvailableBookings([]);
      }
    } catch (error) {
      console.log("Fetch available bookings error:", error);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    fetchAvailableBookings();
    const interval = setInterval(() => {
      fetchAvailableBookings();
    }, 5000);
    return () => clearInterval(interval);
  }, [driver?.isOnline, driver?.status, assignedBooking]);

  const acceptBooking = async (bookingId) => {
    try {
      const res = await axios.put(`/api/bookings/${bookingId}/accept`, {}, authHeader());
      alert("Booking accepted successfully!");
      loadDashboard();
    } catch (error) {
      console.log("Accept booking error:", error);
      alert(error?.response?.data?.message || "Failed to accept booking or already taken.");
      fetchAvailableBookings(); // refresh list
    }
  };

  const sendLocationToBackend = async (lat, lng) => {
    try {
      if (!driver?._id) return;

      console.log("Sending location:", { lat, lng });

      const res = await axios.put(
        `/api/drivers/update-location/${driver._id}`,
        { lat, lng },
        authHeader()
      );

      console.log("Location update response:", res.data);

      if (res.data?.booking) {
        setAssignedBooking(res.data.booking);
      }
    } catch (error) {
      console.log("Driver location update error:", error);
    }
  };

  useEffect(() => {
    const stopAllTracking = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    if (!(watching && driver?._id && assignedBooking?._id)) {
      stopAllTracking();
      return;
    }

    if (!navigator.geolocation) {
      setDriverStatusText("Geolocation not supported");
      return;
    }

    setDriverStatusText("Sharing live location");

    // Main GPS watcher
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        console.log("watchPosition GPS:", { lat, lng });
        await sendLocationToBackend(lat, lng);
      },
      (error) => {
        console.log("Geolocation error:", error);
        setDriverStatusText("Location access denied or unavailable");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    // Fallback polling every 5 sec
    pollRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("poll GPS:", { lat, lng });
          await sendLocationToBackend(lat, lng);
        },
        (error) => {
          console.log("Polling geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        }
      );
    }, 5000);

    return stopAllTracking;
  }, [watching, driver?._id, assignedBooking?._id]);

  const toggleAvailability = async () => {
    try {
      if (!driver?._id) return;

      const res = await axios.put(
        `/api/drivers/toggle-status/${driver._id}`,
        { isOnline: !driver.isOnline },
        authHeader()
      );

      setDriver(res.data.driver);
      loadDashboard();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to update driver status");
    }
  };

  const startRide = async () => {
    try {
      if (!assignedBooking?._id || !driver?._id) return;

      if (!navigator.geolocation) {
        alert("Geolocation not supported in this browser");
        return;
      }

      const rideRes = await axios.put(
        `/api/drivers/start-ride/${assignedBooking._id}`,
        {},
        authHeader()
      );

      if (rideRes.data?.booking) {
        setAssignedBooking(rideRes.data.booking);
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("Initial GPS after start:", { lat, lng });
          await sendLocationToBackend(lat, lng);

          setWatching(true);
          setDriverStatusText("Tracking Started");
        },
        (error) => {
          console.log("Initial geolocation error:", error);
          alert("Please allow location access and try again.");
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to start ride");
    }
  };

  const completeRide = async () => {
    try {
      if (!assignedBooking?._id) return;

      await axios.put(
        `/api/drivers/complete-ride/${assignedBooking._id}`,
        {},
        authHeader()
      );

      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }

      setAssignedBooking(null);
      setWatching(false);
      setDriverStatusText("Ride Completed");
      loadDashboard();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to complete ride");
    }
  };

  if (loading) {
    return (
      <div className="mobile-wrapper">
        <div className="phone-screen">
          <Navbar />
          <div className="admin-login-page">
            <div className="loading-card">Loading driver dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar driver-dashboard-page">
          <div className="driver-hero-card">
            <h2>Driver Dashboard</h2>
            <p>Share your live location with the user.</p>
          </div>

          {driver && (
            <div className="info-card">
              <h3>Driver Details</h3>
              <p><strong>Name:</strong> {driver.name}</p>
              <p><strong>Phone:</strong> {driver.phone}</p>
              <p><strong>Online Status:</strong> {driver.isOnline ? "Online" : "Offline"}</p>
              <p><strong>Work Status:</strong> {driver.status}</p>

              <button className="confirm-booking-btn" onClick={toggleAvailability}>
                {driver.isOnline ? "Go Offline" : "Go Online"}
              </button>
            </div>
          )}

          {ambulance && (
            <div className="info-card">
              <h3>Ambulance Details</h3>
              <p><strong>Ambulance No:</strong> {ambulance.ambulanceNumber || "-"}</p>
              <p><strong>Status:</strong> {ambulance.status || "-"}</p>
              <p><strong>Latitude:</strong> {ambulance.currentLat ?? "N/A"}</p>
              <p><strong>Longitude:</strong> {ambulance.currentLng ?? "N/A"}</p>
            </div>
          )}

          {assignedBooking ? (
            <div className="assigned-booking-card">
              <h3>Assigned Booking</h3>
              <p><strong>Pickup:</strong> {assignedBooking.pickup || "-"}</p>
              <p><strong>Hospital:</strong> {assignedBooking.hospital || "-"}</p>
              <p><strong>Phone:</strong> {assignedBooking.phone || "-"}</p>
              <p><strong>Status:</strong> {assignedBooking.status || "-"}</p>
              <p><strong>Booking ID:</strong> {assignedBooking._id}</p>

              <div className="driver-btn-group">
                {(assignedBooking.status === "Assigned" || assignedBooking.status === "Accepted") && (
                  <button className="location-btn" onClick={startRide}>
                    Start Ride
                  </button>
                )}

                {["On The Way", "Reached Pickup", "Patient Picked", "Reached Hospital"].includes(assignedBooking.status) && (
                  <button className="complete-btn" onClick={completeRide}>
                    Complete Ride
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="info-card">
              <h3>No Active Booking</h3>
              <p>No booking is currently assigned to you.</p>
              
              {driver?.isOnline && driver?.status === "available" && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ marginBottom: "10px", color: "#4b6cb7" }}>Available Bookings (First Come, First Serve)</h4>
                  {availableBookings.length === 0 ? (
                    <p style={{ fontSize: "14px", color: "#666" }}>No pending bookings right now. Waiting...</p>
                  ) : (
                    availableBookings.map((booking) => (
                      <div key={booking._id} style={{ 
                        border: "1px solid #ddd", 
                        padding: "15px", 
                        borderRadius: "8px", 
                        marginBottom: "10px",
                        background: "#f9f9f9"
                      }}>
                        <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Pickup:</strong> {booking.pickup}</p>
                        <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Hospital:</strong> {booking.hospital}</p>
                        <p style={{ margin: "5px 0", fontSize: "14px" }}><strong>Phone:</strong> {booking.phone}</p>
                        <button 
                          onClick={() => acceptBooking(booking._id)}
                          style={{
                            marginTop: "10px",
                            padding: "8px 15px",
                            background: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            width: "100%",
                            fontWeight: "bold"
                          }}
                        >
                          Accept Booking
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          <div className="info-card">
            <h3>Live Tracking Status</h3>
            <p>{driverStatusText}</p>
            <p style={{ fontSize: "12px", color: "#666" }}>
              Desktop test ke liye DevTools &gt; More tools &gt; Sensors &gt; Geolocation use karo.
            </p>
          </div>

          <button className="driver-logout-btn" onClick={logoutDriver}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default DriverDashboard;