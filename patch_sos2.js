const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/SOS.jsx', 'utf8');

const oldCode = `  const [routePath, setRoutePath] = useState([]);

  useEffect(() => {
    if (location && selectedHospital) {
      const getRoute = async () => {
        try {
          const url = \`https://router.project-osrm.org/route/v1/driving/\${location.lng},\${location.lat};\${selectedHospital.lng},\${selectedHospital.lat}?overview=full&geometries=geojson\`;
          const res = await fetch(url);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // OSRM returns coordinates array as [lng, lat]
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRoutePath(coords);
          }
        } catch (error) {
          console.error("OSRM Route Error:", error);
        }
      };
      getRoute();
    }
  }, [location, selectedHospital]);`;

const newCode = `  const [routePath, setRoutePath] = useState([]);
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    if (location && selectedHospital) {
      const getRoute = async () => {
        try {
          const url = \`https://router.project-osrm.org/route/v1/driving/\${location.lng},\${location.lat};\${selectedHospital.lng},\${selectedHospital.lat}?overview=full&geometries=geojson\`;
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
  }, [location, selectedHospital]);`;

content = content.replace(oldCode, newCode);

const oldUI = `          {selectedHospital ? (
            <div className="info-card" style={{ background: "#e8f5e9", borderColor: "#4caf50", borderWidth: "2px", borderStyle: "solid" }}>
              <h3 style={{ color: "#2e7d32" }}>Nearest Hospital Selected</h3>
              <p><strong>Name:</strong> {selectedHospital.name}</p>
              <p><strong>Distance:</strong> {selectedHospital.distanceKm ? \`\${selectedHospital.distanceKm.toFixed(2)} km away\` : "Unknown"}</p>
              <p><strong>Address:</strong> {selectedHospital.address}</p>
            </div>`;

const newUI = `          {selectedHospital ? (
            <div className="info-card" style={{ background: "#e8f5e9", borderColor: "#4caf50", borderWidth: "2px", borderStyle: "solid" }}>
              <h3 style={{ color: "#2e7d32" }}>Nearest Hospital Selected</h3>
              <p><strong>Name:</strong> {selectedHospital.name}</p>
              <p><strong>Distance:</strong> {routeDetails ? \`\${routeDetails.distanceKm} km (Road)\` : selectedHospital.distanceKm ? \`\${selectedHospital.distanceKm.toFixed(2)} km (Aerial)\` : "Unknown"}</p>
              {routeDetails && <p><strong>ETA:</strong> {routeDetails.durationMin} mins</p>}
              <p><strong>Address:</strong> {selectedHospital.address}</p>
            </div>`;

content = content.replace(oldUI, newUI);
fs.writeFileSync('frontend/src/pages/SOS.jsx', content);
