import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

import Navbar from "../components/Navbar";

const VideoConsultation = () => {
    const { roomID } = useParams();
    const navigate = useNavigate();
    const videoContainer = useRef(null);
    const [consultation, setConsultation] = useState(null);
    const [currentRole, setCurrentRole] = useState(null);

    // IMPORTANT: Get yours from https://console.zegocloud.com/
    const appID = 545263761; // <--- REPLACE THIS 
    const serverSecret = "e25f692c82fe49e3cb48924fb19e2f5a"; // <--- REPLACE THIS

    useEffect(() => {
        const doctorData = localStorage.getItem("doctorData");
        const userData = localStorage.getItem("userData");

        if (doctorData) {
            setCurrentRole("doctor");
            return;
        }

        if (userData) {
            setCurrentRole("user");
            return;
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("userToken") || localStorage.getItem("doctorToken") || localStorage.getItem("adminToken");

        if (!roomID || !token) {
            return;
        }

        const fetchConsultation = async () => {
            try {
                const res = await axios.get(`/api/consultations/room/${roomID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                setConsultation(res.data);
                localStorage.setItem("currentConsultationPatientName", res.data.patientName || "Patient");
                localStorage.setItem("currentConsultationDoctorName", res.data.doctorName || "Doctor");
            } catch (error) {
                console.error("Failed to fetch consultation details:", error);
            }
        };

        fetchConsultation();
    }, [roomID]);

    useEffect(() => {
        if (appID === 1205367677) return; // Halt if using fake ID
        
        let zc = null;
        let isMounted = true;

        const initZego = async () => {
            const patientName = consultation?.patientName || localStorage.getItem("currentConsultationPatientName") || localStorage.getItem("userName") || "Patient_" + Math.floor(Math.random() * 1000);
            const doctorName = consultation?.doctorName || localStorage.getItem("currentConsultationDoctorName") || localStorage.getItem("doctorNameForConsultation") || "Doctor";
            const currentUserName = currentRole === "doctor" ? doctorName : patientName;

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomID,
                Date.now().toString(),
                currentUserName
            );

            zc = ZegoUIKitPrebuilt.create(kitToken);
            if (isMounted && videoContainer.current) {
                zc.joinRoom({
                    container: videoContainer.current,
                    sharedLinks: [
                        {
                            name: "Copy Link",
                            url: `${window.location.protocol}//${window.location.host}${window.location.pathname}?roomID=${roomID}`,
                        },
                    ],
                    scenario: {
                        mode: ZegoUIKitPrebuilt.OneONoneCall,
                    },
                    showScreenSharingButton: true,
                    showPreJoinView: false,
                    showLeavingView: false,
                    onLeaveRoom: () => {
                        window.location.href = "/dashboard";
                    }
                });
            }
        };

        if (videoContainer.current) {
            initZego();
        }

        return () => {
            isMounted = false;
        };
    }, [roomID, currentRole]);

    return (
        <div className="mobile-wrapper">
            <div className="phone-screen" style={{ display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", background: "#f8fafc", overflow: "hidden" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px", marginTop: "10px", color: "#1e293b" }}>Consultation Room</h2>
                    <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e3a8a", borderRadius: "14px", padding: "12px 14px", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ fontWeight: 700 }}>Patient: {consultation?.patientName || localStorage.getItem("currentConsultationPatientName") || localStorage.getItem("userName") || "Loading..."}</div>
                        <div style={{ fontWeight: 700 }}>Doctor: {consultation?.doctorName || localStorage.getItem("currentConsultationDoctorName") || localStorage.getItem("doctorNameForConsultation") || "Waiting for doctor..."}</div>
                        <div style={{ fontSize: "12px", opacity: 0.8 }}>Room ID: {roomID}</div>
                    </div>
                    
                    {appID === 1205367677 && (
                        <div style={{ background: "#fee2e2", color: "#991b1b", padding: "16px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #f87171" }}>
                            <h3 style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "8px" }}>⚠️ Account Setup Required</h3>
                            <p style={{ fontSize: "14px", lineHeight: "1.5" }}>ZegoCloud rejected the connection (error 1001004). You must replace the sample AppID and ServerSecret in the code to test real calls!</p>
                        </div>
                    )}

                    <div style={{ flex: 1, background: "black", borderRadius: "20px", overflow: "hidden", minHeight: "50vh", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
                        <div ref={videoContainer} style={{ width: "100%", height: "100%" }} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoConsultation;
