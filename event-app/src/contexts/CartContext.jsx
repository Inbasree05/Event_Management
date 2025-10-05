import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  
  const getCartKey = () => {
    return user ? `cart_${user.id}` : 'cart_guest';
  };

  const [cartItems, setCartItems] = useState(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Update cart when user changes (logs in/out)
  useEffect(() => {
    const cartKey = getCartKey();
    const savedCart = localStorage.getItem(cartKey);
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  }, [user?.id]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user || getCartKey() === 'cart_guest') {
      const cartKey = getCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems, user?.id]);

  const addToCart = (event) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === event._id);
      if (existingItem) {
        return prevItems.map(item =>
          item._id === event._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevItems, { ...event, quantity: 1 }];
    });
  };

  const removeFromCart = (eventId) => {
    setCartItems(prevItems => prevItems.filter(item => item._id !== eventId));
  };

  const updateQuantity = (eventId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item._id === eventId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    // Clear from localStorage as well
    const cartKey = getCartKey();
    localStorage.removeItem(cartKey);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (total, item) => total + (item.price * item.quantity),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
