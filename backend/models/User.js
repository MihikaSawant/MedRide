
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true
},

password:{
type:String,
required:true
},

phone:{
type:String
},

bloodGroup:{
type:String
},

allergies:{
type:String
},

medicalConditions:{
type:String
},

emergencyContact:{
type:String
},

photo:{
type:String
}


});

=======
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

name:{
type:String,
required:true
},

email:{
type:String,
required:true,
unique:true
},

password:{
type:String,
required:true
},

phone:{
type:String
},

bloodGroup:{
type:String
},

allergies:{
type:String
},

medicalConditions:{
type:String
},

emergencyContact:{
type:String
},

photo:{
type:String
}


});

>>>>>>> 41ad65f04aa2fd57dfa14b37111853912647959b
module.exports = mongoose.model("User", userSchema);