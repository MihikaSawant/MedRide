
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Ambulance = require("../models/Ambulance");

exports.createBooking = async (req, res) => {
  try {
    const {
      pickup,
      hospital,
      phone,
      pickupLat,
      pickupLng,
      hospitalLat,
      hospitalLng,
    } = req.body;

    if (!pickup || !hospital || !phone) {
      return res.status(400).json({
        message: "Pickup, hospital and phone are required",
      });
    }

    const userId = req.user?.id || req.user?._id || null;

    const booking = await Booking.create({
      user: userId,
      pickup,
      hospital,
      phone,
      pickupLat: pickupLat ?? null,
      pickupLng: pickupLng ?? null,
      hospitalLat: hospitalLat ?? null,
      hospitalLng: hospitalLng ?? null,
      bookingType: "normal",
      status: "Pending",
      assignedBy: null,
      routeTarget: "pickup",
      ambulanceLat: null,
      ambulanceLng: null,
      eta: null,
      distanceKm: null,
      routeGeometry: [],
    });

    return res.status(201).json({
      message: "Normal ambulance booking created successfully",
      booking,
    });
  } catch (err) {
    console.log("createBooking error:", err);
    return res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const bookings = await Booking.find({ user: userId })
      .populate("driverId", "name phone status isOnline")
      .populate("ambulanceId", "ambulanceNumber status currentLat currentLng")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (err) {
    console.log("getUserBookings error:", err);
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ bookingType: "normal" })
      .populate("user", "name email phone")
      .populate("driverId", "name phone status isOnline")
      .populate("ambulanceId", "ambulanceNumber status currentLat currentLng")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (err) {
    console.log("getAllBookings error:", err);
    return res.status(500).json({
      message: "Failed to fetch all bookings",
      error: err.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;

    if (["Patient Picked", "Reached Hospital", "Completed"].includes(status)) {
      booking.routeTarget = "hospital";
    } else if (
      ["Assigned", "Accepted", "On The Way", "Reached Pickup"].includes(status)
    ) {
      booking.routeTarget = "pickup";
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (err) {
    console.log("updateBookingStatus error:", err);
    return res.status(500).json({
      message: "Failed to update status",
      error: err.message,
    });
  }
};

exports.assignAmbulance = async (req, res) => {
  try {
    const { ambulanceId, driverId } = req.body;

    if (!ambulanceId || !driverId) {
      return res.status(400).json({
        message: "ambulanceId and driverId are required",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (
      !driver.ambulanceId ||
      driver.ambulanceId.toString() !== ambulance._id.toString()
    ) {
      return res.status(400).json({
        message: "Selected driver is not linked to this ambulance",
      });
    }

    if (!driver.isOnline || driver.status !== "available") {
      return res.status(400).json({
        message: "Selected driver is not available right now",
      });
    }

    booking.ambulanceId = ambulance._id;
    booking.driverId = driver._id;
    booking.ambulanceNumber = ambulance.ambulanceNumber || "";
    booking.driverName = driver.name || "";
    booking.driverPhone = driver.phone || "";
    booking.ambulanceLat = ambulance.currentLat ?? null;
    booking.ambulanceLng = ambulance.currentLng ?? null;
    booking.status = "Assigned";
    booking.assignedBy = "admin";
    booking.routeTarget = "pickup";

    await booking.save();

    driver.currentBookingId = booking._id;
    driver.status = "busy";
    await driver.save();

    ambulance.status = "busy";
    await ambulance.save();

    return res.status(200).json({
      message: "Driver and ambulance assigned successfully",
      booking,
    });
  } catch (err) {
    console.log("assignAmbulance error:", err);
    return res.status(500).json({
      message: "Failed to assign ambulance",
      error: err.message,
    });
  }
};

exports.getAvailableDriversAndAmbulances = async (req, res) => {
  try {
    const drivers = await Driver.find({
      isOnline: true,
      status: "available",
    }).populate("ambulanceId");

    const result = drivers
      .filter((driver) => driver.ambulanceId)
      .map((driver) => ({
        driverId: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverStatus: driver.status,
        isOnline: driver.isOnline,
        ambulanceId: driver.ambulanceId._id,
        ambulanceNumber: driver.ambulanceId.ambulanceNumber,
        ambulanceStatus: driver.ambulanceId.status,
        currentLat: driver.ambulanceId.currentLat,
        currentLng: driver.ambulanceId.currentLng,
      }));

    return res.status(200).json(result);
  } catch (err) {
    console.log("getAvailableDriversAndAmbulances error:", err);
    return res.status(500).json({
      message: "Failed to fetch available drivers",
      error: err.message,
    });
  }

const Booking = require("../models/Booking");
const Driver = require("../models/Driver");
const Ambulance = require("../models/Ambulance");

exports.createBooking = async (req, res) => {
  try {
    const {
      pickup,
      hospital,
      phone,
      pickupLat,
      pickupLng,
      hospitalLat,
      hospitalLng,
    } = req.body;

    if (!pickup || !hospital || !phone) {
      return res.status(400).json({
        message: "Pickup, hospital and phone are required",
      });
    }

    const userId = req.user?.id || req.user?._id || null;

    const booking = await Booking.create({
      user: userId,
      pickup,
      hospital,
      phone,
      pickupLat: pickupLat ?? null,
      pickupLng: pickupLng ?? null,
      hospitalLat: hospitalLat ?? null,
      hospitalLng: hospitalLng ?? null,
      bookingType: "normal",
      status: "Pending",
      assignedBy: null,
      routeTarget: "pickup",
      ambulanceLat: null,
      ambulanceLng: null,
      eta: null,
      distanceKm: null,
      routeGeometry: [],
    });

    return res.status(201).json({
      message: "Normal ambulance booking created successfully",
      booking,
    });
  } catch (err) {
    console.log("createBooking error:", err);
    return res.status(500).json({
      message: "Booking failed",
      error: err.message,
    });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const bookings = await Booking.find({ user: userId })
      .populate("driverId", "name phone status isOnline")
      .populate("ambulanceId", "ambulanceNumber status currentLat currentLng")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (err) {
    console.log("getUserBookings error:", err);
    return res.status(500).json({
      message: "Failed to fetch bookings",
      error: err.message,
    });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ bookingType: "normal" })
      .populate("user", "name email phone")
      .populate("driverId", "name phone status isOnline")
      .populate("ambulanceId", "ambulanceNumber status currentLat currentLng")
      .sort({ createdAt: -1 });

    return res.status(200).json(bookings);
  } catch (err) {
    console.log("getAllBookings error:", err);
    return res.status(500).json({
      message: "Failed to fetch all bookings",
      error: err.message,
    });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;

    if (["Patient Picked", "Reached Hospital", "Completed"].includes(status)) {
      booking.routeTarget = "hospital";
    } else if (
      ["Assigned", "Accepted", "On The Way", "Reached Pickup"].includes(status)
    ) {
      booking.routeTarget = "pickup";
    }

    await booking.save();

    return res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (err) {
    console.log("updateBookingStatus error:", err);
    return res.status(500).json({
      message: "Failed to update status",
      error: err.message,
    });
  }
};

exports.assignAmbulance = async (req, res) => {
  try {
    const { ambulanceId, driverId } = req.body;

    if (!ambulanceId || !driverId) {
      return res.status(400).json({
        message: "ambulanceId and driverId are required",
      });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const ambulance = await Ambulance.findById(ambulanceId);
    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({ message: "Driver not found" });
    }

    if (
      !driver.ambulanceId ||
      driver.ambulanceId.toString() !== ambulance._id.toString()
    ) {
      return res.status(400).json({
        message: "Selected driver is not linked to this ambulance",
      });
    }

    if (!driver.isOnline || driver.status !== "available") {
      return res.status(400).json({
        message: "Selected driver is not available right now",
      });
    }

    booking.ambulanceId = ambulance._id;
    booking.driverId = driver._id;
    booking.ambulanceNumber = ambulance.ambulanceNumber || "";
    booking.driverName = driver.name || "";
    booking.driverPhone = driver.phone || "";
    booking.ambulanceLat = ambulance.currentLat ?? null;
    booking.ambulanceLng = ambulance.currentLng ?? null;
    booking.status = "Assigned";
    booking.assignedBy = "admin";
    booking.routeTarget = "pickup";

    await booking.save();

    driver.currentBookingId = booking._id;
    driver.status = "busy";
    await driver.save();

    ambulance.status = "busy";
    await ambulance.save();

    return res.status(200).json({
      message: "Driver and ambulance assigned successfully",
      booking,
    });
  } catch (err) {
    console.log("assignAmbulance error:", err);
    return res.status(500).json({
      message: "Failed to assign ambulance",
      error: err.message,
    });
  }
};

exports.getAvailableDriversAndAmbulances = async (req, res) => {
  try {
    const drivers = await Driver.find({
      isOnline: true,
      status: "available",
    }).populate("ambulanceId");

    const result = drivers
      .filter((driver) => driver.ambulanceId)
      .map((driver) => ({
        driverId: driver._id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverStatus: driver.status,
        isOnline: driver.isOnline,
        ambulanceId: driver.ambulanceId._id,
        ambulanceNumber: driver.ambulanceId.ambulanceNumber,
        ambulanceStatus: driver.ambulanceId.status,
        currentLat: driver.ambulanceId.currentLat,
        currentLng: driver.ambulanceId.currentLng,
      }));

    return res.status(200).json(result);
  } catch (err) {
    console.log("getAvailableDriversAndAmbulances error:", err);
    return res.status(500).json({
      message: "Failed to fetch available drivers",
      error: err.message,
    });
  }
}
};