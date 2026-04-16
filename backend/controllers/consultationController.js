const Consultation = require("../models/Consultation");

const canAccessConsultation = (consultation, user) => {
  if (!consultation || !user) return false;

  if (user.role === "admin") return true;

  const userId = String(user.id || user._id || "");
  const patientId = consultation.patientId ? String(consultation.patientId) : "";
  const doctorId = consultation.doctorId ? String(consultation.doctorId) : "";

  return userId === patientId || userId === doctorId;
};

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

// Fetch a consultation by room ID for the active call screen
exports.getConsultationByRoomID = async (req, res) => {
  try {
    const { roomID } = req.params;
    const consultation = await Consultation.findOne({ roomID }).sort({ date: -1 });

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    if (!canAccessConsultation(consultation, req.user)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(consultation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
