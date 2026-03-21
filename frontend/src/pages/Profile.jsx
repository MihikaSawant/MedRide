import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const driverData = localStorage.getItem("driverData");
    const adminData = localStorage.getItem("adminData");

    if (driverData) {
      setUser(JSON.parse(driverData));
      return;
    }

    if (adminData) {
      setUser(JSON.parse(adminData));
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
      return;
    }

    navigate("/login");
  }, [navigate]);

  if (!user) {
    return (
      <div className="mobile-wrapper">
        <div className="phone-screen">
          <Navbar />
          <div className="profile-page">
            <div className="loading-card">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  const role = user.role || "user";

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="profile-page">
          <div className="profile-hero">
            <div className="profile-avatar-wrap">
              <img
                src={user.photo || "https://via.placeholder.com/120"}
                alt="profile"
                className="profile-avatar"
              />
            </div>

            <h2 className="profile-name">{user.name || "User Name"}</h2>
            <p className="profile-email">
              {user.email || user.phone || "No details"}
            </p>
            <p className="profile-email" style={{ marginTop: "4px" }}>
              Role: {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>

            <button
              className="primary-btn"
              onClick={() => navigate("/edit-profile")}
            >
              Edit Profile
            </button>
          </div>

          <div className="info-section">
            <div className="section-header">
              <h3>Personal Information</h3>
            </div>

            <div className="info-card">
              <div className="info-row">
                <span>Name</span>
                <strong>{user.name || "-"}</strong>
              </div>

              {role !== "driver" && (
                <div className="info-row">
                  <span>Email</span>
                  <strong>{user.email || "-"}</strong>
                </div>
              )}

              <div className="info-row">
                <span>Phone</span>
                <strong>{user.phone || "-"}</strong>
              </div>
            </div>
          </div>

          {role === "user" && (
            <div className="info-section">
              <div className="section-header">
                <h3>Medical Information</h3>
              </div>

              <div className="info-card">
                <div className="info-row">
                  <span>Blood Group</span>
                  <strong>{user.bloodGroup || "-"}</strong>
                </div>

                <div className="info-row">
                  <span>Allergies</span>
                  <strong>{user.allergies || "-"}</strong>
                </div>

                <div className="info-row">
                  <span>Medical Conditions</span>
                  <strong>{user.medicalConditions || "-"}</strong>
                </div>

                <div className="info-row">
                  <span>Emergency Contact</span>
                  <strong>{user.emergencyContact || "-"}</strong>
                </div>
              </div>
            </div>
          )}

          {role === "driver" && (
            <div className="info-section">
              <div className="section-header">
                <h3>Driver Information</h3>
              </div>

              <div className="info-card">
                <div className="info-row">
                  <span>Status</span>
                  <strong>{user.status || "available"}</strong>
                </div>

                <div className="info-row">
                  <span>Online</span>
                  <strong>{user.isOnline ? "Yes" : "No"}</strong>
                </div>

                <div className="info-row">
                  <span>Vehicle Number</span>
                  <strong>{user.ambulance?.vehicleNumber || user.ambulanceNumber || "-"}</strong>
                </div>

                <div className="info-row">
                  <span>Ambulance Type</span>
                  <strong>{user.ambulance?.type || "-"}</strong>
                </div>

                <div className="info-row">
                  <span>Ambulance Status</span>
                  <strong>{user.ambulance?.status || "-"}</strong>
                </div>
              </div>
            </div>
          )}

          {role === "admin" && (
            <div className="info-section">
              <div className="section-header">
                <h3>Admin Information</h3>
              </div>

              <div className="info-card">
                <div className="info-row">
                  <span>Admin Name</span>
                  <strong>{user.name || "Admin"}</strong>
                </div>

                <div className="info-row">
                  <span>Email</span>
                  <strong>{user.email || "-"}</strong>
                </div>

                <div className="info-row">
                  <span>Access Level</span>
                  <strong>Full Access</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;