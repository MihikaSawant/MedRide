
const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");
const Booking = require("../models/Booking");
const Ambulance = require("../models/Ambulance");
const getRouteDetails = require("../utils/getRouteDetails");

const isAuthorizedDriver = (req, driverId) => {
  return (
    req.user &&
    req.user.role === "driver" &&
    req.user.driverId &&
    req.user.driverId.toString() === driverId.toString()
  );
};

const getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
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
};

exports.createDriver = async (req, res) => {
  try {
    const { name, phone, password, ambulanceId } = req.body;

    if (!name || !phone || !password || !ambulanceId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver phone already exists" });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const driver = await Driver.create({
      name,
      phone,
      password,
      ambulanceId,
      isActive: true,
      isOnline: false,
      status: "offline",
      currentBookingId: null,
      currentLocation: {
        lat: ambulance.currentLat ?? null,
        lng: ambulance.currentLng ?? null,
      },
    });

    return res.status(201).json({
      message: "Driver registered successfully",
      driver,
    });
  } catch (error) {
    console.log("Create driver error:", error);
    return res.status(500).json({ message: "Failed to create driver" });
  }
};

exports.driverLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const driver = await Driver.findOne({ phone }).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (driver.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        driverId: driver._id,
        role: "driver",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Driver login successful",
      token,
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        photo: driver.photo || "",
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        status: driver.status,
        currentBookingId: driver.currentBookingId,
        currentLocation: driver.currentLocation,
        ambulance: driver.ambulanceId || null,
        role: "driver",
      },
    });
  } catch (error) {
    console.log("Driver login error:", error);
    return res.status(500).json({ message: "Driver login failed" });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("ambulanceId")
      .sort({ createdAt: -1 });

    return res.status(200).json(drivers);
  } catch (error) {
    console.log("Get all drivers error:", error);
    return res.status(500).json({ message: "Failed to fetch drivers" });
  }
};

exports.getLoggedInDriverDashboard = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    let assignedBooking = null;

    if (driver.currentBookingId) {
      assignedBooking = await Booking.findById(driver.currentBookingId)
        .populate("user", "name email phone")
        .populate("driverId")
        .populate("ambulanceId");
    }

    if (!assignedBooking) {
      assignedBooking = await Booking.findOne({
        driverId: driver._id,
        status: {
          $in: [
            "Assigned",
            "On The Way",
            "Reached Pickup",
            "Patient Picked",
            "Reached Hospital",
          ],
        },
      })
        .populate("user", "name email phone")
        .populate("driverId")
        .populate("ambulanceId")
        .sort({ createdAt: -1 });

      if (assignedBooking) {
        driver.currentBookingId = assignedBooking._id;
        await driver.save();
      }
    }

    return res.status(200).json({
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        photo: driver.photo || "",
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        status: driver.status,
        currentBookingId: driver.currentBookingId,
        currentLocation: driver.currentLocation,
        role: "driver",
      },
      ambulance: driver.ambulanceId || null,
      assignedBooking: assignedBooking || null,
    });
  } catch (error) {
    console.log("Logged-in driver dashboard error:", error);
    return res.status(500).json({ message: "Failed to load driver dashboard" });
  }
};

