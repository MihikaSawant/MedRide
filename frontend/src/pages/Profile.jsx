import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://medride.onrender.com";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showFamilyForm, setShowFamilyForm] = useState(false);
  const [newFamilyMember, setNewFamilyMember] = useState({
    name: "",
    relation: "",
    gender: "",
    age: "",
    bloodGroup: "",
    medicalConditions: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
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
        try {
          // Fetch exact up-to-date user data to get family members
          const token = localStorage.getItem("userToken") || localStorage.getItem("token");
          if(token){
            const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            localStorage.setItem("userData", JSON.stringify(res.data));
          } else {
            setUser(JSON.parse(userData));
          }
        } catch (error) {
          console.error("Failed to fetch user data", error);
          setUser(JSON.parse(userData));
        }
        return;
      }

      navigate("/login");
    };
    
    fetchUser();
  }, [navigate]);

  const handleAddFamilyMember = async () => {
    try {
      const token = localStorage.getItem("userToken") || localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/auth/family`, newFamilyMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      localStorage.setItem("userData", JSON.stringify(res.data));
      setShowFamilyForm(false);
      setNewFamilyMember({ name: "", relation: "", gender: "", age: "", bloodGroup: "", medicalConditions: "" });
      alert("Family member added successfully!");
    } catch (error) {
      alert("Error adding family member: " + (error.response?.data?.message || err.message));
    }
  };

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

  const inputStyle = {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc'
  };

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

          {role === "user" && (user.accountType === "Family" || true) && (
            <div className="info-section">
              <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Family Members</h3>
                <button 
                  className="primary-btn" 
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '14px', margin: '0' }}
                  onClick={() => setShowFamilyForm(!showFamilyForm)}
                >
                  {showFamilyForm ? 'Cancel' : 'Add Member'}
                </button>
              </div>

              {showFamilyForm && (
                <div className="info-card" style={{ marginBottom: '15px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#333' }}>New Family Member</h4>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: '500' }}>Full Name</label>
                    <input type="text" placeholder="E.g. Jane Doe" style={inputStyle} value={newFamilyMember.name} onChange={e => setNewFamilyMember({...newFamilyMember, name: e.target.value})} />
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: '500' }}>Relation</label>
                    <select style={inputStyle} value={newFamilyMember.relation} onChange={e => setNewFamilyMember({...newFamilyMember, relation: e.target.value})}>
                      <option value="">Select Relation...</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Wife">Wife</option>
                      <option value="Husband">Husband</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Son">Son</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Sister">Sister</option>
                      <option value="Brother">Brother</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: '500' }}>Gender</label>
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input type="radio" value="Male" checked={newFamilyMember.gender === "Male"} onChange={e => setNewFamilyMember({...newFamilyMember, gender: e.target.value})} />
                        Male
                      </label>
                      <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input type="radio" value="Female" checked={newFamilyMember.gender === "Female"} onChange={e => setNewFamilyMember({...newFamilyMember, gender: e.target.value})} />
                        Female
                      </label>
                      <label style={{ fontSize: '14px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                        <input type="radio" value="Other" checked={newFamilyMember.gender === "Other"} onChange={e => setNewFamilyMember({...newFamilyMember, gender: e.target.value})} />
                        Other
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: '500' }}>Age (Years)</label>
                      <input type="number" min="0" max="150" placeholder="e.g. 45" style={inputStyle} value={newFamilyMember.age} onChange={e => setNewFamilyMember({...newFamilyMember, age: e.target.value})} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: '500' }}>Blood Group</label>
                      <select style={inputStyle} value={newFamilyMember.bloodGroup} onChange={e => setNewFamilyMember({...newFamilyMember, bloodGroup: e.target.value})}>
                        <option value="">Select...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="Unknown">Unknown</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: '#555', marginBottom: '5px', fontWeight: '500' }}>Medical Conditions (Optional)</label>
                    <textarea rows="2" placeholder="Asthma, Diabetes, etc." style={{...inputStyle, resize: 'vertical'}} value={newFamilyMember.medicalConditions} onChange={e => setNewFamilyMember({...newFamilyMember, medicalConditions: e.target.value})}></textarea>
                  </div>

                  <button className="primary-btn" style={{ width: '100%', marginTop: '5px' }} onClick={handleAddFamilyMember}>Save Family Member</button>
                </div>
              )}

              {(!showFamilyForm) && (
                user.familyMembers && user.familyMembers.length > 0 ? (
                  user.familyMembers.map((member, index) => (
                    <div key={index} className="info-card" style={{ marginBottom: '10px' }}>
                      <div className="info-row">
                        <span>Name</span>
                        <strong>{member.name} ({member.relation})</strong>
                      </div>
                      <div className="info-row">
                        <span>Age</span>
                        <strong>{member.age || "-"}</strong>
                      </div>
                      <div className="info-row">
                        <span>Blood Group</span>
                        <strong>{member.bloodGroup || "-"}</strong>
                      </div>
                      {member.medicalConditions && (
                        <div className="info-row">
                          <span>Medical Needs</span>
                          <strong>{member.medicalConditions}</strong>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="info-card">
                    <p style={{ textAlign: "center", color: "gray" }}>No family members added yet.</p>
                  </div>
                )
              )}
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