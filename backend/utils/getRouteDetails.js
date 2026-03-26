
const axios = require("axios");

async function getRouteDetails(startLat, startLng, endLat, endLng) {
  try {
    if (
      startLat == null ||
      startLng == null ||
      endLat == null ||
      endLng == null
    ) {
      return null;
    }

    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;
    const response = await axios.get(url);

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distanceKm: Number((route.distance / 1000).toFixed(2)),
        durationMin: Math.max(1, Math.ceil(route.duration / 60)),
        geometry: route.geometry.coordinates,
      };
    }
    
    return null;
  } catch (error) {
    console.log("getRouteDetails (OSRM) error:", error?.message);
    return null;
  }
}

module.exports = getRouteDetails;
module.exports = getRouteDetails;