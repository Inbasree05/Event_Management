import React, { useState, useRef, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

// Helper function to validate review data
const validateReviewData = (data) => {
  const errors = [];
  
  if (!data.vendorId || !data.vendorId.startsWith('decoration-')) {
    errors.push('Invalid vendor ID format');
  }
  
  if (!data.rating || isNaN(data.rating) || data.rating < 1 || data.rating > 5) {
    errors.push('Please select a rating between 1 and 5 stars');
  }
  
  const trimmedComment = data.comment?.trim() || '';
  
  if (trimmedComment.length === 0) {
    errors.push('Please share your thoughts in the review');
  } else if (trimmedComment.length < 10) {
    errors.push('Your review is too short. Please write at least 10 characters to help others.');
  } else if (trimmedComment.length > 1000) {
    errors.push('Your review is too long. Please keep it under 1000 characters.');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ===================== Review Modal =====================
const ReviewModal = React.memo(({ isOpen, onClose, decorationId, decorationName }) => {
  console.log('ReviewModal rendered with props:', { isOpen, decorationId, decorationName });
  const isMounted = useRef(true);
  
  // State for the form
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  });
  
  // State for UI
  const [isLoading, setIsLoading] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  // Fetch reviews and user's existing review
  const fetchReviews = React.useCallback(async () => {
    if (!isMounted.current) return;

    try {
      const authToken = localStorage.getItem("token");
      const url = `${API_BASE_URL}/api/reviews/reviews/${decorationId}`;
      console.log('Fetching reviews from:', url);
      
      try {
        const response = await axios.get(url, {
          headers: authToken
            ? {
                "x-auth-token": authToken,
                "Content-Type": "application/json",
              }
            : { "Content-Type": "application/json" },
          withCredentials: true,
          validateStatus: (status) => status < 500, // Don't throw for 404
        });

        console.log('Fetched reviews response:', {
          status: response.status,
          data: response.data,
          headers: response.headers,
        });

        if (isMounted.current) {
          // Handle the response data structure properly
          const responseData = response.data;
          const reviews = Array.isArray(responseData) 
            ? responseData 
            : responseData?.data || responseData?.reviews || [];
          
          console.log('Setting reviews:', reviews);
          setReviews(reviews);

          if (authToken) {
            // Find the current user's review
            const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
            const userId = tokenPayload.id;
            
            console.log('Looking for user review in:', reviews);
            const userReview = reviews.find(review => 
              review.userId?._id === userId || 
              review.userId === userId ||
              review.user === userId
            );
            
            console.log('Found user review:', userReview);
            setUserReview(userReview || null);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error.message);
        if (error.response?.status === 404) {
          console.log('No reviews found for this decoration yet');
          if (isMounted.current) {
            setReviews([]);
            setUserReview(null);
          }
        } else {
          console.error('Error fetching reviews:', error.message);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }, [decorationId]);

  // Initialize form with user's existing review when userReview changes
  useEffect(() => {
    if (userReview) {
      console.log('Initializing form with user review:', userReview);
      setFormData({
        rating: userReview.rating || 5,
        comment: userReview.comment || ''
      });
    } else {
      console.log('No existing review found, initializing empty form');
      setFormData({
        rating: 5,
        comment: ''
      });
    }
  }, [userReview]);

  // Set up effect to fetch reviews when modal opens
  useEffect(() => {
    isMounted.current = true;
    
    if (isOpen) {
      console.log('Modal opened, fetching reviews...');
      fetchReviews();
    }
    
    return () => {
      console.log('Cleaning up ReviewModal');
      isMounted.current = false;
    };
  }, [isOpen, fetchReviews]);

  // Submit review
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!formData.comment?.trim()) {
      console.log('Error: Comment is required');
      alert('Please enter a review comment');
      return;
    }
    
    if (!isMounted.current) {
      console.log('Component is not mounted, aborting');
      return;
    }

    try {
      console.log('Starting form submission');
      setIsLoading(true);
      
      // Get token from localStorage and verify it exists
      const authToken = localStorage.getItem("token");
      console.log('Auth token from localStorage:', authToken ? 'Token exists' : 'No token found');
      
      if (!authToken) {
        const errorMsg = 'No authentication token found. Please log in.';
        console.error(errorMsg);
        alert("Please login to submit a review");
        return;
      }
      
      // Verify token format
      let userId;
      try {
        const tokenParts = authToken.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        const payload = JSON.parse(atob(tokenParts[1]));
        console.log('Token payload:', payload);
        userId = payload.id;
        
        // Check if token is expired
        if (payload.exp && payload.exp < Date.now() / 1000) {
          throw new Error('Token has expired');
        }
      } catch (tokenError) {
        console.error('Token error:', tokenError);
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token");
        if (isMounted.current) {
          setIsLoading(false);
        }
        return;
      }

      const reviewData = {
        vendorId: `decoration-${decorationId}`,
        rating: Number(formData.rating),
        comment: formData.comment.trim(),
      };
      
      console.log('Submitting review data:', reviewData);

      // Validate review data before sending
      const validation = validateReviewData(reviewData);
      if (!validation.valid) {
        console.log('Validation failed:', validation.errors);
        // Show the first error to the user
        alert(validation.errors[0]);
        if (isMounted.current) {
          setIsLoading(false);
        }
        return;
      }

      console.log('Sending request with auth token:', authToken ? 'Token exists' : 'No token');
      console.log('Review data:', JSON.stringify(reviewData, null, 2));
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-auth-token': authToken
        },
        withCredentials: true,
      };
      
      console.log('Request config:', JSON.stringify(config, null, 2));
      
      let response;
      let requestUrl;
      let requestMethod;
      
      // First try to create a new review
      requestMethod = 'POST';
      requestUrl = `${API_BASE_URL}/api/reviews`;
      console.log(`Creating new review at ${requestUrl}`, { reviewData, config });
      
      // Add user ID to the review data if not present
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      const reviewWithUser = {
        ...reviewData,
        userId: payload.id // Ensure we're sending the user ID
      };
      
      console.log('Sending review data:', reviewWithUser);
      
      try {
        // First try to create a new review
        response = await axios.post(
          requestUrl,
          reviewWithUser,
          config
        );
        console.log('Create response:', response);
        alert("Thank you for your review!");
      } catch (error) {
        // If we get a 400 error with 'already reviewed' message, update the existing review
        if (error.response?.status === 400 && 
            error.response?.data?.msg?.includes('already reviewed')) {
          
          console.log('User has already reviewed this vendor, updating existing review');
          
          // First, fetch the user's existing review
          const reviewsResponse = await axios.get(
            `${API_BASE_URL}/api/reviews/reviews/${decorationId}`,
            config
          );
          
          const userReview = Array.isArray(reviewsResponse.data) 
            ? reviewsResponse.data.find(r => r.userId?._id === payload.id || r.userId === payload.id)
            : null;
          
          if (userReview?._id) {
            // Update the existing review
            requestMethod = 'PUT';
            requestUrl = `${API_BASE_URL}/api/reviews/${userReview._id}`;
            console.log(`Updating existing review at ${requestUrl}`, { reviewData, config });
            
            response = await axios.put(
              requestUrl,
              reviewData,
              config
            );
            console.log('Update response:', response);
            alert("Your review has been updated successfully!");
          } else {
            throw new Error('Could not find existing review to update');
          }
        } else {
          // Re-throw the error if it's not about an existing review
          throw error;
        }
      }

      // Refresh the reviews and form
      setFormData({
        rating: 5,
        comment: ''
      });
      await fetchReviews();
      setShowReviews(true);
    } catch (error) {
      console.error('Error submitting review:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 400) {
          const errorMessage = error.response.data?.message || 'Invalid review data';
          const validationErrors = error.response.data?.errors;
          
          if (validationErrors) {
            // Show the first validation error to the user
            const firstError = Object.values(validationErrors)[0];
            alert(`Validation error: ${firstError}`);
          } else {
            alert(`Error: ${errorMessage}. Please check your input and try again.`);
          }
        } else if (error.response.status === 401) {
          alert('Your session has expired. Please log in again to submit a review.');
          localStorage.removeItem('token');
          window.location.reload();
          return;
        } else if (error.response.status === 403) {
          alert('You do not have permission to perform this action.');
        } else if (error.response.status === 500) {
          alert('Server error. Please try again later.');
        } else {
          alert(`Error: ${error.response.status} - ${error.response.statusText}`);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        alert('No response from server. Please check your connection and try again.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <h2>Rate {decorationName}</h2>
        
        {userReview && (
          <div className="existing-review">
            <h3>Your Current Review</h3>
            <div className="review-item">
              <div className="review-header">
                <div className="review-rating">{"★".repeat(userReview.rating || 0)}</div>
                <span className="review-date">
                  {userReview.createdAt ? new Date(userReview.createdAt).toLocaleDateString() : 'Today'}
                </span>
              </div>
              <p className="review-comment">{userReview.comment || 'No comment provided'}</p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Rating:</label>
            <select 
              name="rating"
              value={formData.rating}
              onChange={handleInputChange}
              disabled={isLoading}
              className="rating-select"
            >
              {[5, 4, 3, 2, 1].map((num) => (
                <option key={num} value={num}>
                  {num} ★
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Review:</label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Share your experience..."
              disabled={isLoading}
              className="review-textarea"
              rows="4"
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="submit-review-btn"
          >
            {isLoading ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        <div className="reviews-section">
          <button 
            onClick={() => setShowReviews(!showReviews)}
            className="toggle-reviews-btn"
          >
            {showReviews ? 'Hide Reviews' : 'Show Reviews'}
          </button>
          
          {showReviews && (
            <div className="reviews-list">
              <h3>Reviews ({reviews.length})</h3>
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div key={review._id || index} className="review-item">
                    <div className="review-header">
                      <div className="review-rating">{"★".repeat(review.rating || 0)}</div>
                      <span className="review-date">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-comment">{review.comment || 'No comment provided'}</p>
                    {review.userId?.name && (
                      <div className="review-author">- {review.userId.name}</div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet. Be the first to review!</p>
              )}
            </div>
          )}
        </div>

        <button className="close-button" onClick={onClose} disabled={isLoading}>
          &times;
        </button>
      </div>
    </div>
  );
});

// ===================== Decoration Component =====================
const Decoration = () => {
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedDecoration, setSelectedDecoration] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Fetch decorations from backend (category=decoration)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/products`, { params: { category: 'decoration' } });
        if (mounted && Array.isArray(res.data?.products)) {
          setProducts(res.data.products);
        }
      } catch (e) {
        console.error('Failed to fetch decoration products:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Listen for admin updates and refresh
  useEffect(() => {
    const key = 'products:updatedAt';
    const listener = (e) => { if (e.key === key) window.location.reload(); };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  // Map API products to UI items
  const apiItems = products.map(p => ({
    id: p._id,
    name: p.name,
    location: (p.category || 'decoration').toLowerCase(),
    img: p.imageUrl ? `${API_BASE_URL}${p.imageUrl}` : defaultImg,
    price: Number(p.price) || 0
  }));

  // Prefer API items; fallback to static if none in DB
  const baseItems = apiItems.length > 0 ? apiItems : decorations;

  // Filter by location
  const filteredDecorations =
    selectedLocation === "all"
      ? baseItems
      : baseItems.filter((decoration) => decoration.location === selectedLocation);

  // Open/Close modal
  const handleReviewClick = (decoration) => {
    console.log('handleReviewClick called with decoration:', decoration);
    setSelectedDecoration(decoration);
    setShowReviewModal(true);
    console.log('showReviewModal should now be true, selectedDecoration:', decoration);
  };
  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedDecoration(null);
  };

  // Add to cart
  const handleAddToCart = (item) => {
    try {
      addToCart({
        _id: `decoration_${item.id}`,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.img,
        type: "decoration",
        location: item.location
      });
      setNotification({ show: true, message: `${item.name} added to cart!` });

      setTimeout(() => {
        setNotification({ show: false, message: "" });
      }, 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="decorations-container">
      <h1>Decoration Services</h1>

      {/* Location Filters */}
      <div className="location-filters">
        {locations.map((loc) => (
          <div
            key={loc.key}
            className={`location-card ${selectedLocation === loc.key ? "active" : ""}`}
            onClick={() => setSelectedLocation(loc.key)}
          >
            <img src={loc.img} alt={loc.name} />
            <span>{loc.name}</span>
          </div>
        ))}
      </div>

      {/* Notification */}
      {notification.show && (
        <div className="notification">
          {notification.message}
          <button className="view-cart-btn" onClick={() => navigate("/cart")}>
            View Cart
          </button>
        </div>
      )}

      {/* Decoration Cards */}
      <div className="decorations-grid">
        {loading && (
          <div className="text-muted" style={{ marginBottom: 12 }}>Loading decorations...</div>
        )}
        {filteredDecorations.map((item) => (
          <div key={item.id} className="decoration-card">
            <img src={item.img} alt={item.name} />
            <div className="decoration-info">
              <h3>{item.name}</h3>
              <p>
                Location: {item.location.charAt(0).toUpperCase() + item.location.slice(1)}
              </p>
              <div className="decoration-actions">
                <span className="price">₹{item.price.toLocaleString()}</span>
                <div className="action-buttons">
                  <button className="review-btn" onClick={() => handleReviewClick(item)}>
                    Reviews
                  </button>
                  <button className="add-to-cart-btn" onClick={() => handleAddToCart(item)}>
                    Add to Cart
                  </button>
                  <button
                    className="view-details-btn"
                    onClick={() => {
                      handleAddToCart(item);
                      navigate("/cart");
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

      {/* Review Modal */}
      {selectedDecoration && (
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
