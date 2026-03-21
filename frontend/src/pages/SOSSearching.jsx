import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "../App.css";

function SOSSearching() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/sos-tracking");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar searching-page">
          <div className="loader-circle"></div>
          <h2>Searching nearest ambulance...</h2>
          <p>Please wait while we connect you with the closest ambulance.</p>

          <div className="search-status-card">
            <p>Checking available ambulances...</p>
            <p>Matching nearest hospital...</p>
            <p>Preparing live tracking...</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SOSSearching;