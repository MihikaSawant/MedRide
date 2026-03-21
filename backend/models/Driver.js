
const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    ambulanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ambulance",
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },

    currentBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    currentLocation: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
  },
  { timestamps: true }
);


