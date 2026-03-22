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

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const user = encodeURIComponent(
      JSON.stringify({
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: "user",
      })
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/google-success?token=${token}&user=${user}`
    );
  }
);

module.exports = router;