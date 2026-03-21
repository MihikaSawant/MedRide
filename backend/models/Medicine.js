
const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({

  name:{
    type:String,
    required:true
  },

  category:{
    type:String,
    default:""
  },

  price:{
    type:Number,
    required:true
  },

  stock:{
    type:Number,
    required:true
  },

  description:{
    type:String,
    default:""
  },

  createdAt:{
    type:Date,
    default:Date.now
  }

});

module.exports = mongoose.model("Medicine", medicineSchema);