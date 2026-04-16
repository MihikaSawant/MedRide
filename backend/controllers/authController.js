
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

exports.register = async (req, res) => {
  try {
    const { name, email, password, accountType } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      accountType: accountType || 'Personal'
    });

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safeUser = await User.findById(user._id).select("-password");

    return res.json({
      message: "User registered successfully",
      token,
      user: {
        ...safeUser.toObject(),
        role: "user",
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.password === "googleAuth") {
      return res.status(400).json({
        message:
          "This account was created with Google login. Please continue with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: "user",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const safeUser = await User.findById(user._id).select("-password");

    return res.json({
      token,
      user: {
        ...safeUser.toObject(),
        role: "user",
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).select("-password");

    return res.json(updatedUser);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      ...user.toObject(),
      role: "user",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.addFamilyMember = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const { name, relation, gender, age, bloodGroup, medicalConditions } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Always allow for right now if they can see the button
    // if (user.accountType !== 'Family') {
    //  return res.status(400).json({ message: "Not a Family account. Upgrade to add family members." });
    // }

    user.familyMembers.push({ name, relation, gender, age, bloodGroup, medicalConditions });
    await user.save();

    return res.json(user);
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded admin credentials for now
    if (email !== "admin@medride.com" || password !== "admin123") {
      return res.status(400).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      {
        id: "admin",
        role: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      token,
      user: {
        name: "Admin",
        email: "admin@medride.com",
        role: "admin",
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account' });
  }
};

// Setup email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to user (valid for 10 minutes)
    user.resetOTP = otp;
    user.resetOTPExpiry = new Date(Date.now() + 600000); // 10 minutes
    await user.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "MedRide - Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${user.name || "User"},</p>
        <p>Your One-Time Password (OTP) is:</p>
        <h3 style="background: #f0f0f0; padding: 15px; border-radius: 5px; letter-spacing: 2px;">${otp}</h3>
        <p>This OTP will expire in 10 minutes.</p>
        <p>Do not share this OTP with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>MedRide Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      message: "OTP has been sent to your registered email address.",
      email: email,
    });

  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if OTP matches
    if (user.resetOTP !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check if OTP has expired
    if (new Date() > user.resetOTPExpiry) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    // OTP is valid - clear it and allow password reset
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    user.otpVerified = true; // Mark as verified for this session
    await user.save();

    return res.json({
      message: "OTP verified successfully. You can now reset your password.",
      verified: true,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// Reset Password after OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otpVerified = false;
    await user.save();

    return res.json({
      message: "Password changed successfully. You can now login with your new password.",
    });

  } catch (err) {
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

