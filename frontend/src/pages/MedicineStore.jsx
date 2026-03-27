import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../App.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5052';

function MedicineStore() {
  const [medicines, setMedicines] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [view, setView] = useState("store"); // store, cart, checkout, payment, success, history
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  useEffect(() => {
    fetchMedicines();
  }, []);

  useEffect(() => {
    if (view === "history") {
      fetchOrders();
    }
  }, [view]);

  const fetchMedicines = async () => {
    try {
      const res = await axios.get("/api/medicines");
      setMedicines(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("userToken");
      const res = await axios.get("/api/orders/my-orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const addToCart = (medicine) => {
    const existing = cart.find((item) => item._id === medicine._id);
    if (existing) {
      setCart(cart.map((item) => item._id === medicine._id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...medicine, quantity: 1 }]);
    }
    alert("Added " + medicine.name + " to cart!");
  };

  const updateQuantity = (id, amount) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + amount) };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item._id !== id));
  };

  const getSubtotal = () => cart.reduce((a, b) => a + (b.price * b.quantity), 0);
  const getTax = () => Math.round(getSubtotal() * 0.05); // 5% tax
  const getTotal = () => getSubtotal() + getTax();

  const placeOrder = async () => {
    try {
      const token = localStorage.getItem("userToken");
      await axios.post(
        "/api/orders",
        {
          medicines: cart.map((item) => ({
            medicine: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalPrice: getTotal(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCart([]);
      setView("success");
    } catch (err) {
      console.log(err);
      alert("Failed to place order.");
    }
  };

  return (
    <div className="mobile-wrapper">
      <div className="phone-screen">
        <Navbar />
        <div className="history-page">
          
          {/* HEADER SECTION FOR NAVIGATION */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "20px" }}>
              {view === "store" && "Medicine Store"}
              {view === "cart" && "Shopping Cart"}
              {view === "checkout" && "Checkout"}
              {view === "payment" && "Payment"}
              {view === "success" && "Order Placed"}
              {view === "history" && "Order History"}
            </h2>
            
            {view === "store" && (
              <div>
                <button onClick={() => setView("history")} style={{ marginRight: "10px", padding: "5px 10px", borderRadius: "5px", background: "#f0f0f0", border: "1px solid #ccc", cursor: "pointer" }}>
                  Orders
                </button>
                <button onClick={() => setView("cart")} style={{ padding: "5px 10px", borderRadius: "5px", background: "#007BFF", color: "#fff", border: "none", cursor: "pointer" }}>
                  Cart ({cart.reduce((a,b) => a + b.quantity, 0)})
                </button>
              </div>
            )}
          </div>

          {/* VIEW: STORE VIEW */}
          {view === "store" && (
            <>
              {medicines.length === 0 ? (
                <div className="empty-history-card">
                  <h3>No Medicines Available</h3>
                </div>
              ) : (
                <div className="history-list" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "15px", padding: "10px 0" }}>
                  {medicines.map((m) => (
                    <div className="history-card-modern" key={m._id} style={{ display: "flex", flexDirection: "column", padding: "10px", height: "100%", justifyContent: "space-between" }}>
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
                        <p style={{ fontSize: "12px", color: "#555", margin: "0 0 5px 0" }}>{m.description}</p>
                        <h4 style={{ color: "#007BFF", margin: "5px 0" }}>₹{m.price}</h4>
                      </div>
                      <button
                        className="confirm-booking-btn"
                        style={{ marginTop: "10px", width: "100%", padding: "8px" }}
                        onClick={() => addToCart(m)}
                        disabled={m.stock <= 0}
                      >
                        {m.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* VIEW: CART VIEW */}
          {view === "cart" && (
            <div>
              <button onClick={() => setView("store")} style={{ marginBottom: "15px", background: "none", border: "none", color: "#007BFF", cursor: "pointer" }}>← Back to Store</button>
              
              {cart.length === 0 ? (
                <div className="empty-history-card">
                  <h3>Your Cart is Empty</h3>
                </div>
              ) : (
                <div className="history-list">
                  {cart.map((item) => (
                    <div key={item._id} className="history-card-modern" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 5px 0" }}>{item.name}</h4>
                        <p style={{ margin: 0, color: "#666" }}>₹{item.price} each</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <button onClick={() => updateQuantity(item._id, -1)} style={{ padding: "5px 10px", cursor: "pointer" }}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item._id, 1)} style={{ padding: "5px 10px", cursor: "pointer" }}>+</button>
                        <button onClick={() => removeFromCart(item._id)} style={{ padding: "5px", background: "#ff4d4d", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>X</button>
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: "20px", padding: "15px", background: "#f9f9f9", borderRadius: "8px" }}>
                    <h3>Subtotal: ₹{getSubtotal()}</h3>
                    <button className="confirm-booking-btn" style={{ width: "100%", marginTop: "10px" }} onClick={() => setView("checkout")}>
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CHECKOUT VIEW */}
          {view === "checkout" && (
            <div>
              <button onClick={() => setView("cart")} style={{ marginBottom: "15px", background: "none", border: "none", color: "#007BFF", cursor: "pointer" }}>← Back to Cart</button>
              
              <div className="history-card-modern">
                <h3>Bill Summary</h3>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span>Items ({cart.length})</span>
                  <span>₹{getSubtotal()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", color: "#666" }}>
                  <span>Taxes (5%)</span>
                  <span>₹{getTax()}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #ccc", fontWeight: "bold", fontSize: "18px" }}>
                  <span>Total Payable</span>
                  <span>₹{getTotal()}</span>
                </div>
              </div>

              <div className="history-card-modern" style={{ marginTop: "15px" }}>
                <h3>Delivery Address</h3>
                <textarea 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)} 
                  placeholder="Enter your full address..." 
                  style={{ width: "100%", padding: "10px", borderRadius: "5px", border: "1px solid #ccc", minHeight: "80px" }}
                />
              </div>

              <button className="confirm-booking-btn" style={{ width: "100%", marginTop: "20px" }} onClick={() => {
                if(!address.trim()) { alert("Please enter delivery address"); return; }
                setView("payment");
              }}>
                Proceed to Payment
              </button>
            </div>
          )}

          {/* VIEW: PAYMENT VIEW */}
          {view === "payment" && (
            <div>
              <button onClick={() => setView("checkout")} style={{ marginBottom: "15px", background: "none", border: "none", color: "#007BFF", cursor: "pointer" }}>← Back to Checkout</button>
              
              <div className="history-card-modern">
                <h3>Select Payment Method</h3>
                
                <div style={{ margin: "15px 0" }}>
                  <label style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}>
                    <input type="radio" value="COD" checked={paymentMethod === "COD"} onChange={(e) => setPaymentMethod(e.target.value)} /> Cash on Delivery (COD)
                  </label>
                  <label style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}>
                    <input type="radio" value="UPI" checked={paymentMethod === "UPI"} onChange={(e) => setPaymentMethod(e.target.value)} /> UPI / Wallet (Mock)
                  </label>
                  <label style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}>
                    <input type="radio" value="CARD" checked={paymentMethod === "CARD"} onChange={(e) => setPaymentMethod(e.target.value)} /> Credit / Debit Card (Mock)
                  </label>
                </div>
              </div>

              <button className="confirm-booking-btn" style={{ width: "100%", marginTop: "20px", padding: "15px", fontSize: "16px" }} onClick={placeOrder}>
                Pay ₹{getTotal()} & Place Order
              </button>
            </div>
          )}

          {/* VIEW: SUCCESS VIEW */}
          {view === "success" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: "60px", color: "green", marginBottom: "20px" }}>✔</div>
              <h2>Order Placed Successfully!</h2>
              <p style={{ color: "#666", marginBottom: "30px" }}>Your medicines will be delivered to you shortly.</p>
              
              <button className="confirm-booking-btn" style={{ width: "100%", marginBottom: "15px" }} onClick={() => setView("history")}>
                View Order History
              </button>
              <button onClick={() => setView("store")} style={{ width: "100%", padding: "12px", background: "#f0f0f0", color: "#333", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                Continue Shopping
              </button>
            </div>
          )}

          {/* VIEW: HISTORY VIEW */}
          {view === "history" && (
            <div>
              <button onClick={() => setView("store")} style={{ marginBottom: "15px", background: "none", border: "none", color: "#007BFF", cursor: "pointer" }}>← Back to Store</button>
              
              {orders.length === 0 ? (
                <div className="empty-history-card">
                  <h3>No Orders Found</h3>
                </div>
              ) : (
                <div className="history-list">
                  {orders.map((o) => (
                    <div key={o._id} className="history-card-modern" style={{ marginBottom: "15px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "10px", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "bold", fontSize: "12px", color: "#888" }}>ID: {o._id.slice(-6).toUpperCase()}</span>
                        <span style={{ fontWeight: "bold", color: o.status === 'Completed' ? 'green' : '#ff9800' }}>{o.status || 'Pending'}</span>
                      </div>
                      
                      <div style={{ marginBottom: "10px" }}>
                        {o.medicines.map((m, i) => (
                          <div key={i} style={{ fontSize: "14px", marginBottom: "3px" }}>
                            {m.quantity}x {m.name}
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid #eee" }}>
                        <span style={{ fontSize: "12px", color: "#999" }}>{new Date(o.date).toLocaleDateString()}</span>
                        <span style={{ fontWeight: "bold" }}>Total: ₹{o.totalPrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default MedicineStore;
