
const Booking = require("../models/Booking");
const Ambulance = require("../models/Ambulance");
const Driver = require("../models/Driver");

function toRad(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateEta(distanceKm) {
  const avgSpeedKmPerHour = 30;
  return Math.max(1, Math.ceil((distanceKm / avgSpeedKmPerHour) * 60));
}

exports.bookSOS = async (req, res) => {
  try {
    const {
      pickup,
      pickupLat,
      pickupLng,
      phone,
      hospital,
      hospitalLat,
      hospitalLng,
    } = req.body;

    if (pickupLat === undefined || pickupLng === undefined) {
      return res.status(400).json({
        message: "Pickup coordinates are required",
      });
    }

    const booking = await Booking.create({
      user: req.user?.id || null,
      pickup: pickup || "Emergency Pickup Location",
      hospital: hospital || "Nearest Emergency Hospital",
      phone: phone || "Not Provided",
      bookingType: "sos",
      pickupLat,
      pickupLng,
      hospitalLat: hospitalLat ?? null,
      hospitalLng: hospitalLng ?? null,
      status: "Searching Driver",
      assignedBy: null,
      routeTarget: "pickup",
    });

    const ambulances = await Ambulance.find({ status: "available" });

    if (!ambulances.length) {
      booking.status = "No Driver Found";
      await booking.save();

      return res.status(201).json({
        message: "No ambulance available right now",
        booking,
      });
    }

    let selectedAmbulance = null;
    let selectedDriver = null;
    let minDistance = Infinity;

    for (const amb of ambulances) {
      if (amb.currentLat == null || amb.currentLng == null) continue;

      const driver = await Driver.findOne({
        ambulanceId: amb._id,
        isActive: true,
        isOnline: true,
        status: "available",
      });

      if (!driver) continue;

      const distance = getDistanceKm(
        pickupLat,
        pickupLng,
        amb.currentLat,
        amb.currentLng
      );

      if (distance < minDistance) {
        minDistance = distance;
        selectedAmbulance = amb;
        selectedDriver = driver;
      }
    }

    if (!selectedAmbulance || !selectedDriver) {
      booking.status = "No Driver Found";
      await booking.save();

      return res.status(201).json({
        message: "SOS created, but no online driver available right now",
        booking,
      });
    }

    const eta = calculateEta(minDistance);

    booking.ambulanceId = selectedAmbulance._id;
    booking.ambulanceNumber = selectedAmbulance.ambulanceNumber || "";
    booking.driverId = selectedDriver._id;
    booking.driverName = selectedDriver.name || "";
    booking.driverPhone = selectedDriver.phone || "";
    booking.ambulanceLat = selectedAmbulance.currentLat ?? null;
    booking.ambulanceLng = selectedAmbulance.currentLng ?? null;
    booking.eta = eta;
    booking.distanceKm = Number(minDistance.toFixed(2));
    booking.status = "Assigned";
    booking.assignedBy = "system";
    booking.routeTarget = "pickup";

    await booking.save();

    selectedAmbulance.status = "busy";
    await selectedAmbulance.save();

    selectedDriver.status = "busy";
    selectedDriver.currentBookingId = booking._id;
    await selectedDriver.save();

    return res.status(201).json({
      message: "SOS booked successfully and nearest driver assigned",
      booking,
      ambulance: selectedAmbulance,
      driver: {
        _id: selectedDriver._id,
        name: selectedDriver.name,
        phone: selectedDriver.phone,
      },
      eta,
      distance: Number(minDistance.toFixed(2)),
    });
  } catch (error) {
    console.log("SOS booking error:", error);
    return res.status(500).json({
      message: "Failed to book SOS ambulance",
      error: error.message,
    });
  }
};

exports.getSOSBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("ambulanceId")
      .populate("driverId");

    if (!booking) {
      return res.status(404).json({
        message: "SOS booking not found",
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.log("Get SOS booking error:", error);
    return res.status(500).json({
      message: "Failed to fetch SOS booking",
      error: error.message,
    });
  }
=======
const Booking = require("../models/Booking");
const Ambulance = require("../models/Ambulance");
const Driver = require("../models/Driver");

function toRad(value) {
  return (value * Math.PI) / 180;
}

function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateEta(distanceKm) {
  const avgSpeedKmPerHour = 30;
  return Math.max(1, Math.ceil((distanceKm / avgSpeedKmPerHour) * 60));
}

exports.bookSOS = async (req, res) => {
  try {
    const {
      pickup,
      pickupLat,
      pickupLng,
      phone,
      hospital,
      hospitalLat,
      hospitalLng,
    } = req.body;

    if (pickupLat === undefined || pickupLng === undefined) {
      return res.status(400).json({
        message: "Pickup coordinates are required",
      });
    }

    const booking = await Booking.create({
      user: req.user?.id || null,
      pickup: pickup || "Emergency Pickup Location",
      hospital: hospital || "Nearest Emergency Hospital",
      phone: phone || "Not Provided",
      bookingType: "sos",
      pickupLat,
      pickupLng,
      hospitalLat: hospitalLat ?? null,
      hospitalLng: hospitalLng ?? null,
      status: "Searching Driver",
      assignedBy: null,
      routeTarget: "pickup",
    });

    const ambulances = await Ambulance.find({ status: "available" });

    if (!ambulances.length) {
      booking.status = "No Driver Found";
      await booking.save();

      return res.status(201).json({
        message: "No ambulance available right now",
        booking,
      });
    }

    let selectedAmbulance = null;
    let selectedDriver = null;
    let minDistance = Infinity;

    for (const amb of ambulances) {
      if (amb.currentLat == null || amb.currentLng == null) continue;

      const driver = await Driver.findOne({
        ambulanceId: amb._id,
        isActive: true,
        isOnline: true,
        status: "available",
      });

      if (!driver) continue;

      const distance = getDistanceKm(
        pickupLat,
        pickupLng,
        amb.currentLat,
        amb.currentLng
      );

      if (distance < minDistance) {
        minDistance = distance;
        selectedAmbulance = amb;
        selectedDriver = driver;
      }
    }

    if (!selectedAmbulance || !selectedDriver) {
      booking.status = "No Driver Found";
      await booking.save();

      return res.status(201).json({
        message: "SOS created, but no online driver available right now",
        booking,
      });
    }

    const eta = calculateEta(minDistance);

    booking.ambulanceId = selectedAmbulance._id;
    booking.ambulanceNumber = selectedAmbulance.ambulanceNumber || "";
    booking.driverId = selectedDriver._id;
    booking.driverName = selectedDriver.name || "";
    booking.driverPhone = selectedDriver.phone || "";
    booking.ambulanceLat = selectedAmbulance.currentLat ?? null;
    booking.ambulanceLng = selectedAmbulance.currentLng ?? null;
    booking.eta = eta;
    booking.distanceKm = Number(minDistance.toFixed(2));
    booking.status = "Assigned";
    booking.assignedBy = "system";
    booking.routeTarget = "pickup";

    await booking.save();

    selectedAmbulance.status = "busy";
    await selectedAmbulance.save();

    selectedDriver.status = "busy";
    selectedDriver.currentBookingId = booking._id;
    await selectedDriver.save();

    return res.status(201).json({
      message: "SOS booked successfully and nearest driver assigned",
      booking,
      ambulance: selectedAmbulance,
      driver: {
        _id: selectedDriver._id,
        name: selectedDriver.name,
        phone: selectedDriver.phone,
      },
      eta,
      distance: Number(minDistance.toFixed(2)),
    });
  } catch (error) {
    console.log("SOS booking error:", error);
    return res.status(500).json({
      message: "Failed to book SOS ambulance",
      error: error.message,
    });
  }
};

exports.getSOSBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("ambulanceId")
      .populate("driverId");

    if (!booking) {
      return res.status(404).json({
        message: "SOS booking not found",
      });
    }

    return res.status(200).json(booking);
  } catch (error) {
    console.log("Get SOS booking error:", error);
    return res.status(500).json({
      message: "Failed to fetch SOS booking",
      error: error.message,
    });
  }
>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
};