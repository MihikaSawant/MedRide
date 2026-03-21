
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    pickup: {
      type: String,
      required: true,
    },

    hospital: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    bookingType: {
      type: String,
      enum: ["normal", "sos"],
      default: "normal",
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Searching Driver",
        "Assigned",
        "Rejected By Driver",
        "Accepted",
        "On The Way",
        "Reached Pickup",
        "Patient Picked",
        "Reached Hospital",
        "Completed",
        "Cancelled",
        "No Driver Found",
      ],
      default: "Pending",
    },

    assignedBy: {
      type: String,
      enum: ["admin", "system", null],
      default: null,
    },

    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      default: null,
    },

    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
    },

    ambulanceNumber: {
      type: String,
      default: "",
    },

    driverName: {
      type: String,
      default: "",
    },

    driverPhone: {
      type: String,
      default: "",
    },

    pickupLat: {
      type: Number,
      default: null,
    },

    pickupLng: {
      type: Number,
      default: null,
    },

    hospitalLat: {
      type: Number,
      default: null,
    },

    hospitalLng: {
      type: Number,
      default: null,
    },

    ambulanceLat: {
      type: Number,
      default: null,
    },

    ambulanceLng: {
      type: Number,
      default: null,
    },

    eta: {
      type: Number,
      default: null,
    },

    distanceKm: {
      type: Number,
      default: null,
    },

    routeTarget: {
      type: String,
      enum: ["pickup", "hospital", null],
      default: "pickup",
    },

    routeGeometry: {
      type: [[Number]],
      default: [],
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


