import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5052';

function MedicineStore(){

const [medicines,setMedicines] = useState([]);
const [cart,setCart] = useState([]);

useEffect(()=>{
fetchMedicines();
},[]);

const fetchMedicines = async ()=>{

try{

const res = await axios.get("/api/medicines");

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

"/api/orders",

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

<div className="history-list" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', padding: '10px 0'}}>

{medicines.map((m)=>(
<div className="history-card-modern" key={m._id} style={{ display: 'flex', flexDirection: 'column', padding: '10px', height: '100%', justifyContent: 'space-between' }}>
{m.image ? (
  <img 
    src={`${API_BASE_URL}${m.image}`} 
    alt={m.name} 
    style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "8px", marginBottom: "10px" }}
  />
) : (
  <div style={{ width: "100%", height: "120px", backgroundColor: "#f0f0f0", borderRadius: "8px", marginBottom: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
    <span style={{ color: "#aaa", fontSize: "12px" }}>No Image</span>
  </div>
)}

<div style={{ flexGrow: 1 }}>
  <h3 style={{ fontSize: "16px", margin: "0 0 5px 0" }}>{m.name}</h3>
  <p style={{ fontSize: "12px", color: "#666", margin: "0 0 5px 0" }}>{m.category}</p>
  <h4 style={{ color: "#007BFF", margin: "5px 0" }}>₹{m.price}</h4>
</div>

<button
className="confirm-booking-btn"
style={{ marginTop: "10px", width: "100%", padding: "8px" }}
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