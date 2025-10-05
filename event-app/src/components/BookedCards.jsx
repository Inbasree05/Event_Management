import React, { useState, useMemo } from "react";
import "./BookedCards.css";

export default function BookedCards({ bookedItems, setBookedItems }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
  });

  // Calculate total price
  const totalAmount = useMemo(() => {
    return bookedItems.reduce(
      (acc, item) => acc + Number(item.price.replace(/[^\d]/g, "")),
      0
    );
  }, [bookedItems]);

  // Remove item
  const handleRemove = (id) => {
    setBookedItems(bookedItems.filter((item) => item.id !== id));
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bookedItems.length === 0) {
      alert("No items booked!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: bookedItems,
          totalAmount,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Booking saved successfully!");
        setBookedItems([]);
        setFormData({ name: "", email: "", phone: "", date: "" });
      } else {
        alert("Booking failed: " + data.message);
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="booked-cards-container">
      <h2>Booked Items</h2>
      {bookedItems.length === 0 ? (
        <p>No items booked yet.</p>
      ) : (
        <>
          <div className="booked-cards">
            {bookedItems.map((item) => (
              <div key={item.id} className="booked-card">
                <img src={item.img} alt={item.location} />
                <p>Location: {item.location}</p>
                <p>Price: {item.price}</p>
                <button onClick={() => handleRemove(item.id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="booking-form">
            <h3>Booking Form</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />

              <h4>Total Amount: ₹{totalAmount}</h4>

              <button type="submit">Confirm Booking</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}