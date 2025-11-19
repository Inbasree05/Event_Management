import React, { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { Link } from 'react-router-dom';
import "./Makeup.css";   
import { API_BASE_URL } from "../config";
import axios from 'axios';

// Import makeup images
import gobi1 from "../assets/g-b-1.jpeg";
import gobi2 from "../assets/g-b-2.jpeg";
import gobi3 from "../assets/g-b-3.jpeg";

import erode1 from "../assets/e-b-1.jpeg";
import erode2 from "../assets/e-b-2.jpeg";

import chennai1 from "../assets/c-b-1.jpeg";
import chennai2 from "../assets/c-b-2.jpeg";

import salem1 from "../assets/s-b-1.jpeg";
import salem2 from "../assets/s-b-2.jpeg";

import tirupur1 from "../assets/t-b-1.jpeg";
import tirupur2 from "../assets/t-b-2.jpeg";

import defaultImg from "../assets/makeup.jpeg";

const locations = [
  { name: "All", key: "all", img: defaultImg },
  { name: "Gobi", key: "gobi", img: gobi1 },
  { name: "Erode", key: "erode", img: erode1 },
  { name: "Chennai", key: "chennai", img: chennai1 },
  { name: "Salem", key: "salem", img: salem1 },
  { name: "Tirupur", key: "tirupur", img: tirupur1 },
];

// Mock artist data - this would ideally come from your backend
const localArtists = {
  'john-doe': {
    name: 'Kavita Verma',
    location: 'Chennai',      
    experience: '8 years',    
    specialty: ['Bridal Makeup', 'Traditional Makeup', 'HD Makeup'],
    about: 'Kavita is a professional makeup artist with over 8 years of experience in bridal makeup. She specializes in traditional and HD bridal looks.',
    rating: 4.8,
    reviewCount: 127
  },
  'jane-smith': {
    name: 'Anjali Reddy',
    location: 'Erode',        
    experience: '5 years',    
    specialty: ['Party Makeup', 'Bridal Makeup', 'Airbrush Makeup'],
    about: 'Anjali is known for her creative and elegant makeup styles. She excels in both contemporary and traditional looks.',
    rating: 4.6,
    reviewCount: 89
  }
};

const makeupDesigns = [
  { 
    id: 1, 
    name: "Gobi Bridal Makeup 1", 
    location: "gobi", 
    img: gobi1, 
    price: 5000,
    artistId: 'john-doe'
  },
  { 
    id: 2, 
    name: "Gobi Bridal Makeup 2", 
    location: "gobi", 
    img: gobi2, 
    price: 6000,
    artistId: 'jane-smith'
  },
  { 
    id: 3, 
    name: "Gobi Bridal Makeup 3", 
    location: "gobi", 
    img: gobi3, 
    price: 7000,
    artistId: 'john-doe'
  },
  { 
    id: 4, 
    name: "Erode Bridal Makeup 1", 
    location: "erode", 
    img: erode1, 
    price: 6500,
    artistId: 'jane-smith'
  },
  { 
    id: 5, 
    name: "Erode Bridal Makeup 2", 
    location: "erode", 
    img: erode2, 
    price: 7500,
    artistId: 'john-doe'
  },
  { 
    id: 6, 
    name: "Chennai Bridal Makeup 1", 
    location: "chennai", 
    img: chennai1, 
    price: 8000,
    artistId: 'jane-smith'
  },
  { 
    id: 7, 
    name: "Chennai Bridal Makeup 2", 
    location: "chennai", 
    img: chennai2, 
    price: 9000,
    artistId: 'john-doe'
  },
  { 
    id: 8, 
    name: "Salem Bridal Makeup 1", 
    location: "salem", 
    img: salem1, 
    price: 5500,
    artistId: 'jane-smith'
  },
  { 
    id: 9, 
    name: "Salem Bridal Makeup 2", 
    location: "salem", 
    img: salem2, 
    price: 6500,
    artistId: 'john-doe'
  },
  { 
    id: 10, 
    name: "Tirupur Bridal Makeup 1", 
    location: "tirupur", 
    img: tirupur1, 
    price: 7000,
    artistId: 'jane-smith'
  },
  { 
    id: 11, 
    name: "Tirupur Bridal Makeup 2", 
    location: "tirupur", 
    img: tirupur2, 
    price: 8000,
    artistId: 'john-doe'
  },
];

export default function Makeup() {
  const { addToCart } = useCart();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [successMsg, setSuccessMsg] = useState("");
  const [backendItems, setBackendItems] = useState([]);
  const [artists, setArtists] = useState(localArtists);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch artists data
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/artists`);
        if (response.data.success) {
          // Convert array to object with _id as key for easy lookup
          const backendArtistsObj = {};
          response.data.data.forEach(artist => {
            backendArtistsObj[artist._id] = artist;
          });
          // Merge with local artists, giving priority to backend data for matching IDs
          const mergedArtists = { ...localArtists, ...backendArtistsObj };
          setArtists(mergedArtists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        // If API fails, use local artists data
        setArtists(localArtists);
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Fetch admin-created products for Bridal Makeup & Hair
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const category = encodeURIComponent('Bridal Makeup & Hair');
        const res = await fetch(`${API_BASE_URL}/products?category=${category}`);
        const data = await res.json();
        let items = Array.isArray(data.products) ? data.products : [];
        // Fallback: if none returned (due to inconsistent category values), fetch all and filter client-side
        if (!items.length) {
          const resAll = await fetch(`${API_BASE_URL}/products`);
          const dataAll = await resAll.json();
          const norm = (s = '') => s.toString().trim().toLowerCase();
          const targets = new Set([
            'bridal makeup & hair',
            'bridal makeup and hair',
            'bridal makeup',
            'makeup & hair'
          ]);
          items = (Array.isArray(dataAll.products) ? dataAll.products : []).filter(p => targets.has(norm(p.category)));
        }
        // Sort by createdAt ascending so newest appear last
        items.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        setBackendItems(items);
      } catch (e) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter by location
  const filteredDesigns =
    selectedLocation === "all"
      ? makeupDesigns
      : makeupDesigns.filter((d) => d.location === selectedLocation);

  // Handle add to cart
  const handleAddToCart = (item) => {
    addToCart({
      _id: `makeup_${item.id}`,
      name: item.name,
      price: item.price,
      image: item.img,
      type: 'makeup',
      location: item.location,
      quantity: 1
    });
    setSuccessMsg(`✅ ${item.name} added to your cart!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  // Add to cart for backend product
  const handleAddBackendToCart = (p) => {
    addToCart({
      _id: p._id,
      name: p.name,
      price: p.price,
      image: p.imageUrl,
      type: 'makeup',
      location: p.category || 'N/A',
      quantity: 1
    });
    setSuccessMsg(`✅ ${p.name} added to your cart!`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const resolveImage = (src) => {
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;
    if (src.startsWith('/uploads') || src.startsWith('uploads/')) {
      const normalized = src.startsWith('/') ? src : `/${src}`;
      return `${API_BASE_URL}${normalized}`;
    }
    return src;
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

      <h2>Makeup Designs</h2>

      {/* ✅ Success message */}
      {successMsg && <div className="success-message">{successMsg}</div>}

      <div className="makeup-container">
        {filteredDesigns.map((item) => {
          const artist = artists[item.artistId];
          return (
            <div key={item.id} className="makeup-card">
              <img src={item.img} alt={item.location} />
              <h3>{item.name}</h3>
              <p>Location: {item.location}</p>
              <p>Price: ₹{item.price.toLocaleString()}</p>
              <Link 
                to={`/artist/${item.artistId}`} 
                state={{ 
                  artistData: {
                    ...artist,
                    portfolioImages: [item.img], // Include the current makeup image in the portfolio
                    price: `₹${item.price.toLocaleString()}`,
                    location: item.location
                  } 
                }} 
                className="artist-info-link"
              >
                <div className="artist-info">
                  {artist ? (
                    <>
                      <div className="artist-header">
                        <i className="fas fa-user-circle artist-icon"></i>
                        <div>
                          <p className="artist-name">{artist.name || 'Professional Artist'}</p>
                          {artist.experience && <p className="artist-experience">⭐ {artist.experience} experience</p>}
                        </div>
                      </div>
                      {artist.specialty && Array.isArray(artist.specialty) && artist.specialty.length > 0 && (
                        <p className="artist-specialty">
                          <i className="fas fa-star"></i> {artist.specialty.join(' • ')}
                        </p>
                      )}
                      {artist.rating && (
                        <div className="artist-rating">
                          {[...Array(5)].map((_, i) => (
                            <i 
                              key={i} 
                              className={`fas fa-star ${i < Math.floor(artist.rating) ? 'filled' : ''}${i === Math.floor(artist.rating) && artist.rating % 1 > 0 ? ' half' : ''}`}
                            ></i>
                          ))}
                          <span className="rating-text">{artist.rating} ({artist.reviewCount || 0} reviews)</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="artist-default">
                      <i className="fas fa-user-circle"></i>
                      <span>View Artist Profile</span>
                    </div>
                  )}
                </div>
                <div className="view-profile-link">
                  View Full Profile <i className="fas fa-arrow-right"></i>
                </div>
              </Link>
              <button onClick={() => handleAddToCart(item)}>Add to cart</button>
            </div>
          );
        })}
      </div>

      {/* Backend Products: Bridal Makeup & Hair (rendered after static to appear at bottom) */}
      <div className="makeup-container">
        {loading && <p>Loading products...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && backendItems.map((p) => (
          <div key={p._id} className="makeup-card">
            <img src={resolveImage(p.imageUrl)} alt={p.name} />
            <p>{p.name}</p>
            <p>Price: ₹{Number(p.price || 0).toLocaleString()}</p>
            <button onClick={() => handleAddBackendToCart(p)}>Add to cart</button>
          </div>
        ))}
      </div>
    </div>
  );
}

