
const express = require("express");
const router = express.Router();

const {
  register,
  login,
  updateProfile,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.put("/update/:id", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getMe);

module.exports = router;