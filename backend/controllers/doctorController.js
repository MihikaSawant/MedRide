const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Need to set in .env
    pass: process.env.EMAIL_PASS, // Need to set in .env
  },
});

exports.createDoctor = async (req, res) => {
  try {
    let { name, email, specialization, password } = req.body;

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists with this email" });
    }

    if (!password) {
      password = Math.random().toString(36).slice(-8); // Generate 8 char password
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newDoctor = await Doctor.create({
      name,
      email,
      specialization: specialization || "General Physician",
      password: hashedPassword,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to MedRide - Doctor Portal Access",
      html: `
        <h2>Welcome Dr. ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p><strong>Login Details:</strong></p>
        <ul>
          <li>Email: ${email}</li>
          <li>Password: ${password}</li>
        </ul>
        <p>Please login and change your password as soon as possible.</p>
      `,
    };

    try {
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes('your_email')) {
        await transporter.sendMail(mailOptions);
        console.log("Email sent to Doctor!");
      } else {
        console.log("SKIP EMAIL: EMAIL_USER or EMAIL_PASS not configured in backend/.env!");
      }
    } catch (mailError) {
      console.log("Failed to send email (Check your Gmail App Password):", mailError);
    }

    res.status(201).json({ 
      message: "Doctor created successfully", 
      doctor: newDoctor,
      password: password 
    });
  } catch (error) {
    console.error("Error creating doctor:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.doctorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: doctor._id, role: "doctor" }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().select("-password");
    res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({ message: "Server error" });
  }
};