import React, { useEffect, useState } from "react";
import Axios from "axios";
import { API_BASE_URL } from "../config";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import "./Mehndi.css";

import gobiImg from "../assets/Gobi-mehandhi.jpeg";
import erodeImg from "../assets/e-m-1.jpeg";
import salemImg from "../assets/s-m-1.jpeg";
import chennaiImg from "../assets/c-m-1.jpeg";
import tirupurImg from "../assets/t-m-1.jpeg";
import defaultImg from "../assets/mehandhi.jpeg";

import gobiImg1 from "../assets/Gobi-mehandhi.jpeg";
import gobiImg2 from "../assets/Gobi-m-2.jpeg";
import gobiImg3 from "../assets/Gobi-m-3.jpeg";
import erodeImg1 from "../assets/e-m-1.jpeg";
import erodeImg2 from "../assets/e-m-2.jpeg";
import erodeImg3 from "../assets/e-m-3.jpeg";
import chennaiImg1 from "../assets/c-m-1.jpeg";
import chennaiImg2 from "../assets/c-m-2.jpeg";
import salemImg1 from "../assets/s-m-1.jpeg";
import salemImg2 from "../assets/s-m-2.jpeg";
import tirupurImg1 from "../assets/t-m-1.jpeg";
import tirupurImg2 from "../assets/t-m-2.jpeg";

const locations = [
  { name: "All", key: "all", img: defaultImg },
  { name: "Gobi", key: "gobi", img: gobiImg },
  { name: "Erode", key: "erode", img: erodeImg },
  { name: "Salem", key: "salem", img: salemImg },
  { name: "Chennai", key: "chennai", img: chennaiImg },
  { name: "Tirupur", key: "tirupur", img: tirupurImg },
];

const mehndiDesigns = [
  { id: 1, name: "Gobi Mehndi Design 1", location: "gobi", img: gobiImg1, price: 5000 },
  { id: 2, name: "Gobi Mehndi Design 2", location: "gobi", img: gobiImg2, price: 6000 },
  { id: 3, name: "Gobi Mehndi Design 3", location: "gobi", img: gobiImg3, price: 8000 },
  { id: 4, name: "Erode Mehndi Design 1", location: "erode", img: erodeImg1, price: 8500 },
  { id: 5, name: "Erode Mehndi Design 2", location: "erode", img: erodeImg2, price: 7000 },
  { id: 6, name: "Erode Mehndi Design 3", location: "erode", img: erodeImg3, price: 6000 },
  { id: 7, name: "Salem Mehndi Design 1", location: "salem", img: salemImg1, price: 4000 },
  { id: 8, name: "Salem Mehndi Design 2", location: "salem", img: salemImg2, price: 9000 },
  { id: 9, name: "Chennai Mehndi Design 1", location: "chennai", img: chennaiImg1, price: 8000 },
  { id: 10, name: "Chennai Mehndi Design 2", location: "chennai", img: chennaiImg2, price: 7000 },
  { id: 11, name: "Tirupur Mehndi Design 1", location: "tirupur", img: tirupurImg1, price: 9000 },
  { id: 12, name: "Tirupur Mehndi Design 2", location: "tirupur", img: tirupurImg2, price: 6000 },
];

export default function Mehndi() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API (category=mehndi)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await Axios.get(`${API_BASE_URL}/products`, {
          params: { category: 'mehndi' }
        });
        if (mounted && Array.isArray(res.data?.products)) {
          setProducts(res.data.products);
        }
      } catch (e) {
        console.error('Failed to fetch mehndi products:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Listen for admin updates and refetch
  useEffect(() => {
    const handler = () => setTimeout(() => window.location.reload(), 50);
    const key = 'products:updatedAt';
    const listener = (e) => {
      if (e.key === key) handler();
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  // Derive items to show: prefer API products if available, else fallback to static
  const apiItems = products.map(p => ({
    id: p._id,
    name: p.name,
    location: (p.category || 'mehndi').toLowerCase(),
    img: p.imageUrl ? `${API_BASE_URL}${p.imageUrl}` : defaultImg,
    price: Number(p.price) || 0
  }));

  // Always include static designs so the page isn't sparse, and append any API items
  const baseItems = [...mehndiDesigns, ...apiItems];

  // Filter items by location selection
  const filteredDesigns =
    selectedLocation === "all"
      ? baseItems
      : baseItems.filter((d) => d.location === selectedLocation);

  // Handle add to cart
  const handleAddToCart = (design) => {
    addToCart({
      _id: `mehndi_${design.id}`,
      name: design.name,
      price: design.price,
      image: design.img,
      type: 'mehndi',
      quantity: 1
    });
    
    setNotification({
      show: true,
      message: `${design.name} added to cart!`
    });
    
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };
  
  // Handle view details
  const handleViewDetails = (design) => {
    navigate(`/mehndi/${design.id}`, { state: { design } });
  };
  const handleBookNow = (item) => {
    if (!bookedItems.find((i) => i.id === item.id)) {
      setBookedItems([...bookedItems, item]);
      setSuccessMsg("✅ Successfully added to your cart!");
      setTimeout(() => setSuccessMsg(""), 2000); // Hide after 2s
    }
  };

  return (
    <div className="mehndi-page">
      <h2>Mehndi Designs</h2>
      {loading && (
        <div className="text-muted" style={{ marginBottom: 12 }}>Loading designs...</div>
      )}
      
      {/* Category Filter */}
      <div className="location-container">
        {locations.map((loc) => (
          <div
            key={loc.key}
            className={`location ${selectedLocation === loc.key ? 'active' : ''}`}
            onClick={() => setSelectedLocation(loc.key)}
          >
            {loc.name}
          </div>
        ))}
      </div>

      {/* Success Message */}
      {notification.show && (
        <div className="success-message">
          {notification.message}
        </div>
      )}

      {/* Mehndi Designs Grid */}
      <div className="mehndi-container">
        {filteredDesigns.map((design) => (
          <div key={design.id} className="mehndi-card">
            <img 
              src={design.img} 
              alt={design.name}
              onClick={() => handleViewDetails(design)}
            />
            <div className="mehndi-card-content">
              <h3>{design.name}</h3>
              <p>{design.location.charAt(0).toUpperCase() + design.location.slice(1)}</p>
              <div className="mehndi-card-actions">
                <p className="price">₹{design.price.toLocaleString()}</p>
                <div className="action-buttons">
                  <button 
                    className="action-btn add-to-cart"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(design);
                    }}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="action-btn book-now"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(design);
                      navigate('/cart');
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
