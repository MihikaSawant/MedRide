
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

=======
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

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = mongoose.model("Medicine", medicineSchema);