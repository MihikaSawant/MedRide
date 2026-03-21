
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

medicines:[
{
medicine:{
type:mongoose.Schema.Types.ObjectId,
ref:"Medicine"
},
name:String,
price:Number,
quantity:Number
}
],

totalPrice:{
type:Number,
default:0
},

status:{
type:String,
enum:["Pending","Accepted","Dispatched","Delivered","Cancelled"],
default:"Pending"
},

date:{
type:Date,
default:Date.now
}

});

module.exports = mongoose.model("Order", orderSchema);