import React, { useState } from "react";
import { useCart } from "../contexts/CartContext";
import "./Catering.css";

// Import catering images
import gobi1 from "../assets/c-1.jpeg";
import gobi2 from "../assets/c-2.jpeg";
import gobi3 from "../assets/c-3.jpeg";

import erode1 from "../assets/c-4.jpeg";
import erode2 from "../assets/c-5.jpeg";

import chennai1 from "../assets/c-6.jpeg";
import chennai2 from "../assets/c-7.jpeg";

import salem1 from "../assets/c-8.jpeg";
import salem2 from "../assets/c-9.jpeg";

import tirupur1 from "../assets/c-10.jpeg";
import tirupur2 from "../assets/c-11.jpeg";

import defaultImg from "../assets/catering.jpeg";

const locations = [
  { name: "All", key: "all", img: defaultImg },
  { name: "Gobi", key: "gobi", img: gobi1 },
  { name: "Erode", key: "erode", img: erode1 },
  { name: "Chennai", key: "chennai", img: chennai1 },
  { name: "Salem", key: "salem", img: salem1 },
  { name: "Tirupur", key: "tirupur", img: tirupur1 },
];

const cateringPackages = [
  { id: 1, name: "Gobi Catering Package 1", location: "gobi", img: gobi1, price: 5000 },
  { id: 2, name: "Gobi Catering Package 2", location: "gobi", img: gobi2, price: 6000 },
  { id: 3, name: "Gobi Catering Package 3", location: "gobi", img: gobi3, price: 7000 },

  { id: 4, name: "Erode Catering Package 1", location: "erode", img: erode1, price: 6500 },
  { id: 5, name: "Erode Catering Package 2", location: "erode", img: erode2, price: 7500 },

  { id: 6, name: "Chennai Catering Package 1", location: "chennai", img: chennai1, price: 8000 },
  { id: 7, name: "Chennai Catering Package 2", location: "chennai", img: chennai2, price: 9000 },

  { id: 8, name: "Salem Catering Package 1", location: "salem", img: salem1, price: 5500 },
  { id: 9, name: "Salem Catering Package 2", location: "salem", img: salem2, price: 6500 },

  { id: 10, name: "Tirupur Catering Package 1", location: "tirupur", img: tirupur1, price: 7000 },
  { id: 11, name: "Tirupur Catering Package 2", location: "tirupur", img: tirupur2, price: 8000 },
];

// Predefined Indian food items to select from
const indianFoodItems = [
  "Biryani",
  "Paneer Butter Masala",
  "Butter Naan",
  "Masala Dosa",
  "Idli & Sambar",
  "Chole Bhature",
  "Pav Bhaji",
  "Veg Pulao",
  "Chicken Curry",
  "Mutton Rogan Josh",
  "Fish Fry",
  "Dal Tadka",
  "Jeera Rice",
  "Gulab Jamun",
  "Jalebi",
  "Rasgulla",
];

export default function Catering() {
  const { addToCart } = useCart();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  // Track selected Indian items per package id
  const [selectedItemsByPkg, setSelectedItemsByPkg] = useState({});

  // Filter by location
  const filteredPackages =
    selectedLocation === "all"
      ? cateringPackages
      : cateringPackages.filter((d) => d.location === selectedLocation);

  // Toggle checkbox for a given pkg
  const toggleItemForPackage = (pkgId, item) => {
    setSelectedItemsByPkg((prev) => {
      const existing = prev[pkgId] || [];
      const exists = existing.includes(item);
      const updated = exists ? existing.filter((i) => i !== item) : [...existing, item];
      return { ...prev, [pkgId]: updated };
    });
  };

  // Handle add to cart
  const handleAddToCart = (pkg) => {
    addToCart({
      _id: `catering_${pkg.id}`,
      name: pkg.name,
      price: pkg.price,
      image: pkg.img,
      type: 'catering',
      location: pkg.location,
      quantity: 1,
      selectedItems: selectedItemsByPkg[pkg.id] || [],
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

      <h2>Catering Packages</h2>

      {/* ✅ Success message */}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <div className="makeup-container">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="makeup-card">
            <img src={pkg.img} alt={pkg.location} />
            <p>Location: {pkg.location}</p>
            <p>Price: ₹{pkg.price.toLocaleString()}</p>
            <div className="food-select">
              <p>Select menu items:</p>
              <div className="checkbox-grid">
                {indianFoodItems.map((item) => {
                  const checkboxId = `pkg-${pkg.id}-item-${item}`;
                  const checked = (selectedItemsByPkg[pkg.id] || []).includes(item);
                  return (
                    <label key={item} htmlFor={checkboxId} className="checkbox-item">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleItemForPackage(pkg.id, item)}
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
              {(selectedItemsByPkg[pkg.id] || []).length > 0 && (
                <small>{(selectedItemsByPkg[pkg.id] || []).length} selected</small>
              )}
            </div>
            <button onClick={() => handleAddToCart(pkg)}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

