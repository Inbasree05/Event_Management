import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorId: {
    type: String,
    required: true,
    index: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Add a compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, vendorId: 1 }, { unique: true });

// Add a text index for searching reviews
reviewSchema.index({ comment: 'text' });

// Static method to get average rating for a vendor
reviewSchema.statics.getAverageRating = async function(vendorId) {
  const result = await this.aggregate([
    {
      $match: { vendorId }
    },
    {
      $group: {
        _id: '$vendorId',
        averageRating: { $avg: '$rating' },
        numberOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    // Update vendor's average rating if needed
    if (result.length > 0) {
      // Here you would update the vendor document with the new average rating
      // For example: await Vendor.findByIdAndUpdate(vendorId, { averageRating: result[0].averageRating });
    }
  } catch (err) {
    console.error('Error updating vendor rating:', err);
  }

  return result[0] || { averageRating: 0, numberOfReviews: 0 };
};

// Call getAverageRating after save
reviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.vendorId);
});

// Call getAverageRating after remove
reviewSchema.post('remove', async function() {
  await this.constructor.getAverageRating(this.vendorId);
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
