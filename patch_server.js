const fs = require('fs');
let code = fs.readFileSync('backend/server.js', 'utf8');

code = code.replace(/socket\.on\("request_call", async \(\{ patientName, roomID, patientSocketId \}\) => \{([\s\S]*?)socket\.on\("reject_call", \(\{ roomID, patientSocketId \}\) => \{\s*console\.log\(`Call rejected for room \$\{roomID\}`\);\s*io\.to\(patientSocketId\)\.emit\("call_rejected"\);\s*\}\);/g,
  `socket.on("request_call", async ({ patientName, roomID, patientSocketId, patientId }) => {
    try {
      await Consultation.create({
        patientId: patientId || null,
        patientName: patientName,
        roomID: roomID,
        status: "Initiated",
      });
    } catch (err) {
      console.log("Error creating summary:", err);
    }
    const socketsInRoom = await io.in("online_doctors").fetchSockets();
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
  });`);

fs.writeFileSync('backend/server.js', code);
console.log("PATCHED");
