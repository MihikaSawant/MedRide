
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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