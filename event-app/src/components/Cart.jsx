import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import '../styles/Cart.css';
import { format } from 'date-fns';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    cartTotal, 
    clearCart 
  } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [dateError, setDateError] = useState(null);
  const navigate = useNavigate();

  // Check for any past event dates in cart
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const pastEvent = cartItems.find(item => {
      if (item.date) {
        const eventDate = new Date(item.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
      }
      return false;
    });

    if (pastEvent) {
      setDateError('One or more events in your cart have already passed. Please remove them before proceeding.');
    } else {
      setDateError(null);
    }
  }, [cartItems]);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <button onClick={() => navigate('/events')} className="btn-primary">
          Browse Events
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h2>Your Cart</h2>
      <div className="cart-items">
        {cartItems.map(item => (
          <div key={item._id} className="cart-item">
            <img 
              src={item.image} 
              alt={item.name} 
              className="cart-item-image"
            />
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              {item.date && (
                <p className="event-date">
                  Event Date: {format(new Date(item.date), 'MMM dd, yyyy')}
                </p>
              )}
              <div className="quantity-controls">
                <button 
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item._id)}
                className="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Order Summary</h3>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Tax (estimated)</span>
          <span>${(cartTotal * 0.1).toFixed(2)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${(cartTotal * 1.1).toFixed(2)}</span>
        </div>
        {dateError && (
          <div className="error-message">
            {dateError}
          </div>
        )}
        <button 
          onClick={handleCheckout} 
          className={`checkout-btn ${dateError ? 'disabled' : ''}`}
          disabled={isCheckingOut || dateError}
        >
          {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};

export default Cart;
