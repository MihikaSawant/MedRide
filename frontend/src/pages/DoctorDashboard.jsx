import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { toast, Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";

let SOCKET_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
if (SOCKET_URL.includes("localhost") && window.location.hostname !== "localhost") {
  SOCKET_URL = SOCKET_URL.replace("localhost", window.location.hostname);
}

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [socket, setSocket] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("doctorData");
    if (data) {
      const parsed = JSON.parse(data);
      setDoctor(parsed);

      const newSocket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        console.log("Doctor socket connected:", newSocket.id);
        setIsSocketConnected(true);
        newSocket.emit("doctorLogin", parsed.id || parsed._id);
        toast.success("You are online and ready to receive calls.");
      });

      newSocket.on("disconnect", () => {
        console.log("Doctor socket disconnected");
        setIsSocketConnected(false);
        toast.error("Connection lost. Reconnecting...");
      });

      newSocket.on("incoming_call", (data) => {
        console.log("Incoming call received!", data);
        setIncomingCall(data);
        toast.info(`Call from ${data.patientName}!`, { duration: 5000 });
      });

      return () => {
        console.log("Disconnecting doctor socket");
        newSocket.disconnect();
      };
    } else {
      navigate("/doctor-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("doctorData");
    navigate("/doctor-login");
  };

  const acceptCall = () => {
    console.log("Accept call clicked. Socket connected?", isSocketConnected, "Has incoming call?", !!incomingCall);
    
    if (!socket || !incomingCall) {
      toast.error("Unable to accept call. Please try again.");
      return;
    }

    const callData = {
      roomID: incomingCall.roomID,
      patientSocketId: incomingCall.patientSocketId,
      doctorName: doctor.name,
      doctorId: doctor.id || doctor._id
    };

    console.log("Emitting accept_call with data:", callData);
    
    try {
      socket.emit("accept_call", callData);
      // Save doctor info for video consultation
      localStorage.setItem("doctorNameForConsultation", doctor.name);
      localStorage.setItem("activeConsultationRoomID", incomingCall.roomID);
      
      // Clear incoming call state before navigating
      setIncomingCall(null);
      
      toast.success("Call accepted! Joining room...");
      setTimeout(() => {
        navigate(`/video-consultation/${incomingCall.roomID}`);
      }, 500);
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to accept call");
    }
  };

  const rejectCall = () => {
    console.log("Reject call clicked. Has incoming call?", !!incomingCall);
    
    if (!socket || !incomingCall) {
      toast.error("Unable to reject call");
      return;
    }
    
    const callData = {
      roomID: incomingCall.roomID,
      patientSocketId: incomingCall.patientSocketId
    };
    
    console.log("Emitting reject_call with data:", callData);
    
    try {
      socket.emit("reject_call", callData);
      setIncomingCall(null);
      toast.info("Call declined");
    } catch (error) {
      console.error("Error rejecting call:", error);
      toast.error("Failed to decline call");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />
        <Toaster />
        
        <div className="page-with-navbar dashboard-page" style={{ position: "relative" }}>
          
          <div className="dashboard-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="dashboard-subtitle">Online</p>
              <h2 className="dashboard-title">Dr. {doctor?.name}</h2>
            </div>
            <button
              onClick={handleLogout}
              style={{ background: "#fee2e2", color: "#b91c1c", border: "none", padding: "8px 16px", borderRadius: "12px", fontWeight: "bold", cursor: "pointer" }}
            >
              Logout
            </button>
          </div>

          {incomingCall && (
            <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.7)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", backdropFilter: "blur(4px)" }}>
              <div style={{ background: "white", borderRadius: "24px", padding: "30px", width: "100%", maxWidth: "320px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
                <h3 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>Incoming Call!</h3>
                <p style={{ color: "#64748b", marginBottom: "30px" }}><strong>{incomingCall.patientName}</strong> is requesting a consultation.</p>
                
                <div style={{ display: "flex", gap: "15px" }}>
                  <button
                    onClick={rejectCall}
                    style={{ flex: 1, background: "#fee2e2", color: "#b91c1c", border: "none", padding: "14px", borderRadius: "16px", fontWeight: "bold", cursor: "pointer" }}
                  >
                    Decline
                  </button>
                  <button
                    onClick={acceptCall}
                    style={{ flex: 1, background: "#10b981", color: "white", border: "none", padding: "14px", borderRadius: "16px", fontWeight: "bold", cursor: "pointer", boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.4)" }}
                  >
                    Accept
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="dashboard-grid-modern" style={{ marginTop: "20px" }}>
            <div
              className="dashboard-card-modern"
              style={{ background: "white", opacity: 0.8, cursor: "pointer" }}
              onClick={() => {
                const roomID = prompt("Enter the Patient's Room ID manually:");
                if (roomID) navigate(`/video-consultation/${roomID}`);
              }}
            >
              <div className="dashboard-icon" style={{ background: "#f1f5f9", color: "#475569" }}>L</div>
              <h3 style={{ color: "#1e293b" }}>Manual Join</h3>
              <p>Type a Room ID manually to join directly if automated signal failed.</p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
