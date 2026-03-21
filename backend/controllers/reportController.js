
const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const report = new Report({
      user: req.user.id,
      fileName: req.file.filename,
    });

    await report.save();

    res.status(201).json({
      message: "Report uploaded successfully",
      report,
    });
  } catch (err) {
    console.log("Upload report error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(reports);
  } catch (err) {
    console.log("Get reports error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const filePath = path.join(__dirname, "..", "uploads", report.fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(report._id);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.log("Delete report error:", err);
    res.status(500).json({ message: err.message });
  }

const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const report = new Report({
      user: req.user.id,
      fileName: req.file.filename,
    });

    await report.save();

    res.status(201).json({
      message: "Report uploaded successfully",
      report,
    });
  } catch (err) {
    console.log("Upload report error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(reports);
  } catch (err) {
    console.log("Get reports error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const filePath = path.join(__dirname, "..", "uploads", report.fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Report.findByIdAndDelete(report._id);

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.log("Delete report error:", err);
    res.status(500).json({ message: err.message });
  }
}
};