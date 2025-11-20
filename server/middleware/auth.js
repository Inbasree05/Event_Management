const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  console.log('=== Verify Admin Middleware ===');
  
  // First verify the user is authenticated
  auth(req, res, () => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }
      
      console.log('Admin access granted for user:', req.user.email);
      next();
    } catch (error) {
      console.error('Admin verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during admin verification'
      });
    }
  });
};

const auth = async (req, res, next) => {
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Preflight request - allowing CORS');
    return next();
  }

  console.log('=== Auth Middleware ===');
  console.log('Request Method:', req.method);
  console.log('Request Headers:', {
    'x-auth-token': req.headers['x-auth-token'] ? '***token present***' : 'No token',
    'authorization': req.headers['authorization'] ? '***authorization header present***' : 'No authorization header',
    'origin': req.headers['origin']
  });
  
  // Get token from Authorization header (Bearer), x-auth-token header, cookies, or query parameters
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && typeof authHeader === 'string' && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  }
  token = token || req.header('x-auth-token') || (req.cookies && req.cookies.token) || (req.query && req.query.token);
  
  // Check if no token
  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ 
      success: false, 
      message: 'No authentication token, authorization denied' 
    });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = decoded.user || decoded; // Handle both formats
    
    // Update lastActive timestamp for the user
    await User.findByIdAndUpdate(user.id, { 
      lastActive: new Date() 
    });
    
    // Attach user to request
    req.user = user;
    
    console.log('User authenticated:', { id: user.id, email: user.email });
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ 
      success: false, 
      message: 'Token is not valid or has expired' 
    });
  }
};

// Export all middleware
module.exports = { 
  auth, 
  verifyAdmin 
};
