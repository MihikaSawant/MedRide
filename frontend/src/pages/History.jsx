import React,{useEffect,useState} from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function History(){

const [bookings,setBookings] = useState([]);

const user = JSON.parse(localStorage.getItem("user"));

useEffect(()=>{

axios.get(
`/api/bookings/history/${user._id}`
)
.then(res=>{
setBookings(res.data);
});

},[])

return(

<div>

<Navbar/>

<h2>Booking History</h2>

{bookings.map(b=>(
<div key={b._id}>

<p>Location: {b.location}</p>
<p>Hospital: {b.hospital}</p>
<p>Date: {b.date}</p>

</div>
))}

</div>

)

}

export default History;