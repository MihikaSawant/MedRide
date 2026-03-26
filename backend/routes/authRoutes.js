const express = require("express");
const router = express.Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const {
  register,
  login,
  adminLogin,
  updateProfile,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/admin/login", adminLogin);
router.put("/update/:id", authMiddleware, updateProfile);
router.get("/me", authMiddleware, getMe);

module.exports = router;