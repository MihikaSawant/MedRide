
const mongoose = require("mongoose");
const Ambulance = require("../models/Ambulance");
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");

exports.getDriverDashboard = async (req, res) => {
  try {
    const { ambulanceId } = req.params;

    let ambulance = null;

    if (mongoose.Types.ObjectId.isValid(ambulanceId)) {
      ambulance = await Ambulance.findById(ambulanceId);
    }

    if (!ambulance) {
      ambulance = await Ambulance.findOne({
        ambulanceNumber: ambulanceId,
      });
    }

    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const assignedBooking = await Booking.findOne({
      ambulanceId: ambulance._id,
      bookingType: "sos",
      status: { $in: ["Ambulance Assigned", "On the Way", "Almost Reached"] },
    })
      .populate("user", "name email")
      .sort({ date: -1 });

    return res.status(200).json({
      ambulance,
      assignedBooking: assignedBooking || null,
    });
  } catch (error) {
    console.log("Driver dashboard error:", error);
    return res.status(500).json({ message: "Failed to load driver dashboard" });
  }
};

exports.updateAmbulanceAvailability = async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const { status } = req.body;

    const updatedAmbulance = await Ambulance.findByIdAndUpdate(
      ambulanceId,
      { status },
      { new: true }
    );

    if (!updatedAmbulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    return res.status(200).json(updatedAmbulance);
  } catch (error) {
    console.log("Update ambulance status error:", error);
    return res.status(500).json({ message: "Failed to update ambulance status" });
  }
};

exports.completeSOSBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "Completed";
    await booking.save();

    if (booking.ambulanceId) {
      await Ambulance.findByIdAndUpdate(booking.ambulanceId, {
        status: "available",
      });
    }

    return res.status(200).json({ message: "Booking completed successfully" });
  } catch (error) {
    console.log("Complete booking error:", error);
    return res.status(500).json({ message: "Failed to complete booking" });
  }
};

exports.getAllAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find().sort({ createdAt: -1 });

    const drivers = await Driver.find().populate("ambulanceId");

    const result = ambulances.map((ambulance) => {
      const linkedDriver = drivers.find(
        (driver) => driver.ambulanceId && driver.ambulanceId._id.toString() === ambulance._id.toString()
      );

      return {
        ...ambulance.toObject(),
        driver: linkedDriver
          ? {
              _id: linkedDriver._id,
              name: linkedDriver.name,
              phone: linkedDriver.phone,
            }
          : null,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log("Get all ambulances error:", error);
    return res.status(500).json({ message: "Failed to fetch ambulances" });
  }
};

exports.createAmbulance = async (req, res) => {
  try {
    const { ambulanceNumber, driverName, phone, currentLat, currentLng, status } = req.body;

    const existingAmbulance = await Ambulance.findOne({ ambulanceNumber });
    if (existingAmbulance) {
      return res.status(400).json({ message: "Ambulance number already exists" });
    }

    const ambulance = await Ambulance.create({
      ambulanceNumber,
      driverName,
      phone,
      currentLat,
      currentLng,
      status: status || "available",
    });

    return res.status(201).json(ambulance);
  } catch (error) {
    console.log("Create ambulance error:", error);
    return res.status(500).json({ message: "Failed to create ambulance" });
  }

const mongoose = require("mongoose");
const Ambulance = require("../models/Ambulance");
const Booking = require("../models/Booking");
const Driver = require("../models/Driver");

exports.getDriverDashboard = async (req, res) => {
  try {
    const { ambulanceId } = req.params;

    let ambulance = null;

    if (mongoose.Types.ObjectId.isValid(ambulanceId)) {
      ambulance = await Ambulance.findById(ambulanceId);
    }

    if (!ambulance) {
      ambulance = await Ambulance.findOne({
        ambulanceNumber: ambulanceId,
      });
    }

    if (!ambulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    const assignedBooking = await Booking.findOne({
      ambulanceId: ambulance._id,
      bookingType: "sos",
      status: { $in: ["Ambulance Assigned", "On the Way", "Almost Reached"] },
    })
      .populate("user", "name email")
      .sort({ date: -1 });

    return res.status(200).json({
      ambulance,
      assignedBooking: assignedBooking || null,
    });
  } catch (error) {
    console.log("Driver dashboard error:", error);
    return res.status(500).json({ message: "Failed to load driver dashboard" });
  }
};

exports.updateAmbulanceAvailability = async (req, res) => {
  try {
    const { ambulanceId } = req.params;
    const { status } = req.body;

    const updatedAmbulance = await Ambulance.findByIdAndUpdate(
      ambulanceId,
      { status },
      { new: true }
    );

    if (!updatedAmbulance) {
      return res.status(404).json({ message: "Ambulance not found" });
    }

    return res.status(200).json(updatedAmbulance);
  } catch (error) {
    console.log("Update ambulance status error:", error);
    return res.status(500).json({ message: "Failed to update ambulance status" });
  }
};

exports.completeSOSBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "Completed";
    await booking.save();

    if (booking.ambulanceId) {
      await Ambulance.findByIdAndUpdate(booking.ambulanceId, {
        status: "available",
      });
    }

    return res.status(200).json({ message: "Booking completed successfully" });
  } catch (error) {
    console.log("Complete booking error:", error);
    return res.status(500).json({ message: "Failed to complete booking" });
  }
};

exports.getAllAmbulances = async (req, res) => {
  try {
    const ambulances = await Ambulance.find().sort({ createdAt: -1 });

    const drivers = await Driver.find().populate("ambulanceId");

    const result = ambulances.map((ambulance) => {
      const linkedDriver = drivers.find(
        (driver) => driver.ambulanceId && driver.ambulanceId._id.toString() === ambulance._id.toString()
      );

      return {
        ...ambulance.toObject(),
        driver: linkedDriver
          ? {
              _id: linkedDriver._id,
              name: linkedDriver.name,
              phone: linkedDriver.phone,
            }
          : null,
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.log("Get all ambulances error:", error);
    return res.status(500).json({ message: "Failed to fetch ambulances" });
  }
};

exports.createAmbulance = async (req, res) => {
  try {
    const { ambulanceNumber, driverName, phone, currentLat, currentLng, status } = req.body;

    const existingAmbulance = await Ambulance.findOne({ ambulanceNumber });
    if (existingAmbulance) {
      return res.status(400).json({ message: "Ambulance number already exists" });
    }

    const ambulance = await Ambulance.create({
      ambulanceNumber,
      driverName,
      phone,
      currentLat,
      currentLng,
      status: status || "available",
    });

    return res.status(201).json(ambulance);
  } catch (error) {
    console.log("Create ambulance error:", error);
    return res.status(500).json({ message: "Failed to create ambulance" });
  }
}
};