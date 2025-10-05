import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import ContactUs from "./components/ContactUs";
import Decoration from "./components/Decoration";
import Mehndi from "./components/Mehndi";
import Catering from "./components/Catering";
import Signup from './components/Signup';
import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './components/AdminDashboard';
import Cart from "./components/Cart";
import Checkout from "./pages/Checkout";
import BookingSuccess from "./pages/BookingSuccess";
import Orders from "./components/Orders";
import OrderForm from "./components/OrderForm";
import Footer from "./components/Footer";
import Makeup from "./components/Makeup";
import Photo from "./components/Photo";
import Venue from "./components/Venue";
import './App.css';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  if (!user) {
    // Store the intended URL before redirecting to login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    return <Navigate to="/login" state={{ from: 'checkout' }} />;
  }
  return children;
};

// Admin Route component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Or a loading spinner
  }
  
  const isAdmin = user && user.role === 'admin';
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/contactus" element={<ContactUs />} />
        
        {/* Event Category Pages */}
        <Route path="/decoration" element={<Decoration />} />
        <Route path="/mehandi" element={<Mehndi />} />
        <Route path="/catering" element={<Catering />} />
        <Route path="/makeup" element={<Makeup />} />
        <Route path="/photo" element={<Photo />} />
        <Route path="/venue" element={<Venue />} />
        {/* Cart & Checkout */}
        <Route path="/cart" element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />
        <Route path="/booking-success" element={
          <ProtectedRoute>
            <BookingSuccess />
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />
        {/* Auth Routes */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
      </Routes>
      <Footer />
    </>
  );
}

export default App;
