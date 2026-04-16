import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import Navbar from "../components/Navbar";
import "../App.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";

let SOCKET_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL || "http://localhost:5000";
if (SOCKET_URL.includes("localhost") && window.location.hostname !== "localhost") {
  SOCKET_URL = SOCKET_URL.replace("localhost", window.location.hostname);
}
const socket = io(SOCKET_URL);

const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [34, 34],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [34, 34],
});

const ambulanceIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -36],
});

function FitMapToData({ ambulancePosition, pickupPosition, hospitalPosition }) {
  const map = useMap();

  useEffect(() => {
    const points = [];

    if (ambulancePosition) points.push(ambulancePosition);
    if (pickupPosition) points.push(pickupPosition);
    if (hospitalPosition) points.push(hospitalPosition);

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [map, ambulancePosition, pickupPosition, hospitalPosition]);

  return null;
}

function Tracking() {
  const [bookingData, setBookingData] = useState(null);
  const [actualAmbulancePosition, setActualAmbulancePosition] = useState(null);
  const [smoothAmbulancePosition, setSmoothAmbulancePosition] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [loading, setLoading] = useState(true);

  const animationRef = useRef(null);

  const updateBookingState = (booking) => {
    if (!booking) return;

    setBookingData(booking);

    if (
      booking.ambulanceLat !== undefined &&
      booking.ambulanceLng !== undefined &&
      booking.ambulanceLat !== null &&
      booking.ambulanceLng !== null
    ) {
      const nextPos = [Number(booking.ambulanceLat), Number(booking.ambulanceLng)];
      setActualAmbulancePosition(nextPos);

      setSmoothAmbulancePosition((prev) => {
        if (!prev) return nextPos;
        return prev;
      });
    } else {
      setActualAmbulancePosition(null);
      setSmoothAmbulancePosition(null);
    }

    if (Array.isArray(booking.routeGeometry) && booking.routeGeometry.length > 0) {
      const converted = booking.routeGeometry.map(([lng, lat]) => [lat, lng]);
      setRoutePoints(converted);
    } else {
      setRoutePoints([]);
    }
  };

  useEffect(() => {
    let bookingId = null;

    try {
      const storedBooking = localStorage.getItem("selectedBooking");
      const userToken = localStorage.getItem("userToken");
      const userData = localStorage.getItem("userData");

      if (!userToken || !userData || !storedBooking) {
        setLoading(false);
        return;
      }

      const parsed = JSON.parse(storedBooking);
      bookingId = parsed?._id || null;

      updateBookingState(parsed);

      if (bookingId) {
        socket.emit("joinBookingRoom", bookingId);
      }
    } catch (error) {
      console.log("Failed to load selected booking:", error);
    } finally {
      setLoading(false);
    }

    const handleAmbulanceUpdate = (data) => {
      setBookingData((prev) => {
        if (!prev) return prev;
        if (data?.bookingId && prev._id !== data.bookingId) return prev;

        const updated = {
          ...prev,
          ambulanceLat: data?.lat ?? prev.ambulanceLat,
          ambulanceLng: data?.lng ?? prev.ambulanceLng,
          eta: data?.eta ?? prev.eta,
          distanceKm: data?.distanceKm ?? prev.distanceKm,
          routeGeometry: data?.routeGeometry ?? prev.routeGeometry,
          status: data?.status ?? prev.status,
          routeTarget: data?.routeTarget ?? prev.routeTarget,
          driverName: data?.driverName ?? prev.driverName,
          driverPhone: data?.driverPhone ?? prev.driverPhone,
          ambulanceNumber: data?.ambulanceNumber ?? prev.ambulanceNumber,
          pickupLat: data?.pickupLat ?? prev.pickupLat,
          pickupLng: data?.pickupLng ?? prev.pickupLng,
          hospitalLat: data?.hospitalLat ?? prev.hospitalLat,
          hospitalLng: data?.hospitalLng ?? prev.hospitalLng,
        };

        localStorage.setItem("selectedBooking", JSON.stringify(updated));
        updateBookingState(updated);
        return updated;
      });
    };

    socket.on("ambulanceLocationUpdated", handleAmbulanceUpdate);

    return () => {
      if (bookingId) {
        socket.emit("leaveBookingRoom", bookingId);
      }
      socket.off("ambulanceLocationUpdated", handleAmbulanceUpdate);
    };
  }, []);

  useEffect(() => {
    const refreshBooking = async () => {
      try {
        const storedBooking = localStorage.getItem("selectedBooking");
        const token = localStorage.getItem("userToken");

        if (!storedBooking || !token) return;

        const parsed = JSON.parse(storedBooking);

        const res = await axios.get(
          "/api/bookings/my-bookings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const latestBooking = res.data.find((b) => b._id === parsed._id);

        if (latestBooking) {
          localStorage.setItem("selectedBooking", JSON.stringify(latestBooking));
          updateBookingState(latestBooking);
        }
      } catch (error) {
        console.log("Failed to refresh booking:", error);
      }
    };

    refreshBooking();
    const interval = setInterval(refreshBooking, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!actualAmbulancePosition) return;

    if (!smoothAmbulancePosition) {
      setSmoothAmbulancePosition(actualAmbulancePosition);
      return;
    }

    cancelAnimationFrame(animationRef.current);

    const start = smoothAmbulancePosition;
    const end = actualAmbulancePosition;
    const duration = 1200;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const eased = t * (2 - t);

      const lat = start[0] + (end[0] - start[0]) * eased;
      const lng = start[1] + (end[1] - start[1]) * eased;

      setSmoothAmbulancePosition([lat, lng]);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationRef.current);
  }, [actualAmbulancePosition]);

  const pickupPosition = useMemo(() => {
    if (bookingData?.pickupLat == null || bookingData?.pickupLng == null) return null;
    return [Number(bookingData.pickupLat), Number(bookingData.pickupLng)];
  }, [bookingData]);

  const hospitalPosition = useMemo(() => {
    if (bookingData?.hospitalLat == null || bookingData?.hospitalLng == null) return null;
    return [Number(bookingData.hospitalLat), Number(bookingData.hospitalLng)];
  }, [bookingData]);

  const mapCenter = useMemo(() => {
    if (smoothAmbulancePosition) return smoothAmbulancePosition;
    if (pickupPosition) return pickupPosition;
    if (hospitalPosition) return hospitalPosition;
    return [19.076, 72.8777];
  }, [smoothAmbulancePosition, pickupPosition, hospitalPosition]);

  if (loading) {
    return (
      <div className="mobile-wrapper">
        <div className="phone-screen">
          <Navbar />
          <div className="page-with-navbar tracking-page">
            <div className="info-card">
              <h3>Loading Tracking...</h3>
              <p>Please wait while we load your booking details.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar tracking-page">
          <div className="driver-hero-card">
            <h2>Live Ambulance Tracking</h2>
            <p>Driver to pickup, then pickup to hospital route.</p>
          </div>

          {bookingData ? (
            <>
              <div className="tracking-status-card">
                <h3>Booking Status</h3>
                <p><strong>Current Status:</strong> {bookingData.status || "Assigned"}</p>
                <p>
                  <strong>Tracking Towards:</strong>{" "}
                  {bookingData.routeTarget === "hospital" ? "Hospital" : "Pickup"}
                </p>
                <p>
                  <strong>ETA:</strong>{" "}
                  {bookingData.eta !== null && bookingData.eta !== undefined
                    ? `${bookingData.eta} mins`
                    : "Calculating..."}
                </p>
                <p>
                  <strong>Distance:</strong>{" "}
                  {bookingData.distanceKm !== null && bookingData.distanceKm !== undefined
                    ? `${bookingData.distanceKm} km`
                    : "Updating..."}
                </p>
              </div>

              {(pickupPosition || hospitalPosition || smoothAmbulancePosition) && (
                <div className="map-container">
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ height: "340px", width: "100%", borderRadius: "18px" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitMapToData
                      ambulancePosition={smoothAmbulancePosition}
                      pickupPosition={pickupPosition}
                      hospitalPosition={hospitalPosition}
                    />

                    {routePoints.length > 1 && (
                      <Polyline
                        positions={routePoints}
                        pathOptions={{
                          color: "#2563eb",
                          weight: 7,
                          opacity: 1,
                        }}
                      />
                    )}

                    {pickupPosition && (
                      <Marker position={pickupPosition} icon={userIcon}>
                        <Popup>Pickup Location</Popup>
                      </Marker>
                    )}

                    {hospitalPosition && (
                      <Marker position={hospitalPosition} icon={hospitalIcon}>
                        <Popup>Hospital</Popup>
                      </Marker>
                    )}

                    {smoothAmbulancePosition && (
                      <Marker position={smoothAmbulancePosition} icon={ambulanceIcon}>
                        <Popup>
                          <div>
                            <strong>Live Ambulance</strong>
                            <br />
                            {bookingData.ambulanceNumber || "Assigned Ambulance"}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              )}

              <div className="info-card">
                <h3>Driver Details</h3>
                <p><strong>Driver Name:</strong> {bookingData.driverName || "Not assigned yet"}</p>
                <p><strong>Driver Phone:</strong> {bookingData.driverPhone || "Not available"}</p>
                <p><strong>Ambulance Number:</strong> {bookingData.ambulanceNumber || "Not assigned yet"}</p>
              </div>

              <div className="info-card">
                <h3>Booking Details</h3>
                <p><strong>Pickup:</strong> {bookingData.pickup || "Not available"}</p>
                <p><strong>Hospital:</strong> {bookingData.hospital || "Not available"}</p>
                <p><strong>Booking ID:</strong> {bookingData._id || "Not available"}</p>
              </div>
            </>
          ) : (
            <div className="info-card">
              <h3>No Booking Found</h3>
              <p>Please select a booking from My Bookings first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tracking;