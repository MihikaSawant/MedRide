const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    ambulanceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // optional rakha hai, kyunki actual driver Driver model me hoga
    driverName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    currentLat: {
      type: Number,
      default: 19.076,
    },

    currentLng: {
      type: Number,
      default: 72.8777,
    },

    status: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ambulance", ambulanceSchema);