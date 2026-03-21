import React from "react";
import Navbar from "../components/Navbar";
import "../App.css";

function DriverLive() {
  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar booking-page">
          <div className="booking-header-card">
            <h2>Driver Live Tracking</h2>
            <p>Live ambulance tracking is now handled automatically from Driver Dashboard.</p>
          </div>

          <div className="info-card">
            <h3>How it works</h3>
            <p>
              When the driver starts a ride from the Driver Dashboard, the system
              automatically shares live location, updates ETA, updates distance,
              and sends real-time tracking to the user.
            </p>
          </div>

          <div className="info-card">
            <h3>No Manual IDs Needed</h3>
            <p>
              You no longer need to enter ambulance ID or booking ID manually.
              Everything is linked to the assigned booking automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverLive;