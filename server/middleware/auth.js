import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const auth = async (req, res, next) => {
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
  token = token || req.header('x-auth-token') || req.cookies.token || req.query.token;
  
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
    await UserModel.findByIdAndUpdate(user.id, { 
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

// Add named export for auth middleware
export default { auth };
