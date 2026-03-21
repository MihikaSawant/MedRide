import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

function MedicineStore(){

const [medicines,setMedicines] = useState([]);
const [cart,setCart] = useState([]);

useEffect(()=>{
fetchMedicines();
},[]);

const fetchMedicines = async ()=>{

try{

const res = await axios.get("https://medride-project.onrender.com/api/medicines");

setMedicines(res.data);

}catch(err){

console.log(err);

}

};

const addToCart = (medicine)=>{

setCart([...cart,medicine]);

alert("Added to cart");

};

const placeOrder = async ()=>{

if(cart.length===0){

alert("Cart is empty");

return;

}

try{

await axios.post(

"https://medride-project.onrender.com/api/orders",

{
medicines:cart.map(item=>({
medicine:item._id,
name:item.name,
price:item.price,
quantity:1
})),

totalPrice:cart.reduce((a,b)=>a+b.price,0)

},

{
headers:{
Authorization:localStorage.getItem("token")
}
}

);

alert("Order placed successfully");

setCart([]);

}catch(err){

console.log(err);

}

};

return(

<div className="mobile-wrapper">

<div className="phone-screen">

<Navbar/>

<div className="history-page">

<div className="history-header">

<h2>Medicine Store</h2>

<p>Order medicines quickly and safely</p>

</div>

{medicines.length===0 ?(

<div className="empty-history-card">

<h3>No Medicines Available</h3>

</div>

):( 

<div className="history-list">

{medicines.map((m)=>(
<div className="history-card-modern" key={m._id}>

<h3>{m.name}</h3>

<p><b>Category:</b> {m.category}</p>

<p><b>Price:</b> ₹{m.price}</p>

<p><b>Stock:</b> {m.stock}</p>

<p>{m.description}</p>

<button
className="confirm-booking-btn"
onClick={()=>addToCart(m)}
>

Add to Cart

</button>

</div>
))}

</div>

)}

{/* CART SECTION */}

{cart.length>0 && (

<div style={{marginTop:"20px"}}>

<h3>Cart</h3>

{cart.map((item,index)=>(
<div key={index} className="history-card-modern">

<p>{item.name} - ₹{item.price}</p>

</div>
))}

<button
className="confirm-booking-btn"
onClick={placeOrder}
>

Place Order

</button>

</div>

)}

</div>

</div>

</div>

);

}

export default MedicineStore;