exports.toggleDriverAvailability = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isOnline } = req.body;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isOnline = Boolean(isOnline);

    if (!driver.isOnline) {
      driver.status = "offline";
    } else if (driver.currentBookingId) {
      driver.status = "busy";
    } else {
      driver.status = "available";
    }

    await driver.save();

    if (driver.ambulanceId) {
      driver.ambulanceId.status = driver.isOnline
        ? driver.currentBookingId
          ? "busy"
          : "available"
        : "offline";
      await driver.ambulanceId.save();
    }

    return res.status(200).json({
      message: `Driver is now ${driver.isOnline ? "online" : "offline"}`,
      driver,
    });
  } catch (error) {
    console.log("Toggle driver availability error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update driver availability",
    });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    let { lat, lng } = req.body;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    lat = Number(lat);
    lng = Number(lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        message: "Latitude and longitude must be valid numbers",
      });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.currentLocation = { lat, lng };
    await driver.save();

    if (driver.ambulanceId) {
      driver.ambulanceId.currentLat = lat;
      driver.ambulanceId.currentLng = lng;
      await driver.ambulanceId.save();
    }

    let updatedBooking = null;

    if (driver.currentBookingId) {
      const booking = await Booking.findById(driver.currentBookingId);

      if (booking) {
        booking.ambulanceLat = lat;
        booking.ambulanceLng = lng;

        const pickupDistance =
          booking.pickupLat != null && booking.pickupLng != null
            ? getDistanceInKm(lat, lng, Number(booking.pickupLat), Number(booking.pickupLng))
            : null;

        const hospitalDistance =
          booking.hospitalLat != null && booking.hospitalLng != null
            ? getDistanceInKm(lat, lng, Number(booking.hospitalLat), Number(booking.hospitalLng))
            : null;

        let targetLat = booking.pickupLat;
        let targetLng = booking.pickupLng;
        let routeTarget = "pickup";
        let liveStatus = booking.status;

        if (booking.status === "On The Way" && pickupDistance !== null && pickupDistance <= 0.08) {
          liveStatus = "Reached Pickup";
          routeTarget = "hospital";
          targetLat = booking.hospitalLat;
          targetLng = booking.hospitalLng;
        } else if (
          ["Reached Pickup", "Patient Picked", "Reached Hospital", "Completed"].includes(
            booking.status
          )
        ) {
          routeTarget = "hospital";
          targetLat = booking.hospitalLat;
          targetLng = booking.hospitalLng;

          if (booking.status === "Reached Pickup") {
            liveStatus = "Patient Picked";
          }

          if (hospitalDistance !== null && hospitalDistance <= 0.08) {
            liveStatus = "Reached Hospital";
          }
        }

        let routeData = null;
        let distanceKm = booking.distanceKm ?? null;
        let eta = booking.eta ?? null;
        let routeGeometry = Array.isArray(booking.routeGeometry)
          ? booking.routeGeometry
          : [];

        if (
          targetLat != null &&
          targetLng != null &&
          process.env.ORS_API_KEY
        ) {
          routeData = await getRouteDetails(
            Number(lat),
            Number(lng),
            Number(targetLat),
            Number(targetLng)
          );
        }

        if (routeData) {
          distanceKm = Number(routeData.distanceKm);
          eta = Number(routeData.durationMin);
          routeGeometry = Array.isArray(routeData.geometry)
            ? routeData.geometry
            : [];
        }

        booking.status = liveStatus;
        booking.eta = eta;
        booking.distanceKm = distanceKm;
        booking.routeTarget = routeTarget;
        booking.routeGeometry = routeGeometry;

        await booking.save();
        updatedBooking = booking;

        const io = req.app.get("io");
        if (io) {
          io.to(`booking_${booking._id}`).emit("ambulanceLocationUpdated", {
            bookingId: booking._id.toString(),
            lat,
            lng,
            eta,
            distanceKm,
            routeGeometry,
            status: booking.status,
            routeTarget,
            pickupLat: booking.pickupLat,
            pickupLng: booking.pickupLng,
            hospitalLat: booking.hospitalLat,
            hospitalLng: booking.hospitalLng,
            driverName: booking.driverName,
            driverPhone: booking.driverPhone,
            ambulanceNumber: booking.ambulanceNumber,
          });
        }
      }
    }

    return res.status(200).json({
      message: "Driver location updated successfully",
      currentLocation: driver.currentLocation,
      booking: updatedBooking,
    });
  } catch (error) {
    console.log("Update driver location error:", error);
    return res.status(500).json({
      message: "Failed to update driver location",
      error: error.message,
    });
  }
};

