
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
},

accountType:{
type:String,
enum:['Personal', 'Family'],
default:'Personal'
},

familyMembers:[{
name: String,
relation: String,
gender: String,
age: Number,
bloodGroup: String,
medicalConditions: String
}]

});

module.exports = mongoose.model("User", userSchema);