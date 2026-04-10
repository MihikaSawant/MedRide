const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const doctorController = require("../controllers/doctorController");

const router = express.Router();

// Admin creates doctors
// Use admin middleware if available
router.post("/create", authMiddleware, doctorController.createDoctor);

// Admin / Public gets all doctors
router.get("/all", authMiddleware, doctorController.getAllDoctors);

// Doctor login
router.post("/login", doctorController.doctorLogin);

module.exports = router;