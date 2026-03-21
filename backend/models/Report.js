
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    fileName: {
      type: String
    }
  },
  { timestamps: true }
);

=======
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    fileName: {
      type: String
    }
  },
  { timestamps: true }
);

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = mongoose.model("Report", reportSchema);