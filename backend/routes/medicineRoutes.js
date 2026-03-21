
const express = require("express");
const router = express.Router();

const {
addMedicine,
getMedicines,
deleteMedicine
} = require("../controllers/medicineController");

router.post("/", addMedicine);

router.get("/", getMedicines);

router.delete("/:id", deleteMedicine);

module.exports = router;