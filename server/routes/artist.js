const express = require('express');
const { Artist } = require('../models/Artist');
const { auth, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all artists
router.get('/', async (req, res) => {
  try {
    const { location, specialty, search, page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    if (location) {
      query.location = new RegExp(location, 'i');
    }
    
    if (specialty) {
      query.specialty = { $in: [new RegExp(specialty, 'i')] };
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [artists, total] = await Promise.all([
      Artist.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ isFeatured: -1, name: 1 }),
      Artist.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: artists,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artists',
      error: error.message
    });
  }
});

// Get single artist by ID
router.get('/:id', async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }
    
    res.json({
      success: true,
      data: artist
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch artist',
      error: error.message
    });
  }
});

// Create new artist (admin only)
router.post('/', auth, verifyAdmin, async (req, res) => {
  try {
    const newArtist = new Artist(req.body);
    const savedArtist = await newArtist.save();
    
    res.status(201).json({
      success: true,
      message: 'Artist created successfully',
      data: savedArtist
    });
  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create artist',
      error: error.message
    });
  }
});

// Update artist (admin only)
router.put('/:id', auth, verifyAdmin, async (req, res) => {
  try {
    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!updatedArtist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Artist updated successfully',
      data: updatedArtist
    });
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update artist',
      error: error.message
    });
  }
});

// Delete artist (admin only)
router.delete('/:id', auth, verifyAdmin, async (req, res) => {
  try {
    const deletedArtist = await Artist.findByIdAndDelete(req.params.id);
    
    if (!deletedArtist) {
      return res.status(404).json({
        success: false,
        message: 'Artist not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Artist deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete artist',
      error: error.message
    });
  }
});

module.exports = router;
