import React, { useState } from "react";
import "./Signup.css";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  if (!username || !email || !password) {
    setMessage("❌ All fields are required");
    return;
  }
  if (!emailRegex.test(email)) {
    setMessage("❌ Please enter a valid email (e.g., rose@gmail.com)");
    return;
  }

  try {
    const { data } = await Axios.post("http://localhost:3000/auth/signup", {
      username,
      email,
      password,
      role,
    });
    setMessage(data.message);
    if (data.status) setTimeout(() => navigate("/login"), 2000);
  } catch (err) {
    setMessage(err.response?.data?.message || "❌ Signup failed");
  }
};

  return (
    <div className="signup-container">
      <form className="sign-up-form" onSubmit={handleSubmit}>
        <h2>Signup</h2>
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        <label>Email:</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Signup</button>
        {message && <p className="signup-message">{message}</p>}
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;
