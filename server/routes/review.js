const express = require('express');
const cors = require('cors');
const auth = require('../middleware/auth.js');
const Review = require('../models/Review.js');

const router = express.Router();

// CORS configuration for review routes
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-auth-token'],
  exposedHeaders: ['Authorization', 'x-auth-token']
};

// Apply CORS to all review routes
router.use(cors(corsOptions));
router.options('*', cors(corsOptions)); // Enable preflight for all routes

// @route   POST /reviews
// @desc    Create a new review
// @access  Private
router.post('/', auth.auth, async (req, res) => {
  console.log('\n=== Review Submission ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Headers:', {
    'x-auth-token': req.headers['x-auth-token'] ? '***token present***' : 'No token',
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'accept': req.headers['accept'],
    'origin': req.headers['origin'],
    'referer': req.headers['referer']
  });
  
  // Log raw body if available
  const rawBody = req.rawBody || 'No raw body available';
  console.log('Raw request body:', typeof rawBody === 'string' ? rawBody : 'Binary data');
  
  console.log('Parsed request body:', req.body);
  console.log('Request body type:', typeof req.body);
  console.log('Request body keys:', Object.keys(req.body));
  console.log('Authenticated User:', req.user);
  
  // Check if body parser worked correctly
  if (!req.body || Object.keys(req.body).length === 0) {
    console.error('WARNING: Request body is empty or was not parsed properly');
    return res.status(400).json({
      success: false,
      message: 'Invalid request body',
      details: 'Request body is empty or could not be parsed'
    });
  }
  
  if (!req.user || !req.user.id) {
    console.error('No user ID in request');
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }
  
  if (!req.body.vendorId || !req.body.vendorId.startsWith('decoration-')) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid vendor ID format. Must start with decoration-' 
    });
  }
  try {
    const { vendorId, rating, comment } = req.body;
    
    if (!vendorId || !rating || !comment) {
      console.error('Missing required fields:', { vendorId, rating, comment });
      return res.status(400).json({ 
        success: false, 
        message: 'Vendor ID, rating, and comment are required' 
      });
    }

    // Check if user already reviewed this vendor
    const existingReview = await Review.findOne({
      userId: req.user.id,
      vendorId
    });
    
    console.log('Existing review check:', existingReview ? 'Found' : 'Not found');

    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this vendor' });
    }

    const review = new Review({
      userId: req.user.id,
      vendorId,
      rating,
      comment
    });

    const savedReview = await review.save();
    
    // Populate user details
    await savedReview.populate('userId', 'name email');
    
    console.log('Review created successfully:', savedReview);
    
    // Return the review with user data
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: savedReview
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ 
      success: false,
      message: 'Failed to submit review',
      error: err.message 
    });
  }
});

// @route   GET /reviews/:vendorId
// @desc    Get reviews for a vendor
// @access  Public
router.get('/reviews/:decorationId', async (req, res) => {
  console.log('=== Fetching Reviews ===');
  const vendorId = `decoration-${req.params.decorationId}`;
  console.log('Processing request for vendor ID:', vendorId);
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ vendorId: vendorId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    console.log(`Found ${reviews.length} reviews for vendor ${vendorId}`);

    const total = await Review.countDocuments({ vendorId: vendorId });

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      }
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route   GET /api/reviews/stats/:vendorId
// @desc    Get review statistics for a vendor
// @access  Public
router.get('/stats/:vendorId', async (req, res) => {
  try {
    const { vendorId } = req.params;

    const stats = await Review.aggregate([
      {
        $match: { vendorId }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratings: {
            $push: '$rating'
          }
        }
      },
      {
        $project: {
          _id: 0,
          averageRating: { $round: ['$averageRating', 1] },
          totalReviews: 1,
          ratingDistribution: {
            $map: {
              input: [1, 2, 3, 4, 5],
              as: 'star',
              in: {
                star: '$$star',
                count: {
                  $size: {
                    $filter: {
                      input: '$ratings',
                      as: 'rating',
                      cond: { $eq: ['$$rating', '$$star'] }
                    }
                  }
                }
              }
            }
          }
        }
      }
    ]);

    const result = stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: [1, 2, 3, 4, 5].map(star => ({
        star,
        count: 0
      }))
    };

    res.json({
      success: true,
      data: result,
      count: 1
    });
  } catch (err) {
    console.error('Error fetching review stats:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router;
