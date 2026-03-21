import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

function DriverRegister() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [ambulanceId, setAmbulanceId] = useState("");
  const [ambulances, setAmbulances] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAmbulances();
  }, []);

  const fetchAmbulances = async () => {
    try {
      const res = await axios.get("http://https://medride-project.onrender.com/api/ambulances");
      setAmbulances(res.data || []);
    } catch (error) {
      console.log("Fetch ambulances error:", error);
      alert("Failed to load ambulances");
    }
  };

  const handleRegister = async () => {
    if (!name || !phone || !password || !ambulanceId) {
      alert("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      await axios.post("http://https://medride-project.onrender.com/api/drivers", {
        name,
        phone,
        password,
        ambulanceId,
      });

      alert("Driver registered successfully");
      navigate("/driver-login");
    } catch (error) {
      console.log("Driver register error:", error);
      alert(error?.response?.data?.message || "Driver registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <div className="admin-login-page">
          <div className="driver-login-card">
            <h2 className="driver-login-title">Driver Register</h2>
            <p className="driver-login-subtitle">
              Create a new driver account and save it in MongoDB.
            </p>

            <input
              type="text"
              placeholder="Enter driver name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <select
              value={ambulanceId}
              onChange={(e) => setAmbulanceId(e.target.value)}
            >
              <option value="">Select Ambulance</option>
              {ambulances.map((amb) => (
                <option key={amb._id} value={amb._id}>
                  {amb.ambulanceNumber}
                </option>
              ))}
            </select>

            <button className="driver-login-btn" onClick={handleRegister}>
              {loading ? "Registering..." : "Register Driver"}
            </button>

            <button
              className="location-btn"
              style={{ marginTop: "10px" }}
              onClick={() => navigate("/driver-login")}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriverRegister;