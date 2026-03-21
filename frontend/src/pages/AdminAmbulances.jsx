import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

function AdminAmbulances() {
  const [ambulances, setAmbulances] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [ambulanceForm, setAmbulanceForm] = useState({
    ambulanceNumber: "",
    driverName: "",
    phone: "",
    currentLat: "",
    currentLng: "",
    status: "available",
  });

  const [driverForm, setDriverForm] = useState({
    name: "",
    phone: "",
    password: "",
    ambulanceId: "",
  });

  const fetchData = async () => {
    try {
      const ambulanceRes = await axios.get("http://https://medride-project.onrender.com/api/ambulances");
      const driverRes = await axios.get("http://https://medride-project.onrender.com/api/drivers");

      setAmbulances(ambulanceRes.data);
      setDrivers(driverRes.data);
    } catch (error) {
      console.log("Admin ambulance fetch error:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAmbulanceCreate = async () => {
    const { ambulanceNumber, driverName, phone, currentLat, currentLng } = ambulanceForm;

    if (!ambulanceNumber || !driverName || !phone || !currentLat || !currentLng) {
      alert("Please fill all ambulance fields");
      return;
    }

    try {
      await axios.post("http://https://medride-project.onrender.com/api/ambulances", {
        ...ambulanceForm,
        currentLat: Number(ambulanceForm.currentLat),
        currentLng: Number(ambulanceForm.currentLng),
      });

      alert("Ambulance added successfully");
      setAmbulanceForm({
        ambulanceNumber: "",
        driverName: "",
        phone: "",
        currentLat: "",
        currentLng: "",
        status: "available",
      });
      fetchData();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to add ambulance");
    }
  };

  const handleDriverCreate = async () => {
    const { name, phone, password, ambulanceId } = driverForm;

    if (!name || !phone || !password || !ambulanceId) {
      alert("Please fill all driver fields");
      return;
    }

    try {
      await axios.post("http://https://medride-project.onrender.com/api/drivers", driverForm);

      alert("Driver created successfully");
      setDriverForm({
        name: "",
        phone: "",
        password: "",
        ambulanceId: "",
      });
      fetchData();
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Failed to create driver");
    }
  };

  const handleStatusUpdate = async (ambulanceId, newStatus) => {
    try {
      await axios.put(`http://https://medride-project.onrender.com/api/ambulances/${ambulanceId}/status`, {
        status: newStatus,
      });
      fetchData();
    } catch (error) {
      console.log(error);
      alert("Failed to update status");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar admin-page">
          <div className="admin-hero">
            <h2>Ambulance & Driver Management</h2>
            <p>Add ambulances, create drivers, and manage ambulance status.</p>
          </div>

          <div className="admin-booking-card">
            <h3 style={{ marginBottom: "14px" }}>Add Ambulance</h3>

            <div className="admin-form-group">
              <label>Ambulance Number</label>
              <input
                type="text"
                value={ambulanceForm.ambulanceNumber}
                onChange={(e) =>
                  setAmbulanceForm({ ...ambulanceForm, ambulanceNumber: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Default Driver Name</label>
              <input
                type="text"
                value={ambulanceForm.driverName}
                onChange={(e) =>
                  setAmbulanceForm({ ...ambulanceForm, driverName: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Phone</label>
              <input
                type="text"
                value={ambulanceForm.phone}
                onChange={(e) =>
                  setAmbulanceForm({ ...ambulanceForm, phone: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Current Latitude</label>
              <input
                type="number"
                value={ambulanceForm.currentLat}
                onChange={(e) =>
                  setAmbulanceForm({ ...ambulanceForm, currentLat: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Current Longitude</label>
              <input
                type="number"
                value={ambulanceForm.currentLng}
                onChange={(e) =>
                  setAmbulanceForm({ ...ambulanceForm, currentLng: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Status</label>
              <select
                value={ambulanceForm.status}
                onChange={(e) =>
                  setAmbulanceForm({ ...ambulanceForm, status: e.target.value })
                }
              >
                <option value="available">available</option>
                <option value="busy">busy</option>
                <option value="offline">offline</option>
              </select>
            </div>

            <button className="admin-save-btn" onClick={handleAmbulanceCreate}>
              Add Ambulance
            </button>
          </div>

          <div className="admin-booking-card">
            <h3 style={{ marginBottom: "14px" }}>Create Driver</h3>

            <div className="admin-form-group">
              <label>Driver Name</label>
              <input
                type="text"
                value={driverForm.name}
                onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label>Phone</label>
              <input
                type="text"
                value={driverForm.phone}
                onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
              />
            </div>

            <div className="admin-form-group">
              <label>Password</label>
              <input
                type="text"
                value={driverForm.password}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, password: e.target.value })
                }
              />
            </div>

            <div className="admin-form-group">
              <label>Assign Ambulance</label>
              <select
                value={driverForm.ambulanceId}
                onChange={(e) =>
                  setDriverForm({ ...driverForm, ambulanceId: e.target.value })
                }
              >
                <option value="">Select ambulance</option>
                {ambulances.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.ambulanceNumber}
                  </option>
                ))}
              </select>
            </div>

            <button className="admin-save-btn" onClick={handleDriverCreate}>
              Create Driver
            </button>
          </div>

          <div className="admin-booking-card">
            <h3 style={{ marginBottom: "14px" }}>All Ambulances</h3>

            {ambulances.length === 0 ? (
              <div className="admin-empty-card">
                <h3>No ambulances found</h3>
                <p>Add ambulances to manage emergency fleet.</p>
              </div>
            ) : (
              ambulances.map((item) => (
                <div key={item._id} className="admin-ambulance-item">
                  <p><strong>Ambulance:</strong> {item.ambulanceNumber}</p>
                  <p><strong>Driver Name:</strong> {item.driverName}</p>
                  <p><strong>Phone:</strong> {item.phone}</p>
                  <p><strong>Status:</strong> {item.status}</p>
                  <p><strong>Linked Driver Login:</strong> {item.driver ? item.driver.name : "Not created"}</p>

                  <div className="admin-btn-row">
                    <button
                      className="admin-update-btn"
                      onClick={() => handleStatusUpdate(item._id, "available")}
                    >
                      Set Available
                    </button>
                    <button
                      className="admin-update-btn"
                      onClick={() => handleStatusUpdate(item._id, "busy")}
                    >
                      Set Busy
                    </button>
                    <button
                      className="admin-update-btn"
                      onClick={() => handleStatusUpdate(item._id, "offline")}
                    >
                      Set Offline
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="admin-booking-card">
            <h3 style={{ marginBottom: "14px" }}>All Drivers</h3>

            {drivers.length === 0 ? (
              <div className="admin-empty-card">
                <h3>No drivers found</h3>
                <p>Create driver login accounts from admin panel.</p>
              </div>
            ) : (
              drivers.map((driver) => (
                <div key={driver._id} className="admin-ambulance-item">
                  <p><strong>Name:</strong> {driver.name}</p>
                  <p><strong>Phone:</strong> {driver.phone}</p>
                  <p><strong>Assigned Ambulance:</strong> {driver.ambulanceId?.ambulanceNumber || "Not linked"}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAmbulances;