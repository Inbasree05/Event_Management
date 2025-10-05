import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import "./Decorations.css";
import "./ReviewModal.css";
import { API_BASE_URL } from "../config";

// Configure axios defaults
axios.defaults.withCredentials = true;

// Import images
import gobiImg from "../assets/gobi1.jpeg";
import erodeImg from "../assets/erode.jpeg";
import salemImg from "../assets/salem.jpeg";
import chennaiImg from "../assets/chennai.jpeg";
import tirupurImg from "../assets/tirupur.jpeg";
import defaultImg from "../assets/default.jpeg";
import gobiDeco1 from "../assets/gobi-doc1.jpeg";
import erodeDeco1 from "../assets/erode-doc1.jpeg";
import salemDeco1 from "../assets/salem-doc1.jpeg";
import chennaiDeco1 from "../assets/chennai-doc1.jpeg";
import tirupurDeco1 from "../assets/tirupur-doc1.jpeg";
import gobiDeco2 from "../assets/gobi-doc2.jpeg";

const locations = [
  { name: "All", key: "all", img: defaultImg },
  { name: "Gobi", key: "gobi", img: gobiImg },
  { name: "Erode", key: "erode", img: erodeImg },
  { name: "Salem", key: "salem", img: salemImg },
  { name: "Chennai", key: "chennai", img: chennaiImg },
  { name: "Tirupur", key: "tirupur", img: tirupurImg },
];

const decorations = [
  { id: 1, name: "Gobi Decoration 1", location: "gobi", img: gobiDeco1, price: 10000 },
  { id: 2, name: "Erode Decoration 1", location: "erode", img: erodeDeco1, price: 8500 },
  { id: 3, name: "Salem Decoration 1", location: "salem", img: salemDeco1, price: 12000 },
  { id: 4, name: "Chennai Decoration 1", location: "chennai", img: chennaiDeco1, price: 15000 },
  { id: 5, name: "Tirupur Decoration 1", location: "tirupur", img: tirupurDeco1, price: 9000 },
  { id: 6, name: "Gobi Decoration 2", location: "gobi", img: gobiDeco2, price: 11000 },
];

// Review Modal Component
const ReviewModal = React.memo(({ isOpen, onClose, decorationId, decorationName }) => {
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const isMounted = useRef(true);

  const fetchReviews = async () => {
    if (!isMounted.current) return;
    
    try {
      const authToken = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/api/reviews/reviews/decoration-${decorationId}`,
        {
          headers: authToken ? { 
            'x-auth-token': authToken,
            'Content-Type': 'application/json' 
          } : { 'Content-Type': 'application/json' },
          withCredentials: true
        }
      );
      
      if (isMounted.current) {
        const reviewsData = response.data.reviews || [];
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReviews();
    }
    return () => {
      isMounted.current = false;
    };
  }, [isOpen, decorationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !isMounted.current) return;

    try {
      setIsLoading(true);
      const authToken = localStorage.getItem('token');
      
      if (!authToken) {
        alert('Please login to submit a review');
        return;
      }
      
      const reviewData = { 
        vendorId: `decoration-${decorationId}`,
        rating: Number(rating),
        comment: comment.trim()
      };

      const response = await axios.post(
        `${API_BASE_URL}/api/reviews`,
        reviewData,
        {
          headers: { 
            'x-auth-token': authToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );
      
      if (isMounted.current) {
        if (response.data && response.data.success) {
          alert('Thank you for your review!');
          setComment('');
          setRating(5);
          await fetchReviews();
          setShowReviews(true);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Rate {decorationName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating:</label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              disabled={isLoading}
            >
              {[5, 4, 3, 2, 1].map(num => (
                <option key={num} value={num}>{num} ★</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Review:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              disabled={isLoading}
              required
            />
          </div>
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
        
        <button 
          className="close-button" 
          onClick={onClose}
          disabled={isLoading}
        >
          Close
        </button>
      </div>
    </div>
  );
});

// Main Decoration Component
const Decoration = () => {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const filteredDecorations = selectedLocation === "all" 
    ? decorations 
    : decorations.filter(decoration => decoration.location === selectedLocation);

  const handleAddToCart = (item) => {
    try {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.img,
        type: 'decoration'
      });
      setNotification({
        show: true,
        message: `${item.name} added to cart!`
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleReviewClick = (decoration) => {
    setSelectedDecoration(decoration);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedDecoration(null);
  };

  return (
    <div className="decorations-container">
      <h1>Decoration Services</h1>
      
      {notification.show && (
        <div className="notification">
          {notification.message}
        </div>
      )}
      
      <div className="location-filters">
        {locations.map((location) => (
          <button
            key={location.key}
            className={`location-button ${selectedLocation === location.key ? 'active' : ''}`}
            onClick={() => setSelectedLocation(location.key)}
          >
            <img src={location.img} alt={location.name} />
            <span>{location.name}</span>
          </button>
        ))}
      </div>

      <div className="decorations-grid">
        {filteredDecorations.map((decoration) => (
          <div key={decoration.id} className="decoration-card">
            <img 
              src={decoration.img} 
              alt={decoration.name} 
              className="decoration-image"
              onClick={() => handleReviewClick(decoration)}
            />
            <div className="decoration-details">
              <h3>{decoration.name}</h3>
              <p className="price">₹{decoration.price.toLocaleString()}</p>
              <div className="button-group">
                <button 
                  className="review-button"
                  onClick={() => handleReviewClick(decoration)}
                >
                  View Reviews
                </button>
                <button 
                  className="add-to-cart-button"
                  onClick={() => handleAddToCart(decoration)}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showReviewModal && selectedDecoration && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={closeReviewModal}
          decorationId={selectedDecoration.id}
          decorationName={selectedDecoration.name}
        />
      )}
    </div>
  );
};

export default Decoration;
