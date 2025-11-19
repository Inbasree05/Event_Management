import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, vendorId, vendorName }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}`,
        { vendorId, rating, comment },
        {
          headers: { 'x-auth-token': token }
        }
      );
      setComment('');
      // Refresh reviews after submission
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Please login to submit a review');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/${vendorId}`, {
        headers: token ? { 'x-auth-token': token } : {}
      });
      setReviews(response.data);
      setShowReviews(true);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error for unauthorized users, just log it
      if (error.response?.status !== 401) {
        console.error('Error fetching reviews:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h3>Reviews for {vendorName}</h3>
        
        <div className="tabs">
          <button 
            className={`tab ${!showReviews ? 'active' : ''}`}
            onClick={() => setShowReviews(false)}
          >
            Write a Review
          </button>
          <button 
            className={`tab ${showReviews ? 'active' : ''}`}
            onClick={() => {
              if (!showReviews) fetchReviews();
            }}
          >
            View Reviews ({reviews.length})
          </button>
        </div>

        {!showReviews ? (
          <form onSubmit={handleSubmit} className="review-form">
            <div className="rating-input">
              <label>Rating:</label>
              <select 
                value={rating} 
                onChange={(e) => setRating(Number(e.target.value))}
                disabled={isLoading}
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    {num} ★
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              disabled={isLoading}
              required
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="reviews-container">
            {reviews.length === 0 ? (
              <p>No reviews yet. Be the first to review!</p>
            ) : (
              reviews.map((review) => (
                <div key={review._id} className="review-item">
                  <div className="review-header">
                    <span className="review-rating">{'★'.repeat(review.rating)}</span>
                    <span className="review-user">
                      {review.userId?.name || 'Anonymous'}
                    </span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;
