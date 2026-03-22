import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://medride.onrender.com";

function GoogleSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleGoogleLogin = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get("token");

        if (!token) {
          navigate("/login");
          return;
        }

        localStorage.removeItem("driverToken");
        localStorage.removeItem("driverData");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminData");

        localStorage.setItem("userToken", token);

        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const loggedInUser = {
          ...res.data,
          role: "user",
        };

        localStorage.setItem("userData", JSON.stringify(loggedInUser));
        navigate("/dashboard");
      } catch (error) {
        console.log("Google login error:", error);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userData");
        navigate("/login");
      }
    };

    handleGoogleLogin();
  }, [location, navigate]);

  return (
    <div style={{ padding: "20px", textAlign: "center", color: "white" }}>
      Logging you in...
    </div>
  );
}

export default GoogleSuccess;