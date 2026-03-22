import React,{useEffect,useState} from "react";
import axios from "axios";
import "../App.css";

function AdminOrders(){

const [orders,setOrders] = useState([]);

useEffect(()=>{
fetchOrders();
},[]);

const fetchOrders = async()=>{

const token = localStorage.getItem("adminToken");
const res = await axios.get("/api/orders", {
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
});

setOrders(res.data);

};

const updateStatus = async(id,status)=>{

const token = localStorage.getItem("adminToken");
await axios.put(
`/api/orders/${id}/status`,
{status},
{
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
  },
}
);

fetchOrders();

};

return(

<div className="mobile-wrapper">
<div className="phone-screen">

<div className="admin-page">

<h2>Medicine Orders</h2>

{orders.map(o=>(

<div className="admin-booking-card" key={o._id}>

<p><b>User:</b> {o.user?.name}</p>
<p><b>Status:</b> {o.status}</p>

{o.medicines.map((m,i)=>(
<p key={i}>{m.name} x {m.quantity}</p>
))}

<button onClick={()=>updateStatus(o._id,"Accepted")}>
Accept
</button>

<button onClick={()=>updateStatus(o._id,"Dispatched")}>
Dispatch
</button>

<button onClick={()=>updateStatus(o._id,"Delivered")}>
Delivered
</button>

</div>

))}

</div>
</div>
</div>

);

}

export default AdminOrders;