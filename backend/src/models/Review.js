const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Sản phẩm là bắt buộc']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Người dùng là bắt buộc']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  
  // Rating
  rating: {
    type: Number,
    required: [true, 'Đánh giá là bắt buộc'],
    min: [1, 'Đánh giá tối thiểu là 1 sao'],
    max: [5, 'Đánh giá tối đa là 5 sao']
  },
  
  // Content
  title: {
    type: String,
    maxlength: [100, 'Tiêu đề tối đa 100 ký tự'],
    trim: true
  },
  comment: {
    type: String,
    maxlength: [1000, 'Bình luận tối đa 1000 ký tự'],
    trim: true
  },
  
  // Images
  images: [{
    url: String,
    publicId: String
  }],
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false // Đã mua sản phẩm này
  },
  
  // Helpfulness
  helpful: {
    type: Number,
    default: 0
  },
  unhelpful: {
    type: Number,
    default: 0
  },
  markedHelpfulBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Admin response
  adminReply: {
    type: String,
    maxlength: [500, 'Phản hồi tối đa 500 ký tự']
  },
  adminRepliedAt: Date,
  adminRepliedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Status
  isPublished: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ isPublished: 1 });

// Virtual for checking if user has already reviewed
reviewSchema.virtual('isHelpful', {
  ref: 'User',
  localField: 'markedHelpfulBy',
  foreignField: '_id',
  justOne: false
});

// Pre-save validation - one review per user per product
reviewSchema.statics.isUserReviewed = async function(userId, productId) {
  const existingReview = await this.findOne({ 
    user: userId, 
    product: productId,
    isDeleted: false 
  });
  return !!existingReview;
};

// Static method to get review stats for a product
reviewSchema.statics.getProductStats = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId), isPublished: true, isDeleted: false } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      totalReviews: { $sum: 1 },
      rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
      rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
      rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
      rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
    }}
  ]);
  
  return stats[0] || {
    averageRating: 0,
    totalReviews: 0,
    rating5: 0,
    rating4: 0,
    rating3: 0,
    rating2: 0,
    rating1: 0
  };
};

// Update product rating when review is saved/deleted
reviewSchema.post('save', async function() {
  await this.constructor.updateProductRating(this.product);
});

reviewSchema.post('findOneAndDelete', async function(doc) {
  if (doc) {
    await this.constructor.updateProductRating(doc.product);
  }
});

// Static method to update product rating
reviewSchema.statics.updateProductRating = async function(productId) {
  const stats = await this.getProductStats(productId);
  
  await mongoose.model('Product').findByIdAndUpdate(productId, {
    rating: Math.round(stats.averageRating * 10) / 10,
    reviewCount: stats.totalReviews
  });
};

// JSON transform
reviewSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.isDeleted;
    return ret;
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
