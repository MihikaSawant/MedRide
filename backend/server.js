const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sosRoutes = require("./routes/sosRoutes");
const ambulanceRoutes = require("./routes/ambulanceRoutes");
const driverRoutes = require("./routes/driverRoutes");
const chatRoutes = require("./routes/chatRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const consultationRoutes = require("./routes/consultationRoutes");

const Ambulance = require("./models/Ambulance");
const Booking = require("./models/Booking");
const Consultation = require("./models/Consultation");
const getRouteDetails = require("./utils/getRouteDetails");

const passport = require("passport");
require("./config/googleAuth");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(passport.initialize());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.send("MedRide backend is running");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/ambulances", ambulanceRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/consultations", consultationRoutes);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, role: "user" }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    return res.redirect(`${frontendUrl}/google-success?token=${token}`);
  }
);

const shouldRouteToHospital = (status) => {
  return ["Patient Picked", "Reached Hospital", "Completed"].includes(status);
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  // === DOCTOR CALLING SIGNALING ===
  socket.on("doctorLogin", (doctorId) => {
    socket.join("online_doctors");
    console.log(`Doctor ${doctorId} joined online_doctors`);
  });

socket.on("request_call", async ({ patientName, roomID, patientSocketId, patientId }) => {
    try {
      await Consultation.create({
        patientId: patientId || null,
        patientName: patientName || "Emergency Patient",
        roomID: roomID,
        status: "Initiated",
      });
    } catch (err) {
      console.log("Error creating summary:", err);
    }
    const socketsInRoom = await io.in("online_doctors").fetchSockets();
    console.log(`Sending incoming_call to ${socketsInRoom.length} online doctors.`);
    io.to("online_doctors").emit("incoming_call", {
      patientName,
      patientId,
      roomID,
      patientSocketId: socket.id
    });
  });

  socket.on("accept_call", async ({ roomID, patientSocketId, doctorName, doctorId }) => {
    try {
      await Consultation.findOneAndUpdate(
        { roomID },
        { status: "Accepted", doctorName, doctorId: doctorId || null }
      );
    } catch (err) {
      console.log(err);
    }
    io.to(patientSocketId).emit("call_accepted", { roomID, doctorName });
  });

  socket.on("reject_call", async ({ roomID, patientSocketId }) => {
    try {
      await Consultation.findOneAndUpdate({ roomID }, { status: "Rejected" });
    } catch (err) {}
    io.to(patientSocketId).emit("call_rejected");
  });
  // ================================

  socket.on("joinBookingRoom", (bookingId) => {
    if (!bookingId) return;
    socket.join(`booking_${bookingId}`);
  });

  socket.on("leaveBookingRoom", (bookingId) => {
    if (!bookingId) return;
    socket.leave(`booking_${bookingId}`);
  });

  socket.on("driverLocationUpdate", async ({ ambulanceId, bookingId, lat, lng }) => {
    try {
      if (
        !ambulanceId ||
        !bookingId ||
        lat === undefined ||
        lng === undefined ||
        lat === null ||
        lng === null
      ) {
        return;
      }

      const ambulance = await Ambulance.findByIdAndUpdate(
        ambulanceId,
        {
          currentLat: Number(lat),
          currentLng: Number(lng),
        },
        { new: true }
      );

      const booking = await Booking.findById(bookingId);

      if (!ambulance || !booking) return;

      booking.ambulanceLat = Number(lat);
      booking.ambulanceLng = Number(lng);

      let targetLat = booking.pickupLat;
      let targetLng = booking.pickupLng;
      let routeTarget = "pickup";

      if (shouldRouteToHospital(booking.status)) {
        targetLat = booking.hospitalLat;
        targetLng = booking.hospitalLng;
        routeTarget = "hospital";
      }

      let routeData = null;
      let distanceKm = booking.distanceKm ?? null;
      let eta = booking.eta ?? null;
      let routeGeometry = Array.isArray(booking.routeGeometry)
        ? booking.routeGeometry
        : [];

      if (targetLat != null && targetLng != null && process.env.ORS_API_KEY) {
        routeData = await getRouteDetails(
          Number(lat),
          Number(lng),
          targetLat,
          targetLng
        );
      }

      if (routeData) {
        distanceKm = Number(routeData.distanceKm);
        eta = Number(routeData.durationMin);
        routeGeometry = Array.isArray(routeData.geometry) ? routeData.geometry : [];
      }

      booking.eta = eta;
      booking.distanceKm = distanceKm;
      booking.routeTarget = routeTarget;
      booking.routeGeometry = routeGeometry;
      await booking.save();

      io.to(`booking_${bookingId}`).emit("ambulanceLocationUpdated", {
        bookingId: booking._id.toString(),
        lat: Number(lat),
        lng: Number(lng),
        eta,
        distanceKm,
        routeGeometry,
        status: booking.status,
        routeTarget,
        pickupLat: booking.pickupLat,
        pickupLng: booking.pickupLng,
        hospitalLat: booking.hospitalLat,
        hospitalLng: booking.hospitalLng,
        driverName: booking.driverName,
        driverPhone: booking.driverPhone,
        ambulanceNumber: booking.ambulanceNumber,
      });
    } catch (error) {
      console.log("driverLocationUpdate socket error:", error);
    }
  });

  socket.on("bookingStatusUpdate", async ({ bookingId, status }) => {
    try {
      if (!bookingId || !status) return;

      const booking = await Booking.findById(bookingId);
      if (!booking) return;

      booking.status = status;

      if (["Patient Picked", "Reached Hospital", "Completed"].includes(status)) {
        booking.routeTarget = "hospital";
      } else if (
        ["Accepted", "On The Way", "Reached Pickup", "Assigned"].includes(status)
      ) {
        booking.routeTarget = "pickup";
      }

      await booking.save();

      io.to(`booking_${bookingId}`).emit("ambulanceLocationUpdated", {
        bookingId: booking._id.toString(),
        lat: booking.ambulanceLat,
        lng: booking.ambulanceLng,
        eta: booking.eta,
        distanceKm: booking.distanceKm,
        routeGeometry: booking.routeGeometry || [],
        status: booking.status,
        routeTarget: booking.routeTarget,
        pickupLat: booking.pickupLat,
        pickupLng: booking.pickupLng,
        hospitalLat: booking.hospitalLat,
        hospitalLng: booking.hospitalLng,
        driverName: booking.driverName,
        driverPhone: booking.driverPhone,
        ambulanceNumber: booking.ambulanceNumber,
      });
    } catch (error) {
      console.log("bookingStatusUpdate error:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});