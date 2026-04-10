const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  specialization: {
    type: String,
    default: "General Physician",
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  socketId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model("Doctor", doctorSchema);