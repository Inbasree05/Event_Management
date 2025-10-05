
import React, { useState } from "react";
import "./Signup.css";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await Axios.post("http://localhost:3000/auth/forgot-password", {
        email
      });

      if (response.data.status) {
        setMessage("✅ " + response.data.message);
        // Navigate to reset password page after 2 seconds
        setTimeout(() => {
          navigate('/reset-password', { state: { email } });
        }, 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Forgot Password</h2>
        
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </button>
        
        {message && <p className="signup-message">{message}</p>}
        
        <p>
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
