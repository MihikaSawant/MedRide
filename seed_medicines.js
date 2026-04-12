const mongoose = require("./backend/node_modules/mongoose");
require("./backend/node_modules/dotenv").config({ path: "./backend/.env" });

const Medicine = require("./backend/models/Medicine");

const sampleMedicines = [
  {
    name: "Paracetamol 500mg",
    category: "Pain Relief",
    price: 30,
    stock: 200,
    description: "Used to treat mild to moderate pain and reduce fever.",
    image: ""
  },
  {
    name: "Amoxicillin 250mg",
    category: "Antibiotics",
    price: 120,
    stock: 50,
    description: "A penicillin antibiotic used to treat bacterial infections.",
    image: ""
  },
  {
    name: "Cetirizine 10mg",
    category: "Allergy",
    price: 45,
    stock: 150,
    description: "Antihistamine used to relieve allergy symptoms like watery eyes and sneezing.",
    image: ""
  },
  {
    name: "Vitamin C 500mg",
    category: "Supplements",
    price: 80,
    stock: 100,
    description: "Helps support the immune system and general health.",
    image: ""
  },
  {
    name: "Ibuprofen 400mg",
    category: "Pain Relief",
    price: 50,
    stock: 80,
    description: "Nonsteroidal anti-inflammatory drug used for pain relief and fever.",
    image: ""
  },
  {
    name: "Cough Syrup 100ml",
    category: "Cold & Cough",
    price: 110,
    stock: 60,
    description: "Soothes throat and helps relieve dry cough.",
    image: ""
  }
];

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medride")
  .then(async () => {
    console.log("Connected to MongoDB...");
    try {
      await Medicine.insertMany(sampleMedicines);
      console.log(`Successfully added ${sampleMedicines.length} medicines to the database!`);
    } catch(e) {
      console.error("Error inserting medicines:", e.message);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect", err);
    process.exit(1);
  });