exports.startRide = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!req.user || req.user.role !== "driver" || !req.user.driverId) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.driverId || booking.driverId.toString() !== req.user.driverId.toString()) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    booking.status = "On The Way";
    booking.routeTarget = "pickup";
    await booking.save();

    return res.status(200).json({
      message: "Ride started successfully",
      booking,
    });
  } catch (error) {
    console.log("Start ride error:", error);
    return res.status(500).json({ message: "Failed to start ride" });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!req.user || req.user.role !== "driver" || !req.user.driverId) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.driverId || booking.driverId.toString() !== req.user.driverId.toString()) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    const driver = await Driver.findById(booking.driverId).populate("ambulanceId");

    booking.status = "Completed";
    booking.routeGeometry = [];
    booking.distanceKm = 0;
    booking.eta = 0;
    await booking.save();

    if (driver) {
      driver.currentBookingId = null;
      driver.status = driver.isOnline ? "available" : "offline";
      await driver.save();

      if (driver.ambulanceId) {
        driver.ambulanceId.status = driver.isOnline ? "available" : "offline";
        await driver.ambulanceId.save();
      }
    }

    return res.status(200).json({
      message: "Ride completed successfully",
      booking,
    });
  } catch (error) {
    console.log("Complete ride error:", error);
    return res.status(500).json({ message: "Failed to complete ride" });
  }
};

exports.updateDriverProfile = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { name, phone, photo, status } = req.body;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.name = name || driver.name;
    driver.phone = phone || driver.phone;
    driver.status = status || driver.status;

    if (photo !== undefined) {
      driver.photo = photo;
    }

    await driver.save();

    return res.status(200).json({
      message: "Driver profile updated successfully",
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        photo: driver.photo || "",
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        status: driver.status,
        currentBookingId: driver.currentBookingId,
        currentLocation: driver.currentLocation,
        ambulance: driver.ambulanceId || null,
        role: "driver",
      },
    });
  } catch (error) {
    console.log("Update driver profile error:", error);
    return res.status(500).json({ message: "Failed to update driver profile" });
  }

const jwt = require("jsonwebtoken");
const Driver = require("../models/Driver");
const Booking = require("../models/Booking");
const Ambulance = require("../models/Ambulance");
const getRouteDetails = require("../utils/getRouteDetails");

const isAuthorizedDriver = (req, driverId) => {
  return (
    req.user &&
    req.user.role === "driver" &&
    req.user.driverId &&
    req.user.driverId.toString() === driverId.toString()
  );
};

const getDistanceInKm = (lat1, lng1, lat2, lng2) => {
  const toRad = (value) => (value * Math.PI) / 180;
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
};

exports.createDriver = async (req, res) => {
  try {
    const { name, phone, password, ambulanceId } = req.body;

    if (!name || !phone || !password || !ambulanceId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingDriver = await Driver.findOne({ phone });
    if (existingDriver) {
      return res.status(400).json({ message: "Driver phone already exists" });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const driver = await Driver.create({
      name,
      phone,
      password,
      ambulanceId,
      isActive: true,
      isOnline: false,
      status: "offline",
      currentBookingId: null,
      currentLocation: {
        lat: ambulance.currentLat ?? null,
        lng: ambulance.currentLng ?? null,
      },
    });

    return res.status(201).json({
      message: "Driver registered successfully",
      driver,
    });
  } catch (error) {
    console.log("Create driver error:", error);
    return res.status(500).json({ message: "Failed to create driver" });
  }
};

exports.driverLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const driver = await Driver.findOne({ phone }).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (driver.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        driverId: driver._id,
        role: "driver",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Driver login successful",
      token,
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        photo: driver.photo || "",
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        status: driver.status,
        currentBookingId: driver.currentBookingId,
        currentLocation: driver.currentLocation,
        ambulance: driver.ambulanceId || null,
        role: "driver",
      },
    });
  } catch (error) {
    console.log("Driver login error:", error);
    return res.status(500).json({ message: "Driver login failed" });
  }
};

exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("ambulanceId")
      .sort({ createdAt: -1 });

    return res.status(200).json(drivers);
  } catch (error) {
    console.log("Get all drivers error:", error);
    return res.status(500).json({ message: "Failed to fetch drivers" });
  }
};

