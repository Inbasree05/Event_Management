import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import '../styles/Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',     // ✅ ADDED
    date: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const bookingData = {
        ...formData,
        items: cartItems.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          image: item.image || item.imageUrl,
          location: item.location || 'N/A',
          quantity: item.quantity || 1,
          type: item.type || 'general',
          date: formData.date
        })),
        totalAmount: cartTotal
      };

      // Send booking to backend
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/booking`, bookingData, {
        headers: token ? { Authorization: `Bearer ${token}`, 'x-auth-token': token } : {},
        withCredentials: true
      });
      
      if (response.status === 201) {
        clearCart();
        navigate('/booking-success', { 
          state: { 
            bookingId: response.data.bookingId || 'N/A',
            ...formData 
          } 
        });
      }
    } catch (err) {
      console.error('Booking failed:', err);
      setError('Failed to process booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      <h2>Complete Your Booking</h2>
      
      <div className="checkout-content">
        <div className="booking-summary">
          <h3>Order Summary</h3>
          {cartItems.map(item => (
            <div key={item._id} className="booking-item">
              <img src={item.image} alt={item.name} className="booking-item-image" />
              <div>
                <h4>{item.name}</h4>
                <p>${item.price.toFixed(2)} x {item.quantity}</p>
              </div>
            </div>
          ))}
          <div className="booking-total">
            <h4>Total: ${cartTotal.toFixed(2)}</h4>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-form">
          <h3>Your Details</h3>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
            />
          </div>

          {/* ✅ NEW ADDRESS FIELD */}
          <div className="form-group">
            <label>Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Enter your full address"
              rows="3"
            ></textarea>
          </div>

          <div className="form-group">
            <label>Event Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <button 
            type="submit" 
            className="submit-booking-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
