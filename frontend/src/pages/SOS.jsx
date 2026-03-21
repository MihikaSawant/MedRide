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

  const getNearestHospitals = async (lat, lng) => {
    try {
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:10000,${lat},${lng});
          way["amenity"="hospital"](around:10000,${lat},${lng});
          relation["amenity"="hospital"](around:10000,${lat},${lng});
        );
        out center tags;
      `;

      const url =
        "https://overpass-api.de/api/interpreter?data=" +
        encodeURIComponent(query);

      const res = await fetch(url);
      const data = await res.json();

      const rawHospitals = data.elements
        .map((item, index) => ({
          name: item.tags?.name || `Hospital ${index + 1}`,
          lat: item.lat ?? item.center?.lat,
          lng: item.lon ?? item.center?.lon,
          rawAddress:
            [
              item.tags?.["addr:street"],
              item.tags?.["addr:suburb"],
              item.tags?.["addr:city"],
              item.tags?.["addr:state"],
            ]
              .filter(Boolean)
              .join(", ") || "",
        }))
        .filter((item) => item.lat != null && item.lng != null);

      const uniqueHospitals = [
        ...new Map(rawHospitals.map((h) => [h.name, h])).values(),
      ].slice(0, 5);

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

                {selectedHospital && (
                  <Polyline
                    positions={[
                      [location.lat, location.lng],
                      [selectedHospital.lat, selectedHospital.lng],
                    ]}
                  />
                )}
              </MapContainer>
            </div>
          )}

          {nearbyHospitals.length > 0 && (
            <div className="nearby-hospital-box">
              <label>Nearest Emergency Hospital</label>

              <select
                className="hospital-select"
                value={selectedHospital?.name || ""}
                onChange={(e) => {
                  const selected = nearbyHospitals.find(
                    (h) => h.name === e.target.value
                  );
                  setSelectedHospital(selected || null);
                }}
              >
                {nearbyHospitals.map((item, index) => (
                  <option key={index} value={item.name}>
                    {item.name} - {item.address}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedHospital && (
            <div className="info-card">
              <h3>Selected Hospital</h3>
              <p><strong>Name:</strong> {selectedHospital.name}</p>
              <p><strong>Address:</strong> {selectedHospital.address}</p>
              <p><strong>Latitude:</strong> {selectedHospital.lat}</p>
              <p><strong>Longitude:</strong> {selectedHospital.lng}</p>
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