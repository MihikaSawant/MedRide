const Consultation = require("../models/Consultation");

// Fetch consultations for Admin
exports.getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().sort({ date: -1 });
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch consultations for a Patient
exports.getPatientConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ patientId: req.user.id }).sort({ date: -1 });
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch consultations for a Doctor
exports.getDoctorConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({ doctorId: req.user.id }).sort({ date: -1 });
    res.status(200).json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
