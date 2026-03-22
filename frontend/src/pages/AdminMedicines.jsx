import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function AdminMedicines() {

  const [medicines, setMedicines] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.get("/api/medicines", {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      setMedicines(res.data);

    } catch (error) {

      console.log("Medicine fetch error:", error);

    }
  };

  const addMedicine = async () => {

    if (!name || !price || !stock) {
      alert("Please fill required fields");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      await axios.post("/api/medicines", {
        name,
        category,
        price,
        stock,
        description
      }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      alert("Medicine added");

      setName("");
      setCategory("");
      setPrice("");
      setStock("");
      setDescription("");

      fetchMedicines();

    } catch (error) {

      console.log("Add medicine error:", error);

    }
  };

  const deleteMedicine = async (id) => {

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`/api/medicines/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      fetchMedicines();

    } catch (error) {

      console.log("Delete error:", error);

    }
  };

  return (

    <div className="mobile-wrapper">

      <div className="phone-screen">

        <div className="admin-page">

          <div className="admin-hero">

            <h2>Medicine Management</h2>

            <p>
              Add medicines, manage stock, and control what users can order.
            </p>

          </div>

          <div className="admin-booking-card">

            <h3>Add Medicine</h3>

            <div className="admin-form-group">
              <label>Medicine Name</label>
              <input
                type="text"
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Category</label>
              <input
                type="text"
                value={category}
                onChange={(e)=>setCategory(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e)=>setPrice(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e)=>setStock(e.target.value)}
              />
            </div>

            <div className="admin-form-group">
              <label>Description</label>
              <input
                type="text"
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
              />
            </div>

            <button className="admin-save-btn" onClick={addMedicine}>
              Add Medicine
            </button>

          </div>


          <div style={{marginTop:"20px"}}>

            {medicines.length === 0 ? (

              <div className="admin-empty-card">

                <h3>No Medicines</h3>

                <p>Add medicines to show them in the user app.</p>

              </div>

            ) : (

              medicines.map((med)=>(
                
                <div key={med._id} className="admin-booking-card">

                  <h3>{med.name}</h3>

                  <p><b>Category:</b> {med.category}</p>
                  <p><b>Price:</b> ₹{med.price}</p>
                  <p><b>Stock:</b> {med.stock}</p>
                  <p><b>Description:</b> {med.description}</p>

                  <button
                    className="delete-report-btn"
                    onClick={()=>deleteMedicine(med._id)}
                  >
                    Delete
                  </button>

                </div>

              ))

            )}

          </div>

        </div>

      </div>

    </div>

  );

}

export default AdminMedicines;