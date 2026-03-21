import React, { useEffect, useMemo, useState } from "react";
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
} from "react-leaflet";
import L from "leaflet";

const socket = io("https://medride-project.onrender.com");

const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

const ambulanceIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

function SOSTracking() {
  const [bookingData, setBookingData] = useState(null);
  const [status, setStatus] = useState("Assigned");
  const [eta, setEta] = useState(null);
  const [ambulancePosition, setAmbulancePosition] = useState(null);
  const [roadDistance, setRoadDistance] = useState(null);
  const [routePoints, setRoutePoints] = useState([]);
  const [routeTarget, setRouteTarget] = useState("pickup");
  const [loading, setLoading] = useState(true);

  const loadLatestBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`https://medride-project.onrender.com/api/sos/${bookingId}`, {
        headers: {
          Authorization: token,
        },
      });

      const latestBooking = res.data;

      setBookingData({ booking: latestBooking });
      setStatus(latestBooking?.status || "Assigned");
      setEta(latestBooking?.eta || null);
      setRoadDistance(latestBooking?.distanceKm || null);
      setRouteTarget(latestBooking?.routeTarget || "pickup");

      if (
        latestBooking?.ambulanceLat != null &&
        latestBooking?.ambulanceLng != null
      ) {
        setAmbulancePosition([
          latestBooking.ambulanceLat,
          latestBooking.ambulanceLng,
        ]);
      } else if (
        latestBooking?.ambulanceId?.currentLat != null &&
        latestBooking?.ambulanceId?.currentLng != null
      ) {
        setAmbulancePosition([
          latestBooking.ambulanceId.currentLat,
          latestBooking.ambulanceId.currentLng,
        ]);
      }

      if (
        Array.isArray(latestBooking?.routeGeometry) &&
        latestBooking.routeGeometry.length > 0
      ) {
        const converted = latestBooking.routeGeometry.map(([lng, lat]) => [lat, lng]);
        setRoutePoints(converted);
      }
    } catch (error) {
      console.log("Failed to fetch latest SOS booking:", error);
    }
  };

  useEffect(() => {
    let bookingId = null;

    try {
      const storedBooking = localStorage.getItem("sosBooking");

      if (storedBooking) {
        const parsed = JSON.parse(storedBooking);

        setBookingData(parsed);
        setStatus(parsed?.booking?.status || "Assigned");
        setEta(parsed?.booking?.eta || parsed?.eta || null);
        setRoadDistance(parsed?.booking?.distanceKm || null);
        setRouteTarget(parsed?.booking?.routeTarget || "pickup");

        if (
          parsed?.booking?.ambulanceLat != null &&
          parsed?.booking?.ambulanceLng != null
        ) {
          setAmbulancePosition([
            parsed.booking.ambulanceLat,
            parsed.booking.ambulanceLng,
          ]);
        } else if (
          parsed?.ambulance?.currentLat != null &&
          parsed?.ambulance?.currentLng != null
        ) {
          setAmbulancePosition([
            parsed.ambulance.currentLat,
            parsed.ambulance.currentLng,
          ]);
        }

        if (
          Array.isArray(parsed?.booking?.routeGeometry) &&
          parsed.booking.routeGeometry.length > 0
        ) {
          const converted = parsed.booking.routeGeometry.map(([lng, lat]) => [lat, lng]);
          setRoutePoints(converted);
        }

        bookingId = parsed?.booking?._id;

        if (bookingId) {
          socket.emit("joinBookingRoom", bookingId);
          loadLatestBooking(bookingId);
        }
      }
    } catch (error) {
      console.log("Failed to read SOS booking from localStorage:", error);
    } finally {
      setLoading(false);
    }

    const handleAmbulanceUpdate = (data) => {
      if (data?.lat !== undefined && data?.lng !== undefined) {
        setAmbulancePosition([data.lat, data.lng]);
      }

      if (data?.eta !== undefined) {
        setEta(data.eta);
      }

      if (data?.distanceKm !== undefined) {
        setRoadDistance(data.distanceKm);
      }

      if (Array.isArray(data?.routeGeometry)) {
        const converted = data.routeGeometry.map(([lng, lat]) => [lat, lng]);
        setRoutePoints(converted);
      }

      if (data?.status) {
        setStatus(data.status);
      }

      if (data?.routeTarget) {
        setRouteTarget(data.routeTarget);
      }

      setBookingData((prev) =>
        prev
          ? {
              ...prev,
              booking: {
                ...prev.booking,
                ambulanceLat: data?.lat ?? prev.booking?.ambulanceLat,
                ambulanceLng: data?.lng ?? prev.booking?.ambulanceLng,
                eta: data?.eta ?? prev.booking?.eta,
                distanceKm: data?.distanceKm ?? prev.booking?.distanceKm,
                routeTarget: data?.routeTarget ?? prev.booking?.routeTarget,
                routeGeometry: data?.routeGeometry ?? prev.booking?.routeGeometry,
                status: data?.status ?? prev.booking?.status,
                pickupLat: data?.pickupLat ?? prev.booking?.pickupLat,
                pickupLng: data?.pickupLng ?? prev.booking?.pickupLng,
                hospitalLat: data?.hospitalLat ?? prev.booking?.hospitalLat,
                hospitalLng: data?.hospitalLng ?? prev.booking?.hospitalLng,
              },
            }
          : prev
      );
    };

    socket.on("ambulanceLocationUpdated", handleAmbulanceUpdate);

    return () => {
      socket.off("ambulanceLocationUpdated", handleAmbulanceUpdate);
    };
  }, []);

  const pickupPosition = useMemo(() => {
    if (
      bookingData?.booking?.pickupLat == null ||
      bookingData?.booking?.pickupLng == null
    ) {
      return null;
    }

    return [bookingData.booking.pickupLat, bookingData.booking.pickupLng];
  }, [bookingData]);

  const hospitalPosition = useMemo(() => {
    if (
      bookingData?.booking?.hospitalLat == null ||
      bookingData?.booking?.hospitalLng == null
    ) {
      return null;
    }

    return [bookingData.booking.hospitalLat, bookingData.booking.hospitalLng];
  }, [bookingData]);

  const activeTargetPosition = useMemo(() => {
    return routeTarget === "hospital" ? hospitalPosition : pickupPosition;
  }, [routeTarget, hospitalPosition, pickupPosition]);

  const mapCenter = useMemo(() => {
    if (ambulancePosition) return ambulancePosition;
    if (activeTargetPosition) return activeTargetPosition;
    if (pickupPosition) return pickupPosition;
    return [19.076, 72.8777];
  }, [ambulancePosition, activeTargetPosition, pickupPosition]);

  if (loading) {
    return (
      <div className="mobile-wrapper">
        <div className="phone-screen">
          <Navbar />
          <div className="page-with-navbar tracking-page">
            <div className="info-card">
              <h3>Loading SOS Tracking...</h3>
              <p>Please wait while we load your emergency booking details.</p>
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
            <h2>Live SOS Tracking</h2>
            <p>Track your assigned ambulance in real time.</p>
          </div>

          {bookingData ? (
            <>
              <div className="tracking-status-card">
                <h3>Emergency Status</h3>
                <p><strong>Current Status:</strong> {status}</p>
                <p><strong>ETA:</strong> {eta !== null ? `${eta} mins` : "Calculating..."}</p>
                <p>
                  <strong>Road Distance:</strong>{" "}
                  {roadDistance !== null ? `${roadDistance} km` : "Updating..."}
                </p>
                <p>
                  <strong>Booking Type:</strong>{" "}
                  {bookingData?.booking?.bookingType?.toUpperCase() || "SOS"}
                </p>
                <p>
                  <strong>Tracking Towards:</strong>{" "}
                  {routeTarget === "hospital" ? "Hospital" : "Pickup"}
                </p>
              </div>

              {(pickupPosition || hospitalPosition || ambulancePosition) && (
                <div className="map-container">
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    style={{ height: "280px", width: "100%", borderRadius: "18px" }}
                  >
                    <TileLayer
                      attribution="&copy; OpenStreetMap contributors"
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {pickupPosition && (
                      <Marker position={pickupPosition} icon={userIcon}>
                        <Popup>Your Pickup Location</Popup>
                      </Marker>
                    )}

                    {hospitalPosition && (
                      <Marker position={hospitalPosition} icon={hospitalIcon}>
                        <Popup>Hospital</Popup>
                      </Marker>
                    )}

                    {ambulancePosition && (
                      <Marker position={ambulancePosition} icon={ambulanceIcon}>
                        <Popup>
                          Driver / Ambulance Location
                          <br />
                          {bookingData?.booking?.driverName || "Driver"}
                        </Popup>
                      </Marker>
                    )}

                    {routePoints.length > 0 && (
                      <Polyline positions={routePoints} />
                    )}
                  </MapContainer>
                </div>
              )}

              <div className="info-card">
                <h3>Ambulance Details</h3>
                <p>
                  <strong>Ambulance No:</strong>{" "}
                  {bookingData?.booking?.ambulanceNumber || "Not assigned yet"}
                </p>
                <p>
                  <strong>Driver:</strong>{" "}
                  {bookingData?.booking?.driverName || "Not assigned yet"}
                </p>
                <p>
                  <strong>Driver Phone:</strong>{" "}
                  {bookingData?.booking?.driverPhone || "Not available"}
                </p>
              </div>

              <div className="info-card">
                <h3>Emergency Details</h3>
                <p>
                  <strong>Pickup:</strong>{" "}
                  {bookingData?.booking?.pickup || "Not available"}
                </p>
                <p>
                  <strong>Hospital:</strong>{" "}
                  {bookingData?.booking?.hospital || "Not available"}
                </p>
                <p>
                  <strong>Booking ID:</strong>{" "}
                  {bookingData?.booking?._id || "Not available"}
                </p>
              </div>
            </>
          ) : (
            <div className="info-card">
              <h3>No SOS Booking Found</h3>
              <p>Please book an SOS ambulance first.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SOSTracking;