import React, { useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

import Navbar from "../components/Navbar";

const VideoConsultation = () => {
    const { roomID } = useParams();
    const navigate = useNavigate();
    const videoContainer = useRef(null);

    // IMPORTANT: Get yours from https://console.zegocloud.com/
    const appID = 545263761; // <--- REPLACE THIS 
    const serverSecret = "e25f692c82fe49e3cb48924fb19e2f5a"; // <--- REPLACE THIS

    useEffect(() => {
        if (appID === 1205367677) return; // Halt if using fake ID
        
        let zc = null;
        let isMounted = true;

        const initZego = async () => {
            const userName = localStorage.getItem("userName") || "Patient_" + Math.floor(Math.random() * 1000);

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                appID,
                serverSecret,
                roomID,
                Date.now().toString(),
                userName
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
    }, [roomID]);

    return (
        <div className="mobile-wrapper">
            <div className="phone-screen" style={{ display: "flex", flexDirection: "column" }}>
                <Navbar />
                <div style={{ flex: 1, padding: "20px", display: "flex", flexDirection: "column", background: "#f8fafc", overflow: "hidden" }}>
                    <h2 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px", marginTop: "10px", color: "#1e293b" }}>Consultation Room</h2>
                    
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
