
const express = require("express");
const router = express.Router();

const { bookSOS, getSOSBooking } = require("../controllers/sosController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/book", authMiddleware, bookSOS);
router.get("/:id", authMiddleware, getSOSBooking);

module.exports = router;