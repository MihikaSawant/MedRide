
const Report = require("../models/Report");
const fs = require("fs");
const path = require("path");

exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { description } = req.body;

    const report = new Report({
      user: req.user.id,
      fileName: req.file.filename,
      description: description || ""
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
    console.log("Delete report request:", {
      reportId: req.params.id,
      userId: req.user?.id
    });

    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    console.log("Found report:", report);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const filePath = path.join(__dirname, "..", "uploads", report.fileName);
    console.log("File path to delete:", filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("File deleted successfully");
    } else {
      console.log("File does not exist:", filePath);
    }

    await Report.findByIdAndDelete(report._id);
    console.log("Report deleted from database");

    res.json({ message: "Report deleted successfully" });
  } catch (err) {
    console.log("Delete report error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Delete the old file
    const oldFilePath = path.join(__dirname, "..", "uploads", report.fileName);
    if (fs.existsSync(oldFilePath)) {
      fs.unlinkSync(oldFilePath);
    }

    // Update with new file
    report.fileName = req.file.filename;
    await report.save();

    res.json({
      message: "Report updated successfully",
      report,
    });
  } catch (err) {
    console.log("Update report error:", err);
    res.status(500).json({ message: err.message });
  }
};