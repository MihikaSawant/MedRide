import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
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

function BookAmbulance() {
  const navigate = useNavigate();

  const [pickup, setPickup] = useState("");
  const [hospital, setHospital] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [coords, setCoords] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [selectedHospitalCoords, setSelectedHospitalCoords] = useState(null);

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
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
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
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") === -1) {
        throw new Error(`Expected JSON but got ${contentType}`);
      }

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
        if (!hospital) {
          const firstHospital = hospitalsWithAddress[0];
          setHospital(firstHospital.name);
          setSelectedHospitalCoords([firstHospital.lat, firstHospital.lng]);
        }
      } else {
        alert("No nearby hospitals found");
      }
    } catch (error) {
      console.log("Hospital fetch error:", error);
      setNearbyHospitals([]);
      alert("Failed to fetch nearby hospitals");
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setCoords([lat, lng]);

        try {
          const properAddress = await getReadableAddress(lat, lng);
          setPickup(properAddress);
          await getNearestHospitals(lat, lng);
        } catch (error) {
          console.log("Location error:", error);
          setPickup("Current Location");
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.log("Geolocation error:", error);
        setLocationLoading(false);
        alert("Location access denied");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleHospitalSelect = (selectedName) => {
    setHospital(selectedName);

    const selected = nearbyHospitals.find((h) => h.name === selectedName);

    if (selected) {
      setSelectedHospitalCoords([selected.lat, selected.lng]);
    }
  };

  const handleHospitalInputChange = (value) => {
    setHospital(value);

    const matchedHospital = nearbyHospitals.find(
      (h) => h.name.trim().toLowerCase() === value.trim().toLowerCase()
    );

    if (matchedHospital) {
      setSelectedHospitalCoords([matchedHospital.lat, matchedHospital.lng]);
    } else {
      setSelectedHospitalCoords(null);
    }
  };

  const searchCustomHospital = async () => {
    if (!hospital.trim()) {
      alert("Please enter a hospital name to search.");
      return;
    }

    try {
      setLocationLoading(true);
      const query = encodeURIComponent(hospital);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await res.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        setSelectedHospitalCoords([lat, lng]);

        const customHospital = {
          name: hospital,
          lat,
          lng,
          address: result.display_name,
        };

        setNearbyHospitals((prev) => {
          const exists = prev.find((h) => h.name === hospital);
          if (exists) return prev;
          return [customHospital, ...prev];
        });

        alert("Hospital found and added to the map!");
      } else {
        alert("Hospital not found. Please try a different name or add the city.");
        setSelectedHospitalCoords(null);
      }
    } catch (error) {
      console.log("Search custom hospital error:", error);
      alert("Failed to search hospital location.");
    } finally {
      setLocationLoading(false);
    }
  };

  const bookAmbulance = async () => {
    if (!pickup || !hospital || !phone) {
      alert("Please fill all required fields");
      return;
    }

    const phoneDigits = String(phone).replace(/\D/g, '');
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      alert("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    const token = localStorage.getItem("userToken");

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "/api/bookings",
        {
          pickup,
          hospital,
          phone,
          pickupLat: coords ? coords[0] : null,
          pickupLng: coords ? coords[1] : null,
          hospitalLat: selectedHospitalCoords ? selectedHospitalCoords[0] : null,
          hospitalLng: selectedHospitalCoords ? selectedHospitalCoords[1] : null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const createdBooking = res?.data?.booking;

      if (createdBooking) {
        localStorage.setItem("selectedBooking", JSON.stringify(createdBooking));
      }

      alert(
        res?.data?.message ||
          "Booking created successfully. Admin will assign driver soon."
      );

      setPickup("");
      setHospital("");
      setPhone("");
      setCoords(null);
      setNearbyHospitals([]);
      setSelectedHospitalCoords(null);

      navigate("/my-bookings");
    } catch (error) {
      console.log("Booking error:", error);

      if (error?.response?.status === 401) {
        alert("Unauthorized request. Please login again.");
        return;
      }

      alert(error?.response?.data?.message || "Booking Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />

        <div className="booking-page">
          <div className="booking-header-card">
            <h2>Book Ambulance</h2>
            <p>Normal ambulance booking. Admin will assign a driver.</p>
          </div>

          <div className="booking-form-card">
            <div className="form-group">
              <label>Pickup Location</label>
              <input
                type="text"
                placeholder="Enter pickup location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>

            <button className="location-btn" onClick={getLocation}>
              {locationLoading ? "Getting Location..." : "Use My Live Location"}
            </button>

            {(coords || selectedHospitalCoords) && (
              <div className="map-container">
                <MapContainer
                  center={coords || selectedHospitalCoords}
                  zoom={14}
                  style={{ height: "250px", width: "100%", borderRadius: "15px" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {coords && (
                    <Marker position={coords} icon={userIcon}>
                      <Popup>
                        <strong>Your Location</strong>
                        <br />
                        {pickup}
                      </Popup>
                    </Marker>
                  )}

                  {nearbyHospitals.map((item, index) => (
                    <Marker
                      key={index}
                      position={[item.lat, item.lng]}
                      icon={
                        selectedHospitalCoords &&
                        selectedHospitalCoords[0] === item.lat &&
                        selectedHospitalCoords[1] === item.lng
                          ? selectedHospitalIcon
                          : hospitalIcon
                      }
                    >
                      <Popup>
                        <strong>{item.name}</strong>
                        <br />
                        {item.address}
                      </Popup>
                    </Marker>
                  ))}

                  {coords && selectedHospitalCoords && (
                    <Polyline positions={[coords, selectedHospitalCoords]} />
                  )}
                </MapContainer>
              </div>
            )}

            {nearbyHospitals.length > 0 && (
              <div className="nearby-hospital-box">
                <label>Nearest Hospitals</label>

                <select
                  className="hospital-select"
                  value={nearbyHospitals.some(h => h.name === hospital) ? hospital : "custom"}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setHospital("");
                      setSelectedHospitalCoords(null);
                    } else {
                      handleHospitalSelect(e.target.value);
                    }
                  }}
                >
                  <option value="custom">-- Custom Hospital (Type Below) --</option>
                  {nearbyHospitals.map((item, index) => (
                    <option key={index} value={item.name}>
                      {item.name} - {item.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Hospital Name</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="Enter hospital name"
                  value={hospital}
                  onChange={(e) => handleHospitalInputChange(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button 
                  type="button" 
                  onClick={searchCustomHospital}
                  disabled={locationLoading}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  {locationLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {selectedHospitalCoords && (
              <div className="info-card" style={{ marginTop: "12px" }}>
                <h3>Selected Hospital Coordinates</h3>
                <p><strong>Latitude:</strong> {selectedHospitalCoords[0]}</p>
                <p><strong>Longitude:</strong> {selectedHospitalCoords[1]}</p>
              </div>
            )}

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button className="confirm-booking-btn" onClick={bookAmbulance}>
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookAmbulance;