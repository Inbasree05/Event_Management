import React, { useState } from "react";
import "./Signup.css";
import Axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state if available
  React.useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage("❌ Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setMessage("❌ Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await Axios.post("http://localhost:3000/auth/reset-password", {
        email,
        otp,
        newPassword
      });

      if (response.data.status) {
        setMessage("✅ " + response.data.message);
        // Navigate to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <input
          type="text"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          required
        />
        
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
        
        {message && <p className="signup-message">{message}</p>}
        
        <p>
          Remember your password? <Link to="/login">Login</Link>
        </p>
        
        <p>
          Didn't receive OTP? <Link to="/forgot-password">Resend OTP</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;






