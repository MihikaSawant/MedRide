
const express = require("express");
const router = express.Router();

const {
  getDriverDashboard,
  updateAmbulanceAvailability,
  completeSOSBooking,
  getAllAmbulances,
  createAmbulance,
} = require("../controllers/ambulanceController");

router.get("/", getAllAmbulances);
router.post("/", createAmbulance);

router.get("/driver-dashboard/:ambulanceId", getDriverDashboard);
router.put("/:ambulanceId/status", updateAmbulanceAvailability);
router.put("/complete-booking/:bookingId", completeSOSBooking);


