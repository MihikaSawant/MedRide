import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import "../App.css";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("userToken");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get("https://medride-project.onrender.com/api/bookings/my-bookings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const sortedBookings = [...res.data].sort(
        (a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
      );

      setBookings(sortedBookings);
    } catch (err) {
      console.log("Bookings fetch error:", err);
      alert(err?.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    const userData = localStorage.getItem("userData");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    fetchBookings();

    const interval = setInterval(fetchBookings, 8000);
    return () => clearInterval(interval);
  }, [navigate]);

  const canTrackBooking = (booking) => {
    return [
      "Assigned",
      "Accepted",
      "On The Way",
      "Reached Pickup",
      "Patient Picked",
      "Reached Hospital",
    ].includes(booking.status);
  };

  const handleTrack = (booking) => {
    localStorage.setItem("selectedBooking", JSON.stringify(booking));
    navigate("/tracking");
  };

  if (loading) {
    return (
      <div className="mobile-wrapper">
        <div className="phone-screen">
          <Navbar />
          <div className="history-page">
            <div className="empty-history-card">
              <h3>Loading Bookings...</h3>
              <p>Please wait while we fetch your booking history.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="history-page">
          <div className="history-header">
            <h2>Booking History</h2>
            <p>All your ambulance booking records will appear here.</p>
          </div>

          {bookings.length === 0 ? (
            <div className="empty-history-card">
              <h3>No Bookings Yet</h3>
              <p>You have not booked any ambulance yet.</p>
            </div>
          ) : (
            <div className="history-list">
              {bookings.map((b) => (
                <div className="history-card-modern" key={b._id}>
                  <div className="history-card-top">
                    <h3>{b.hospital}</h3>
                    <span className="history-status">{b.status}</span>
                  </div>

                  <p><b>Pickup:</b> {b.pickup}</p>
                  <p><b>Phone:</b> {b.phone}</p>
                  <p><b>Date:</b> {new Date(b.createdAt || b.date).toLocaleDateString()}</p>
                  <p><b>Time:</b> {new Date(b.createdAt || b.date).toLocaleTimeString()}</p>

                  {b.ambulanceNumber && <p><b>Ambulance Number:</b> {b.ambulanceNumber}</p>}
                  {b.driverName && <p><b>Driver Name:</b> {b.driverName}</p>}
                  {b.driverPhone && <p><b>Driver Phone:</b> {b.driverPhone}</p>}
                  {b.eta !== null && b.eta !== undefined && <p><b>ETA:</b> {b.eta} mins</p>}
                  {b.distanceKm !== null && b.distanceKm !== undefined && <p><b>Road Distance:</b> {b.distanceKm} km</p>}

                  {canTrackBooking(b) && (
                    <button
                      className="confirm-booking-btn"
                      style={{ marginTop: "12px" }}
                      onClick={() => handleTrack(b)}
                    >
                      Track Ambulance
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyBookings;