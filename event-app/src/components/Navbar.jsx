import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';
import logo from '../assets/logo.png';
import { FaShoppingCart } from 'react-icons/fa';

function Navbar() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isLoggedIn = !!user;
    const roleLabel = user?.role ? user.role.toUpperCase() : null;
    const { totalItems = 0 } = useCart() || {};

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <img src={logo} alt="WeddingVista" className="logo-img"/>
                <h2 className="logo">WeddingVista</h2>
            </div>

            <ul className="nav-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/aboutus">About</Link></li>
                <li><Link to="/contactus">Contactus</Link></li>
                {isLoggedIn && (
                    <li><Link to="/orders">Orders</Link></li>
                )}
                <li>
                    <Link to="/cart" className="cart-link">
                        <FaShoppingCart className="cart-icon" />
                        <span className="cart-text">Cart</span>
                        <span className="cart-badge">{totalItems > 0 ? totalItems : ''}</span>
                    </Link>
                </li>
            </ul>

            <div className="auth-buttons">
                {isLoggedIn ? (
                    <>
                        <span style={{color: "white", marginRight: "10px"}}>{roleLabel}</span>
                        <button 
                            onClick={handleLogout} 
                            className="btn logout-btn"
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="btn login-btn">Login</Link>
                        <Link to="/signup" className="btn signup-btn">Signup</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
