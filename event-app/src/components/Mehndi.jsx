import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import Axios from "axios";
import { API_BASE_URL } from "../config";
import "./Mehndi.css";

import gobiImg from "../assets/Gobi-mehandhi.jpeg";
import erodeImg from "../assets/e-m-1.jpeg";
import salemImg from "../assets/s-m-1.jpeg";
import chennaiImg from "../assets/c-m-1.jpeg";
import tirupurImg from "../assets/t-m-1.jpeg";
import defaultImg from "../assets/mehandhi.jpeg";

import gobiImg1 from "../assets/Gobi-mehandhi.jpeg";
import gobiImg2 from "../assets/Gobi-m-2.jpeg";
import gobiImg3 from "../assets/gobi-m-3.jpeg";
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

// Mock mehndi artist data - professional mehndi artists
const localMehndiArtists = {
  'artist-1': {
    name: 'Fatima Sheikh',
    location: 'Chennai',      
    experience: '10 years',    
    specialty: ['Bridal Mehndi', 'Arabic Mehndi', 'Rajasthani Mehndi'],
    about: 'Fatima is a renowned mehndi artist with 10 years of experience in traditional bridal mehndi designs.',
    rating: 4.9,
    reviewCount: 156
  },
  'artist-2': {
    name: 'Priya Nair',
    location: 'Mumbai',        
    experience: '7 years',    
    specialty: ['Modern Mehndi', 'Jewellery Mehndi', 'Indo-Arabic'],
    about: 'Priya specializes in contemporary mehndi designs with a modern twist on traditional patterns.',
    rating: 4.7,
    reviewCount: 98
  },
  'artist-3': {
    name: 'Ayesha Khan',
    location: 'Bangalore',        
    experience: '12 years',    
    specialty: ['Traditional Bridal', 'Glitter Mehndi', 'Tattoo Style'],
    about: 'Ayesha is an expert in traditional bridal mehndi with exquisite detailing and modern techniques.',
    rating: 4.8,
    reviewCount: 134
  }
};

const mehndiDesigns = [
  { id: 1, name: "Gobi Mehndi Design 1", location: "gobi", img: gobiImg1, price: 5000, artistId: 'artist-1' },
  { id: 2, name: "Gobi Mehndi Design 2", location: "gobi", img: gobiImg2, price: 6000, artistId: 'artist-2' },
  { id: 3, name: "Gobi Mehndi Design 3", location: "gobi", img: gobiImg3, price: 8000, artistId: 'artist-3' },
  { id: 4, name: "Erode Mehndi Design 1", location: "erode", img: erodeImg1, price: 8500, artistId: 'artist-1' },
  { id: 5, name: "Erode Mehndi Design 2", location: "erode", img: erodeImg2, price: 7000, artistId: 'artist-2' },
  { id: 6, name: "Erode Mehndi Design 3", location: "erode", img: erodeImg3, price: 6000, artistId: 'artist-3' },
  { id: 7, name: "Salem Mehndi Design 1", location: "salem", img: salemImg1, price: 4000, artistId: 'artist-1' },
  { id: 8, name: "Salem Mehndi Design 2", location: "salem", img: salemImg2, price: 9000, artistId: 'artist-2' },
  { id: 9, name: "Chennai Mehndi Design 1", location: "chennai", img: chennaiImg1, price: 8000, artistId: 'artist-3' },
  { id: 10, name: "Chennai Mehndi Design 2", location: "chennai", img: chennaiImg2, price: 7000, artistId: 'artist-1' },
  { id: 11, name: "Tirupur Mehndi Design 1", location: "tirupur", img: tirupurImg1, price: 9000, artistId: 'artist-2' },
  { id: 12, name: "Tirupur Mehndi Design 2", location: "tirupur", img: tirupurImg2, price: 6000, artistId: 'artist-3' },
];

export default function Mehndi() {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [products, setProducts] = useState([]);
  const [artists, setArtists] = useState(localMehndiArtists);
  const [loading, setLoading] = useState(true);

  // Fetch artists data
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const response = await Axios.get(`${API_BASE_URL}/api/artists`);
        if (response.data.success) {
          // Convert array to object with _id as key for easy lookup
          const backendArtistsObj = {};
          response.data.data.forEach(artist => {
            backendArtistsObj[artist._id] = artist;
          });
          // Merge with local artists, giving priority to backend data for matching IDs
          const mergedArtists = { ...localMehndiArtists, ...backendArtistsObj };
          setArtists(mergedArtists);
        }
      } catch (error) {
        console.error('Error fetching artists:', error);
        // If API fails, use local artists data
        setArtists(localMehndiArtists);
      }
    };

    fetchArtists();
  }, []);

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
        {filteredDesigns.map((design) => {
          const artist = artists[design.artistId];
          return (
            <div key={design.id} className="mehndi-card">
              <img
                src={design.img}
                alt={design.name}
                onClick={() => handleViewDetails(design)}
              />
              <div className="mehndi-card-content">
                <h3>{design.name}</h3>
                <p>{design.location.charAt(0).toUpperCase() + design.location.slice(1)}</p>
                
                {/* Artist Information */}
                <Link
                  to={`/artist/${design.artistId}`}
                  state={{
                    artistData: {
                      ...artist,
                      portfolioImages: [design.img],
                      price: `₹${design.price.toLocaleString()}`,
                      location: design.location
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
          );
        })}
      </div>
    </div>
  );
}
