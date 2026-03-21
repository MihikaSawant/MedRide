
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  uploadReport,
  getReports,
  deleteReport,
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
router.delete("/delete/:id", authMiddleware, deleteReport);

=======
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  uploadReport,
  getReports,
  deleteReport,
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
router.delete("/delete/:id", authMiddleware, deleteReport);

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = router;