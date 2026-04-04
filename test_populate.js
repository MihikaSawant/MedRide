const mongoose = require("mongoose");
require("dotenv").config({ path: "./backend/.env" });
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/medride")
  .then(async () => {
    require("./backend/models/User");
    const Report = require("./backend/models/Report");
    try {
      const reports = await Report.find().populate("user", "name email");
      console.log(reports);
    } catch(e) {
      console.error(e.message);
    }
    process.exit(0);
  });