exports.getLoggedInDriverDashboard = async (req, res) => {
  try {
    const { driverId } = req.params;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    let assignedBooking = null;

    if (driver.currentBookingId) {
      assignedBooking = await Booking.findById(driver.currentBookingId)
        .populate("user", "name email phone")
        .populate("driverId")
        .populate("ambulanceId");
    }

    if (!assignedBooking) {
      assignedBooking = await Booking.findOne({
        driverId: driver._id,
        status: {
          $in: [
            "Assigned",
            "On The Way",
            "Reached Pickup",
            "Patient Picked",
            "Reached Hospital",
          ],
        },
      })
        .populate("user", "name email phone")
        .populate("driverId")
        .populate("ambulanceId")
        .sort({ createdAt: -1 });

      if (assignedBooking) {
        driver.currentBookingId = assignedBooking._id;
        await driver.save();
      }
    }

    return res.status(200).json({
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        photo: driver.photo || "",
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        status: driver.status,
        currentBookingId: driver.currentBookingId,
        currentLocation: driver.currentLocation,
        role: "driver",
      },
      ambulance: driver.ambulanceId || null,
      assignedBooking: assignedBooking || null,
    });
  } catch (error) {
    console.log("Logged-in driver dashboard error:", error);
    return res.status(500).json({ message: "Failed to load driver dashboard" });
  }
};

exports.toggleDriverAvailability = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { isOnline } = req.body;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.isOnline = Boolean(isOnline);

    if (!driver.isOnline) {
      driver.status = "offline";
    } else if (driver.currentBookingId) {
      driver.status = "busy";
    } else {
      driver.status = "available";
    }

    await driver.save();

    if (driver.ambulanceId) {
      driver.ambulanceId.status = driver.isOnline
        ? driver.currentBookingId
          ? "busy"
          : "available"
        : "offline";
      await driver.ambulanceId.save();
    }

    return res.status(200).json({
      message: `Driver is now ${driver.isOnline ? "online" : "offline"}`,
      driver,
    });
  } catch (error) {
    console.log("Toggle driver availability error:", error);
    return res.status(500).json({
      message: error.message || "Failed to update driver availability",
    });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { driverId } = req.params;
    let { lat, lng } = req.body;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    if (lat === undefined || lng === undefined || lat === null || lng === null) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    lat = Number(lat);
    lng = Number(lng);

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({
        message: "Latitude and longitude must be valid numbers",
      });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.currentLocation = { lat, lng };
    await driver.save();

    if (driver.ambulanceId) {
      driver.ambulanceId.currentLat = lat;
      driver.ambulanceId.currentLng = lng;
      await driver.ambulanceId.save();
    }

    let updatedBooking = null;

    if (driver.currentBookingId) {
      const booking = await Booking.findById(driver.currentBookingId);

      if (booking) {
        booking.ambulanceLat = lat;
        booking.ambulanceLng = lng;

        const pickupDistance =
          booking.pickupLat != null && booking.pickupLng != null
            ? getDistanceInKm(lat, lng, Number(booking.pickupLat), Number(booking.pickupLng))
            : null;

        const hospitalDistance =
          booking.hospitalLat != null && booking.hospitalLng != null
            ? getDistanceInKm(lat, lng, Number(booking.hospitalLat), Number(booking.hospitalLng))
            : null;

        let targetLat = booking.pickupLat;
        let targetLng = booking.pickupLng;
        let routeTarget = "pickup";
        let liveStatus = booking.status;

        if (booking.status === "On The Way" && pickupDistance !== null && pickupDistance <= 0.08) {
          liveStatus = "Reached Pickup";
          routeTarget = "hospital";
          targetLat = booking.hospitalLat;
          targetLng = booking.hospitalLng;
        } else if (
          ["Reached Pickup", "Patient Picked", "Reached Hospital", "Completed"].includes(
            booking.status
          )
        ) {
          routeTarget = "hospital";
          targetLat = booking.hospitalLat;
          targetLng = booking.hospitalLng;

          if (booking.status === "Reached Pickup") {
            liveStatus = "Patient Picked";
          }

          if (hospitalDistance !== null && hospitalDistance <= 0.08) {
            liveStatus = "Reached Hospital";
          }
        }

        let routeData = null;
        let distanceKm = booking.distanceKm ?? null;
        let eta = booking.eta ?? null;
        let routeGeometry = Array.isArray(booking.routeGeometry)
          ? booking.routeGeometry
          : [];

        if (
          targetLat != null &&
          targetLng != null &&
          process.env.ORS_API_KEY
        ) {
          routeData = await getRouteDetails(
            Number(lat),
            Number(lng),
            Number(targetLat),
            Number(targetLng)
          );
        }

        if (routeData) {
          distanceKm = Number(routeData.distanceKm);
          eta = Number(routeData.durationMin);
          routeGeometry = Array.isArray(routeData.geometry)
            ? routeData.geometry
            : [];
        }

        booking.status = liveStatus;
        booking.eta = eta;
        booking.distanceKm = distanceKm;
        booking.routeTarget = routeTarget;
        booking.routeGeometry = routeGeometry;

        await booking.save();
        updatedBooking = booking;

        const io = req.app.get("io");
        if (io) {
          io.to(`booking_${booking._id}`).emit("ambulanceLocationUpdated", {
            bookingId: booking._id.toString(),
            lat,
            lng,
            eta,
            distanceKm,
            routeGeometry,
            status: booking.status,
            routeTarget,
            pickupLat: booking.pickupLat,
            pickupLng: booking.pickupLng,
            hospitalLat: booking.hospitalLat,
            hospitalLng: booking.hospitalLng,
            driverName: booking.driverName,
            driverPhone: booking.driverPhone,
            ambulanceNumber: booking.ambulanceNumber,
          });
        }
      }
    }

    return res.status(200).json({
      message: "Driver location updated successfully",
      currentLocation: driver.currentLocation,
      booking: updatedBooking,
    });
  } catch (error) {
    console.log("Update driver location error:", error);
    return res.status(500).json({
      message: "Failed to update driver location",
      error: error.message,
    });
  }
};

