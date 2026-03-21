
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const bookingController = require("../controllers/bookingController");

console.log("bookingController check:", {
  createBooking: typeof bookingController.createBooking,
  getUserBookings: typeof bookingController.getUserBookings,
  getAllBookings: typeof bookingController.getAllBookings,
  updateBookingStatus: typeof bookingController.updateBookingStatus,
  assignAmbulance: typeof bookingController.assignAmbulance,
  getAvailableDriversAndAmbulances:
    typeof bookingController.getAvailableDriversAndAmbulances,
  authMiddleware: typeof authMiddleware,
});

router.post("/", authMiddleware, bookingController.createBooking);
router.get("/my-bookings", authMiddleware, bookingController.getUserBookings);

router.get("/", bookingController.getAllBookings);
router.get(
  "/available-resources",
  bookingController.getAvailableDriversAndAmbulances
);
router.put("/:id/status", bookingController.updateBookingStatus);
router.put("/:id/assign", bookingController.assignAmbulance);

