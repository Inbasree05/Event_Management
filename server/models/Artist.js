const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
      required: true,
    },
    specialty: {
      type: [String],
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
      default: '',
    },
    portfolioImages: [{
      type: String
    }],
    services: [{
      name: String,
      price: Number,
      description: String
    }],
    rating: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    socialMedia: {
      instagram: String,
      facebook: String,
      website: String,
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a text index for search functionality
artistSchema.index({ 
  name: 'text',
  location: 'text',
  specialty: 'text',
  about: 'text'
});

const Artist = mongoose.model('Artist', artistSchema);

module.exports = Artist;
