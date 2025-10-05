import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import "./Photo.css";

// Import photography images
import gobi1 from "../assets/p-1.jpeg";
import gobi2 from "../assets/p-2.jpeg";
import gobi3 from "../assets/p-3.jpeg";

import erode1 from "../assets/p-4.jpeg";
import erode2 from "../assets/p-5.jpeg";

import chennai1 from "../assets/p-6.jpeg";
import chennai2 from "../assets/p-7.jpeg";

import salem1 from "../assets/p-8.jpeg";
import salem2 from "../assets/p-9.jpeg";

import tirupur1 from "../assets/p-10.jpeg";
import tirupur2 from "../assets/p-11.jpeg";

import defaultImg from "../assets/vedio.jpeg";

const locations = [
  { name: "All", key: "all", img: defaultImg },
  { name: "Gobi", key: "gobi", img: gobi1 },
  { name: "Erode", key: "erode", img: erode1 },
  { name: "Chennai", key: "chennai", img: chennai1 },
  { name: "Salem", key: "salem", img: salem1 },
  { name: "Tirupur", key: "tirupur", img: tirupur1 },
];

const photoPackages = [
  { id: 1, name: "Gobi Photo Package 1", location: "gobi", img: gobi1, price: 5000 },
  { id: 2, name: "Gobi Photo Package 2", location: "gobi", img: gobi2, price: 6000 },
  { id: 3, name: "Gobi Photo Package 3", location: "gobi", img: gobi3, price: 7000 },

  { id: 4, name: "Erode Photo Package 1", location: "erode", img: erode1, price: 6500 },
  { id: 5, name: "Erode Photo Package 2", location: "erode", img: erode2, price: 7500 },

  { id: 6, name: "Chennai Photo Package 1", location: "chennai", img: chennai1, price: 8000 },
  { id: 7, name: "Chennai Photo Package 2", location: "chennai", img: chennai2, price: 9000 },

  { id: 8, name: "Salem Photo Package 1", location: "salem", img: salem1, price: 5500 },
  { id: 9, name: "Salem Photo Package 2", location: "salem", img: salem2, price: 6500 },

  { id: 10, name: "Tirupur Photo Package 1", location: "tirupur", img: tirupur1, price: 7000 },
  { id: 11, name: "Tirupur Photo Package 2", location: "tirupur", img: tirupur2, price: 8000 },
];

export default function Photo() {
  const { addToCart } = useCart();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");

  // Filter by location
  const filteredPackages =
    selectedLocation === "all"
      ? photoPackages
      : photoPackages.filter((d) => d.location === selectedLocation);

  // Handle booking
  const handleAddToCart = (pkg) => {
    addToCart({
      _id: `photo_${pkg.id}`,
      name: pkg.name,
      price: pkg.price,
      image: pkg.img,
      type: 'photo',
      location: pkg.location,
      quantity: 1
    });
    setSuccessMsg(`✅ ${pkg.name} added to your cart!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };


  return (
    <div className="makeup-page">
      <h2>Choose Location</h2>
      <div className="location-container">
        {locations.map((loc) => (
          <div
            key={loc.key}
            className={`location ${selectedLocation === loc.key ? "active" : ""}`}
            onClick={() => setSelectedLocation(loc.key)}
          >
            <img src={loc.img} alt={loc.name} />
            <p>{loc.name}</p>
          </div>
        ))}
      </div>

      <h2>Photography Packages</h2>

      {/* ✅ Success message */}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <div className="makeup-container">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="makeup-card">
            <img src={pkg.img} alt={pkg.location} />
            <p>Location: {pkg.location}</p>
            <p>Price: ₹{pkg.price.toLocaleString()}</p>
            <button onClick={() => handleAddToCart(pkg)}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

