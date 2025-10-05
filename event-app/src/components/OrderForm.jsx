import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import '../styles/OrderForm.css';

const OrderForm = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    eventDate: '',
    guests: 1,
    paymentMethod: 'credit',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    specialRequests: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && !bookingSuccess) {
      navigate('/events');
    }
  }, [cartItems, navigate, bookingSuccess]);

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

    try {
      const bookingData = {
        ...formData,
        items: cartItems.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        totalAmount: cartTotal,
        status: 'confirmed',
        bookingDate: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:3000/booking', bookingData);
      
      if (response.status === 201) {
        clearCart();
        setBookingSuccess(true);
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          navigate('/booking-success', { 
            state: { 
              bookingId: response.data.bookingId || 'N/A',
              ...formData 
            } 
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to process booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="booking-confirmation">
        <h2>🎉 Booking Confirmed!</h2>
        <p>Your event has been successfully booked. Redirecting you to the confirmation page...</p>
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      <h2>Complete Your Booking</h2>
      <div className="booking-layout">
        <div className="booking-summary">
          <h3>Booking Summary</h3>
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
            <span>Total Amount:</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="booking-details-form">
          <h3>Your Information</h3>
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3>Event Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Event Date</label>
              <input
                type="date"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="form-group">
              <label>Number of Guests</label>
              <input
                type="number"
                name="guests"
                min="1"
                value={formData.guests}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3>Billing Address</h3>
          <div className="form-group">
            <input
              type="text"
              name="address"
              placeholder="Street Address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="state"
                placeholder="State/Province"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="zipCode"
                placeholder="ZIP/Postal Code"
                value={formData.zipCode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <h3>Payment Information</h3>
          <div className="form-group">
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              required
            >
              <option value="credit">Credit Card</option>
              <option value="debit">Debit Card</option>
              <option value="bank">Bank Transfer</option>
            </select>
          </div>

          {formData.paymentMethod !== 'bank' && (
            <>
              <div className="form-group">
                <input
                  type="text"
                  name="cardNumber"
                  placeholder="Card Number"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    name="expiryDate"
                    placeholder="MM/YY"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    name="cvv"
                    placeholder="CVV"
                    value={formData.cvv}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <textarea
              name="specialRequests"
              placeholder="Special Requests (Optional)"
              value={formData.specialRequests}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="confirm-booking-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;