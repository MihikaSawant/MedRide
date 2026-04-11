const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },
    patientName: {
      type: String,
      required: true,
    },
    doctorName: {
      type: String,
      default: "Unknown",
    },
    roomID: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Initiated", "Accepted", "Rejected", "Missed"],
      default: "Initiated",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);
