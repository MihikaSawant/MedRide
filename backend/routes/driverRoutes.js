
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const driverController = require("../controllers/driverController");

router.post("/login", driverController.driverLogin);
router.post("/", driverController.createDriver);

router.get("/", authMiddleware, driverController.getAllDrivers);
router.get(
  "/dashboard/:driverId",
  authMiddleware,
  driverController.getLoggedInDriverDashboard
);

router.put(
  "/toggle-status/:driverId",
  authMiddleware,
  driverController.toggleDriverAvailability
);

router.put(
  "/update-location/:driverId",
  authMiddleware,
  driverController.updateDriverLocation
);

router.put(
  "/start-ride/:bookingId",
  authMiddleware,
  driverController.startRide
);

router.put(
  "/complete-ride/:bookingId",
  authMiddleware,
  driverController.completeRide
);

