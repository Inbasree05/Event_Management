import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const BookingSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  // Redirect if no booking data is found
  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) return null;

  return (
    <div className="booking-success">
      <div className="success-icon">✓</div>
      <h2>Booking Confirmed!</h2>
      <p>Thank you for your booking, {state.name}!</p>
      
      <div className="booking-details">
        <h3>Booking Details</h3>
        <p><strong>Booking ID:</strong> {state.bookingId}</p>
        <p><strong>Email:</strong> {state.email}</p>
        <p><strong>Phone:</strong> {state.phone}</p>
        <p><strong>Date:</strong> {new Date(state.date).toLocaleDateString()}</p>
      </div>
      
      <p className="confirmation-message">
        A confirmation has been sent to your email. Please check your inbox.
      </p>
      
      <button 
        onClick={() => navigate('/')} 
        className="back-to-home"
      >
        Back to Home
      </button>
    </div>
  );
};

export default BookingSuccess;
