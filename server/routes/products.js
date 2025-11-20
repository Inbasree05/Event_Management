const express = require('express');
const cors = require('cors');
const { ProductModel } = require('../models/Product');

const router = express.Router();

// CORS configuration for products route
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
  exposedHeaders: ['Authorization', 'x-auth-token']
};

// Apply CORS to all product routes
router.use(cors(corsOptions));
router.options('*', cors(corsOptions));

// Public endpoint: list products (optionally by category)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category && typeof category === 'string') {
      const trimmed = category.trim();
      if (trimmed.length > 0) {
        // Case-insensitive exact match for category
        filter.category = { $regex: new RegExp(`^${trimmed}$`, 'i') };
      }
    }
    const products = await ProductModel.find(filter).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error('Error fetching public products:', err);
    res.status(500).json({ status: false, message: 'Failed to fetch products' });
  }
});

module.exports = router;
