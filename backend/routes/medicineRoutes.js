
const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname.replace(/\\s+/g, '-'));
  }
});

const upload = multer({ storage: storage });

const {
addMedicine,
getMedicines,
deleteMedicine
} = require("../controllers/medicineController");

router.post("/", upload.single('image'), addMedicine);

router.get("/", getMedicines);

router.delete("/:id", deleteMedicine);

module.exports = router;