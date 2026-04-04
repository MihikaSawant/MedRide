
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  uploadReport,
  getReports,
  getAllReports,
  getReportById,
  deleteReport,
  updateReport,
} = require("../controllers/reportController");

const authMiddleware = require("../middleware/authMiddleware");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", authMiddleware, upload.single("report"), uploadReport);
router.get("/my-reports", authMiddleware, getReports);
router.get("/all", authMiddleware, getAllReports);
router.get("/:id", authMiddleware, getReportById);
router.put("/update/:id", authMiddleware, upload.single("report"), updateReport);
router.delete("/delete/:id", authMiddleware, deleteReport);

module.exports = router;