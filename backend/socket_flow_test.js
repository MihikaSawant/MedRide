const { io } = require("socket.io-client");

const URL = "http://localhost:5000";
const roomID = `room-test-${Date.now()}`;

const doctor = io(URL, { transports: ["websocket"], timeout: 5000 });
const patient = io(URL, { transports: ["websocket"], timeout: 5000 });

let receivedIncoming = false;
let receivedAccepted = false;

doctor.on("connect", () => {
  console.log("[doctor] connected", doctor.id);
  doctor.emit("doctorLogin", "doctor-test-1");
});

patient.on("connect", () => {
  console.log("[patient] connected", patient.id);
  patient.emit("request_call", {
    patientName: "Test Patient",
    patientId: "680000000000000000000001",
    roomID,
    patientSocketId: patient.id,
  });
});

doctor.on("incoming_call", (payload) => {
  receivedIncoming = true;
  console.log("[doctor] incoming_call", payload);
  doctor.emit("accept_call", {
    roomID: payload.roomID,
    patientSocketId: payload.patientSocketId,
    doctorName: "Test Doctor",
    doctorId: "680000000000000000000002",
  });
});

patient.on("call_accepted", (payload) => {
  receivedAccepted = true;
  console.log("[patient] call_accepted", payload);
  cleanup(0);
});

patient.on("call_rejected", (payload) => {
  console.log("[patient] call_rejected", payload);
});

function cleanup(code) {
  doctor.disconnect();
  patient.disconnect();
  setTimeout(() => process.exit(code), 200);
}

setTimeout(() => {
  console.log("[result] incoming_call:", receivedIncoming, "call_accepted:", receivedAccepted);
  cleanup(receivedIncoming && receivedAccepted ? 0 : 1);
}, 8000);
