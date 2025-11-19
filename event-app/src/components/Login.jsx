import React, { useState } from "react";
import "./Signup.css";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../config";

// Configure Axios defaults
Axios.defaults.withCredentials = true;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  // Normal login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Attempting login with:', { email });
      console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
      const response = await Axios.post(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      const { data } = response;
      setMessage(data.message);

      if (data.status && data.token) {
        // Get token from response data (it's also in the cookie)
        const token = data.token;
        const role = data.role;
        
        // Save to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("authToken", token); // for AuthContext persistence
        localStorage.setItem("role", role);
        localStorage.setItem("user", JSON.stringify({ email, role }));

        // Update auth context
        login(token, { email, role });

        // Check for redirect URL after login
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || 
                           (role === "admin" ? "/admin" : "/");
        
        // Clear the redirect URL from session storage
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Navigate to the intended URL or default
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      setError(error.response?.data?.message || 'Login failed. Please try again.');
      
      if (err.code === 'ERR_NETWORK') {
        setMessage("❌ Cannot connect to the server. Please make sure the backend server is running.");
      } else if (err.response) {
        // Server responded with an error status code
        if (err.response.status === 400) {
          setMessage("❌ " + (err.response.data?.message || "Invalid email or password"));
        } else if (err.response.status === 404) {
          setMessage("❌ Server endpoint not found. Please check the API URL.");
        } else {
          setMessage(`❌ Server error: ${err.response.status} - ${err.response.statusText}`);
        }
      } else {
        setMessage("❌ An unexpected error occurred. Please try again.");
      }
    }
  };

  // Google login
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) return;

      const decoded = JSON.parse(atob(credentialResponse.credential.split(".")[1]));
      const { email, name } = decoded;

      console.log('Attempting Google login with:', { email });
      console.log('Sending Google login request to:', `${API_BASE_URL}/auth/google-login`);
      const { data } = await Axios.post(
        `${API_BASE_URL}/auth/google-login`, 
        { email, name },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (data.status) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("authToken", data.token); // for AuthContext persistence
        localStorage.setItem("role", data.role);
        localStorage.setItem("user", JSON.stringify({ email, name, role: data.role }));
        login(data.token, { email, name, role: data.role });
        
        // Check for redirect URL after login
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || 
                           (data.role === "admin" ? "/admin" : "/");
        
        // Clear the redirect URL from session storage
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Navigate to the intended URL or default
        navigate(redirectPath);
      } else navigate("/");
    } catch (err) {
      console.error("Google Login Failed", err);
    }
  };

  return (
    <div className="signup-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
        {message && <p className="signup-message">{message}</p>}
        <p>
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
        <p>
          <Link to="/forgot-password">Forgot Password?</Link>
        </p>

        
          <GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={() => console.log("Google Login Failed")}
/>

      </form>
    </div>
  );
};

export default Login;