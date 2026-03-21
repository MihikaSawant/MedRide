import React from "react";

function Cart({cart}){

return(

<div>

<h2>Your Cart</h2>

{cart.map((item,index)=>(
<div key={index}>
{item.name} - ₹{item.price}
</div>
))}

</div>

);

}

export default Cart;