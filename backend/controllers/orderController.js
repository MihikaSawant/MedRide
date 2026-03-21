
const Order = require("../models/Order");

exports.createOrder = async (req,res)=>{

try{

const {medicines,totalPrice} = req.body;

const order = new Order({

user:req.user.id,
medicines,
totalPrice

});

await order.save();

res.json({message:"Order placed successfully"});

}catch(err){

res.status(500).json(err);

}

};

exports.getUserOrders = async (req,res)=>{

try{

const orders = await Order.find({user:req.user.id})
.populate("medicines.medicine")
.sort({date:-1});

res.json(orders);

}catch(err){

res.status(500).json(err);

}

};

exports.getAllOrders = async (req,res)=>{

try{

const orders = await Order.find()
.populate("user","name email")
.populate("medicines.medicine")
.sort({date:-1});

res.json(orders);

}catch(err){

res.status(500).json(err);

}

};

exports.updateOrderStatus = async (req,res)=>{

try{

const {status} = req.body;

const order = await Order.findByIdAndUpdate(

req.params.id,
{status},
{new:true}

);

res.json(order);

}catch(err){

res.status(500).json(err);

}

};