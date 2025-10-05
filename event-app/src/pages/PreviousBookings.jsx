import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../styles/Checkout.css';

const PreviousBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const { user } = useAuth();

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !phone) {
      setError('Please provide both email and phone number');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get('http://localhost:3000/bookings', {
        params: { email, phone }
      });
      setBookings(response.data);
    } catch (err) {
      setError('Failed to fetch bookings. Please check your details and try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>View Previous Bookings</h2>
      
      <form onSubmit={handleSubmit} className="booking-form">
        <h3>Enter Your Details</h3>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>
        
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="Enter your phone number"
          />
        </div>
        
        <button 
          type="submit" 
          className="submit-booking-btn"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'View Bookings'}
        </button>
      </form>

      {bookings.length > 0 && (
        <div className="bookings-list">
          <h3>Your Bookings</h3>
          {bookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-header">
                <h4>Booking #{booking._id.slice(-6).toUpperCase()}</h4>
                <span className="booking-date">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="booking-details">
                <p><strong>Event Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Total Amount:</strong> ${booking.totalAmount?.toFixed(2)}</p>
                
                <div className="booking-items">
                  <h5>Items:</h5>
                  {booking.items?.map((item, index) => (
                    <div key={index} className="booking-item">
                      {item.name && <span>{item.name}</span>}
                      {item.price && <span>${item.price}</span>}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="booking-status">
                <span className="status-badge">Confirmed</span>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {bookings.length === 0 && !loading && !error && email && phone && (
        <div className="no-bookings">
          <p>No bookings found for the provided details.</p>
          <Link to="/" className="back-to-home">Back to Home</Link>
        </div>
      )}
    </div>
  );
};

export default PreviousBookings;