exports.startRide = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!req.user || req.user.role !== "driver" || !req.user.driverId) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.driverId || booking.driverId.toString() !== req.user.driverId.toString()) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    booking.status = "On The Way";
    booking.routeTarget = "pickup";
    await booking.save();

    return res.status(200).json({
      message: "Ride started successfully",
      booking,
    });
  } catch (error) {
    console.log("Start ride error:", error);
    return res.status(500).json({ message: "Failed to start ride" });
  }
};

exports.completeRide = async (req, res) => {
  try {
    const { bookingId } = req.params;

    if (!req.user || req.user.role !== "driver" || !req.user.driverId) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!booking.driverId || booking.driverId.toString() !== req.user.driverId.toString()) {
      return res.status(403).json({ message: "This booking is not assigned to you" });
    }

    const driver = await Driver.findById(booking.driverId).populate("ambulanceId");

    booking.status = "Completed";
    booking.routeGeometry = [];
    booking.distanceKm = 0;
    booking.eta = 0;
    await booking.save();

    if (driver) {
      driver.currentBookingId = null;
      driver.status = driver.isOnline ? "available" : "offline";
      await driver.save();

      if (driver.ambulanceId) {
        driver.ambulanceId.status = driver.isOnline ? "available" : "offline";
        await driver.ambulanceId.save();
      }
    }

    return res.status(200).json({
      message: "Ride completed successfully",
      booking,
    });
  } catch (error) {
    console.log("Complete ride error:", error);
    return res.status(500).json({ message: "Failed to complete ride" });
  }
};

exports.updateDriverProfile = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { name, phone, photo, status } = req.body;

    if (!isAuthorizedDriver(req, driverId)) {
      return res.status(403).json({ message: "Unauthorized driver access" });
    }

    const driver = await Driver.findById(driverId).populate("ambulanceId");

    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    driver.name = name || driver.name;
    driver.phone = phone || driver.phone;
    driver.status = status || driver.status;

    if (photo !== undefined) {
      driver.photo = photo;
    }

    await driver.save();

    return res.status(200).json({
      message: "Driver profile updated successfully",
      driver: {
        _id: driver._id,
        name: driver.name,
        phone: driver.phone,
        photo: driver.photo || "",
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        status: driver.status,
        currentBookingId: driver.currentBookingId,
        currentLocation: driver.currentLocation,
        ambulance: driver.ambulanceId || null,
        role: "driver",
      },
    });
  } catch (error) {
    console.log("Update driver profile error:", error);
    return res.status(500).json({ message: "Failed to update driver profile" });
  }
}
};