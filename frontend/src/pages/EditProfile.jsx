import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function EditProfile() {
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("user");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [photo, setPhoto] = useState("");

  const [bloodGroup, setBloodGroup] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  const [status, setStatus] = useState("available");

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    const driverData = localStorage.getItem("driverData");
    const adminData = localStorage.getItem("adminData");

    let storedUser = null;

    if (driverData) {
      storedUser = JSON.parse(driverData);
    } else if (adminData) {
      storedUser = JSON.parse(adminData);
    } else if (userData) {
      storedUser = JSON.parse(userData);
    }

    if (storedUser) {
      setUserId(storedUser._id || "");
      setRole(storedUser.role || "user");

      setName(storedUser.name || "");
      setEmail(storedUser.email || "");
      setPhone(storedUser.phone || "");
      setPhoto(storedUser.photo || "");

      setBloodGroup(storedUser.bloodGroup || "");
      setAllergies(storedUser.allergies || "");
      setMedicalConditions(storedUser.medicalConditions || "");
      setEmergencyContact(storedUser.emergencyContact || "");

      setStatus(storedUser.status || "available");
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handlePhoto = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image smaller than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    try {
      if (!userId && role !== "admin") {
        alert("User not found. Please login again.");
        return;
      }

      if (role === "user") {
        const token = localStorage.getItem("userToken");

        const res = await axios.put(
          `https://medride-project.onrender.com/api/auth/update/${userId}`,
          {
            name,
            email,
            phone,
            bloodGroup,
            allergies,
            medicalConditions,
            emergencyContact,
            photo,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem(
          "userData",
          JSON.stringify({
            ...res.data,
            role: "user",
          })
        );

        alert("Profile updated successfully");
        navigate("/profile");
        return;
      }

      if (role === "driver") {
        const token = localStorage.getItem("driverToken");

        const res = await axios.put(
          `https://medride-project.onrender.com/api/drivers/update/${userId}`,
          {
            name,
            phone,
            photo,
            status,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem(
          "driverData",
          JSON.stringify({
            ...res.data.driver,
            role: "driver",
          })
        );

        alert("Driver profile updated successfully");
        navigate("/profile");
        return;
      }

      if (role === "admin") {
        const updatedAdmin = {
          _id: userId,
          name,
          email,
          phone,
          photo,
          role: "admin",
        };

        localStorage.setItem("adminData", JSON.stringify(updatedAdmin));
        alert("Admin profile updated successfully");
        navigate("/profile");
      }
    } catch (err) {
      console.log(err);
      alert(err?.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="edit-page">
          <div className="edit-header-card">
            <h2>Edit Profile</h2>
            <p>
              {role === "user" && "Update your personal and medical details"}
              {role === "driver" && "Update your driver profile details"}
              {role === "admin" && "Update your admin profile details"}
            </p>
          </div>

          <div className="edit-form-card">
            <div className="photo-upload-modern">
              <img
                src={photo || "https://via.placeholder.com/120"}
                alt="profile"
                className="profile-avatar large"
              />

              <label className="upload-btn">
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  hidden
                />
              </label>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            {role !== "driver" && (
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
            )}

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            {role === "user" && (
              <>
                <div className="form-group">
                  <label>Blood Group</label>
                  <input
                    type="text"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    placeholder="Enter blood group"
                  />
                </div>

                <div className="form-group">
                  <label>Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Enter allergies"
                  />
                </div>

                <div className="form-group">
                  <label>Medical Conditions</label>
                  <textarea
                    value={medicalConditions}
                    onChange={(e) => setMedicalConditions(e.target.value)}
                    placeholder="Enter medical conditions"
                    rows="4"
                    className="edit-textarea"
                  />
                </div>

                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="Enter emergency contact"
                  />
                </div>
              </>
            )}

            {role === "driver" && (
              <div className="form-group">
                <label>Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            )}

            <button className="save-profile-btn" onClick={updateProfile}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;