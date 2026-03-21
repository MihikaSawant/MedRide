import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedDrivers, setSelectedDrivers] = useState({});

  useEffect(() => {
    fetchBookings();
    fetchResources();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await axios.get("/api/bookings");
      const normalBookings = Array.isArray(res.data)
        ? res.data.filter((booking) => booking.bookingType === "normal")
        : [];
      setBookings(normalBookings);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchResources = async () => {
    try {
      const res = await axios.get("/api/bookings/available-resources");
      setResources(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  const assignDriver = async (bookingId) => {
    try {
      const value = selectedDrivers[bookingId];

      if (!value || value === "Select Driver") {
        alert("Please select a driver");
        return;
      }

      const [driverId, ambulanceId] = value.split("|");

      await axios.put(`/api/bookings/${bookingId}/assign`, {
        driverId,
        ambulanceId,
      });

      alert("Driver assigned successfully");
      fetchBookings();
      fetchResources();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Assignment failed");
    }
  };

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, {
        status,
      });
      fetchBookings();
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar admin-bookings-page">
          <h2 className="page-title">Admin Bookings</h2>

          {bookings.length === 0 ? (
            <div className="info-card">
              <p>No bookings available</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div className="booking-card" key={booking._id}>
                <h3>Booking Details</h3>

                <p><strong>Type:</strong> {booking.bookingType}</p>
                <p><strong>Pickup:</strong> {booking.pickup}</p>
                <p><strong>Hospital:</strong> {booking.hospital}</p>
                <p><strong>Phone:</strong> {booking.phone}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Assigned By:</strong> {booking.assignedBy || "Not assigned yet"}</p>

                {booking.driverName && (
                  <>
                    <p><strong>Driver:</strong> {booking.driverName}</p>
                    <p><strong>Driver Phone:</strong> {booking.driverPhone}</p>
                    <p><strong>Ambulance:</strong> {booking.ambulanceNumber}</p>
                  </>
                )}

                {booking.status === "Pending" && (
                  <div>
                    <select
                      value={selectedDrivers[booking._id] || "Select Driver"}
                      onChange={(e) =>
                        setSelectedDrivers((prev) => ({
                          ...prev,
                          [booking._id]: e.target.value,
                        }))
                      }
                    >
                      <option>Select Driver</option>

                      {resources.map((r) => (
                        <option key={r.driverId} value={`${r.driverId}|${r.ambulanceId}`}>
                          {r.driverName} - {r.ambulanceNumber}
                        </option>
                      ))}
                    </select>

                    <button className="assign-btn" onClick={() => assignDriver(booking._id)}>
                      Assign Driver
                    </button>
                  </div>
                )}

                {booking.status === "Assigned" && (
                  <div className="info-card">
                    <p>Waiting for driver to accept this booking.</p>
                  </div>
                )}

                {booking.status === "Accepted" && (
                  <button
                    className="status-btn"
                    onClick={() => updateStatus(booking._id, "On The Way")}
                  >
                    Mark On The Way
                  </button>
                )}

                {booking.status === "On The Way" && (
                  <button
                    className="complete-btn"
                    onClick={() => updateStatus(booking._id, "Completed")}
                  >
                    Complete Ride
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminBookings;