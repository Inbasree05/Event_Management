const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/user');
const bookingRoutes = require('./routes/booking');
const reviewRoutes = require('./routes/review');
const productsRoutes = require('./routes/products');
const artistRoutes = require('./routes/artist');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`\n=== New Request ===`);
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (Object.keys(req.body).length > 0) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('Cookies:', req.cookies);
  console.log('===================\n');
  next();
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', 
    'http://127.0.0.1:5173',
    'https://event-management-9f3pfl3jy-inbasrees-projects.vercel.app',
    'https://event-management-pt7gfhifb-inbasrees-projects.vercel.app',
    'https://*.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'x-auth-token'],
  optionsSuccessStatus: 200
};

// Enable CORS pre-flight
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/artists', artistRoutes);

// Frontend routes (without /api prefix to match existing frontend calls)
app.use('/products', productsRoutes);
app.use('/auth', userRoutes);
app.use('/booking', bookingRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'Server is running',
    availableRoutes: {
      products: '/api/products',
      users: '/api/users',
      bookings: '/api/bookings',
      artists: '/api/artists',
      reviews: '/api/reviews',
      frontendProducts: '/products',
      auth: '/auth',
      booking: '/booking'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});

module.exports = app;
