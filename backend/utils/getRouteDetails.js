
const axios = require("axios");

async function getRouteDetails(startLat, startLng, endLat, endLng) {
  try {
    console.log("ORS INPUT:", { startLat, startLng, endLat, endLng });

    if (
      startLat == null ||
      startLng == null ||
      endLat == null ||
      endLng == null
    ) {
      return null;
    }

    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [startLng, startLat],
          [endLng, endLat],
        ],
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("ORS SUCCESS:", response?.data);

    const feature = response?.data?.features?.[0];
    const summary = feature?.properties?.summary;
    const geometry = feature?.geometry?.coordinates || [];

    if (!summary) {
      return null;
    }

    return {
      distanceKm: Number((summary.distance / 1000).toFixed(2)),
      durationMin: Math.max(1, Math.ceil(summary.duration / 60)),
      geometry,
    };
  } catch (error) {
    console.log(
      "getRouteDetails error:",
      error?.response?.data || error.message
    );
    return null;
  }
}

module.exports = getRouteDetails;