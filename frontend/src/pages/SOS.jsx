import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";

const userIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  iconSize: [32, 32],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
  iconSize: [32, 32],
});

const selectedHospitalIcon = new L.Icon({
  iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
  iconSize: [32, 32],
});

function SOS() {
  const navigate = useNavigate();

  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState("Fetching your location...");
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);

  const formatAddress = (addressObj) => {
    if (!addressObj) return "";

    const parts = [
      addressObj.road,
      addressObj.suburb,
      addressObj.neighbourhood,
      addressObj.city || addressObj.town || addressObj.village,
      addressObj.state,
      addressObj.postcode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const getReadableAddress = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`
      );
      const data = await response.json();

      if (data?.address) {
        return formatAddress(data.address) || data.display_name || "Address not found";
      }

      return data?.display_name || "Address not found";
    } catch (error) {
      console.log("Reverse geocode error:", error);
      return "Address not found";
    }
  };

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearestHospitals = async (userLat, userLng) => {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:50000,${userLat},${userLng});
          way["amenity"="hospital"](around:50000,${userLat},${userLng});
          relation["amenity"="hospital"](around:50000,${userLat},${userLng});
        );
        out center tags;
      `;

      const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

      const res = await fetch(url);
      const data = await res.json();

      const rawHospitals = data.elements
        .map((item, index) => {
          const lat = item.lat ?? item.center?.lat;
          const lng = item.lon ?? item.center?.lon;
          const dist = getDistanceKm(userLat, userLng, lat, lng);

          return {
            name: item.tags?.name || `Hospital ${index + 1}`,
            lat,
            lng,
            distanceKm: dist,
            rawAddress:
              [
                item.tags?.["addr:street"],
                item.tags?.["addr:suburb"],
                item.tags?.["addr:city"],
                item.tags?.["addr:state"],
              ]
                .filter(Boolean)
                .join(", ") || "",
          };
        })
        .filter((item) => item.lat != null && item.lng != null);

      // Sort exact nearest first
      rawHospitals.sort((a, b) => a.distanceKm - b.distanceKm);

      const uniqueHospitals = [
        ...new Map(rawHospitals.map((h) => [h.name, h])).values(),
      ].slice(0, 1);

      const hospitalsWithAddress = await Promise.all(
        uniqueHospitals.map(async (item) => {
          let address = item.rawAddress;

          if (!address) {
            address = await getReadableAddress(item.lat, item.lng);
          }

          return {
            ...item,
            address,
          };
        })
      );

      setNearbyHospitals(hospitalsWithAddress);

      if (hospitalsWithAddress.length > 0) {
        setSelectedHospital(hospitalsWithAddress[0]);
      } else {
        setSelectedHospital(null);
      }
    } catch (error) {
      console.log("Hospital fetch error:", error);
      setNearbyHospitals([]);
      setSelectedHospital(null);
    }
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setLocation(currentLocation);

          try {
            const address = await getReadableAddress(
              currentLocation.lat,
              currentLocation.lng
            );
            setLocationText(address || "Current Location");
          } catch (error) {
            console.log(error);
            setLocationText("Current Location");
          }

          await getNearestHospitals(currentLocation.lat, currentLocation.lng);
          setLoading(false);
        },
        () => {
          setLocationText("Unable to fetch location");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationText("Geolocation not supported");
      setLoading(false);
    }
  }, []);

  const [routePath, setRoutePath] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    if (location && selectedHospital) {
      const getRoute = async () => {
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${location.lng},${location.lat};${selectedHospital.lng},${selectedHospital.lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            setRoutePath(coords);
            setRouteDetails({
              distanceKm: (route.distance / 1000).toFixed(2),
              durationMin: Math.max(1, Math.ceil(route.duration / 60))
            });
          }
        } catch (error) {
          console.error("OSRM Route Error:", error);
        }
      };
      getRoute();
    }
  }, [location, selectedHospital]);

  const handleConfirmSOS = async () => {
    if (!location) {
      alert("Location not found");
      return;
    }

    try {
      setBookingLoading(true);

      const token = localStorage.getItem("userToken");
      const user = JSON.parse(localStorage.getItem("userData") || "{}");

      const res = await axios.post(
        "/api/sos/book",
        {
          pickup: locationText,
          pickupLat: location.lat,
          pickupLng: location.lng,
          phone: user.phone || "Not Provided",
          hospital: selectedHospital?.name || "Nearest Emergency Hospital",
          hospitalLat: selectedHospital?.lat ?? null,
          hospitalLng: selectedHospital?.lng ?? null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.setItem("sosBooking", JSON.stringify(res.data));

      if (res?.data?.booking?.status === "No Driver Found") {
        alert("SOS created, but no online driver available right now.");
        return;
      }

      alert(res?.data?.message || "SOS booked successfully");
      navigate("/sos-tracking");
    } catch (error) {
      console.log("SOS booking failed:", error);
      alert(
        error?.response?.data?.message || "SOS booking failed. Please try again."
      );
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="page-with-navbar sos-page">
          <h2 className="page-title">Emergency SOS</h2>
          <p className="page-subtitle">
            Nearest online available driver will be assigned automatically.
          </p>

          <div className="info-card">
            <h3>Your Live Location</h3>
            <p>{loading ? "Detecting..." : locationText}</p>
          </div>

          {location && (
            <div className="map-container">
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={14}
                style={{ height: "260px", width: "100%", borderRadius: "16px" }}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[location.lat, location.lng]} icon={userIcon}>
                  <Popup>
                    <strong>Your Location</strong>
                    <br />
                    {locationText}
                  </Popup>
                </Marker>

                {nearbyHospitals.map((item, index) => {
                  const isSelected =
                    selectedHospital &&
                    selectedHospital.lat === item.lat &&
                    selectedHospital.lng === item.lng;

                  return (
                    <Marker
                      key={index}
                      position={[item.lat, item.lng]}
                      icon={isSelected ? selectedHospitalIcon : hospitalIcon}
                    >
                      <Popup>
                        <strong>{item.name}</strong>
                        <br />
                        {item.address}
                      </Popup>
                    </Marker>
                  );
                })}

                {selectedHospital && routePath.length > 0 ? (
                  <Polyline
                    positions={routePath}
                    pathOptions={{ 
                      color: "#2563eb",
                      weight: 7,
                      opacity: 1,
                      lineCap: "round",
                      lineJoin: "round"
                    }}
                  />
                ) : selectedHospital && (
                  <Polyline
                    positions={[
                      [location.lat, location.lng],
                      [selectedHospital.lat, selectedHospital.lng],
                    ]}
                    pathOptions={{ color: "#2563eb", weight: 4, opacity: 0.5, dashArray: '5, 10' }}
                  />
                )}
              </MapContainer>
            </div>
          )}

          {selectedHospital ? (
            <div className="info-card" style={{ background: "#e8f5e9", borderColor: "#4caf50", borderWidth: "2px", borderStyle: "solid" }}>
              <h3 style={{ color: "#2e7d32" }}>Nearest Hospital Selected</h3>
              <p><strong>Name:</strong> {selectedHospital.name}</p>
              <p><strong>Distance:</strong> {routeDetails ? `${routeDetails.distanceKm} km (Road)` : selectedHospital.distanceKm ? `${selectedHospital.distanceKm.toFixed(2)} km (Aerial)` : "Unknown"}</p>
              {routeDetails && <p><strong>ETA:</strong> {routeDetails.durationMin} mins</p>}
              <p><strong>Address:</strong> {selectedHospital.address}</p>
            </div>
          ) : (
            <div className="info-card" style={{ background: "#fff3e0", borderColor: "#ff9800", borderWidth: "2px", borderStyle: "solid" }}>
              <h3 style={{ color: "#e65100" }}>Finding Hospital...</h3>
              <p>We are mapping the nearest emergency center for you.</p>
            </div>
          )}

          <button className="confirm-sos-btn" onClick={handleConfirmSOS}>
            {bookingLoading ? "Booking Emergency..." : "Confirm SOS Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SOS;
