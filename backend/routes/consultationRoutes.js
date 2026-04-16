const express = require("express");
const router = express.Router();
const consultationController = require("../controllers/consultationController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/admin", authMiddleware, consultationController.getAllConsultations);
router.get("/patient", authMiddleware, consultationController.getPatientConsultations);
router.get("/doctor", authMiddleware, consultationController.getDoctorConsultations);
router.get("/room/:roomID", authMiddleware, consultationController.getConsultationByRoomID);

module.exports = router;
