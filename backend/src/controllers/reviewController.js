const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

// Async handler helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== PUBLIC CONTROLLERS ====================

// Get reviews for a product
const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

  const skip = (page - 1) * limit;
  
  const sortOptions = {
    recent: { createdAt: -1 },
    oldest: { createdAt: 1 },
    highest: { rating: -1 },
    lowest: { rating: 1 },
    helpful: { helpful: -1 }
  };

  const [reviews, total] = await Promise.all([
    Review.find({
      product: productId,
      isPublished: true,
      isDeleted: false
    })
    .populate('user', 'name avatar memberRank')
    .sort(sortOptions[sortBy] || sortOptions.recent)
    .skip(skip)
    .limit(limit)
    .lean(),
    Review.countDocuments({
      product: productId,
      isPublished: true,
      isDeleted: false
    })
  ]);

  // Get stats
  const stats = await Review.getProductStats(productId);

  res.json({
    success: true,
    data: {
      reviews,
      stats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// ==================== USER CONTROLLERS ====================

// Create a review
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, title, comment, images, orderId } = req.body;
  const userId = req.user._id;

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Sản phẩm không tồn tại');
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    user: userId,
    product: productId,
    isDeleted: false
  });

  if (existingReview) {
    throw ApiError.badRequest('Bạn đã đánh giá sản phẩm này rồi');
  }

  // Check if user purchased this product (for verified badge)
  let isVerified = false;
  if (orderId) {
    const order = await mongoose.model('Order').findOne({
      _id: orderId,
      user: userId,
      status: 'COMPLETED',
      'items.product': productId
    });
    isVerified = !!order;
  }

  const review = new Review({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    images,
    order: orderId,
    isVerified
  });

  await review.save();
  await review.populate('user', 'name avatar memberRank');

  res.status(201).json({
    success: true,
    message: 'Đánh giá đã được gửi thành công',
    data: { review }
  });
});

// Update own review
const updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment, images } = req.body;
  const userId = req.user._id;

  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
    isDeleted: false
  });

  if (!review) {
    throw ApiError.notFound('Đánh giá không tồn tại hoặc bạn không có quyền sửa');
  }

  // Update fields
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment !== undefined) review.comment = comment;
  if (images) review.images = images;

  await review.save();
  await review.populate('user', 'name avatar memberRank');

  res.json({
    success: true,
    message: 'Đánh giá đã được cập nhật',
    data: { review }
  });
});

// Delete own review
const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findOne({
    _id: reviewId,
    user: userId,
    isDeleted: false
  });

  if (!review) {
    throw ApiError.notFound('Đánh giá không tồn tại hoặc bạn không có quyền xóa');
  }

  review.isDeleted = true;
  await review.save();

  res.json({
    success: true,
    message: 'Đánh giá đã được xóa'
  });
});

// Mark review as helpful
const markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Đánh giá không tồn tại');
  }

  // Toggle helpful
  const alreadyMarked = review.markedHelpfulBy.includes(userId);
  
  if (alreadyMarked) {
    review.markedHelpfulBy = review.markedHelpfulBy.filter(
      id => id.toString() !== userId.toString()
    );
    review.helpful = Math.max(0, review.helpful - 1);
  } else {
    review.markedHelpfulBy.push(userId);
    review.helpful += 1;
  }

  await review.save();

  res.json({
    success: true,
    message: alreadyMarked ? 'Đã bỏ đánh dấu hữu ích' : 'Đã đánh dấu hữu ích',
    data: { helpful: review.helpful }
  });
});

// Get user's reviews
const getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user._id;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ user: userId, isDeleted: false })
      .populate('product', 'name primaryImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments({ user: userId, isDeleted: false })
  ]);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// ==================== ADMIN CONTROLLERS ====================

// Get all reviews (admin)
const getAllReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, product, user, rating, isVerified, isPublished } = req.query;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };
  
  if (product) query.product = product;
  if (user) query.user = user;
  if (rating) query.rating = Number(rating);
  if (isVerified !== undefined) query.isVerified = isVerified === 'true';
  if (isPublished !== undefined) query.isPublished = isPublished === 'true';

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'name primaryImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Review.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      reviews,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Update review (admin) - publish/unpublish
const updateReviewStatus = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { isPublished } = req.body;
  const adminId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Đánh giá không tồn tại');
  }

  review.isPublished = isPublished;
  await review.save();

  res.json({
    success: true,
    message: isPublished ? 'Đánh giá đã được xuất bản' : 'Đánh giá đã bị ẩn'
  });
});

// Reply to review (admin)
const replyToReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reply } = req.body;
  const adminId = req.user._id;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Đánh giá không tồn tại');
  }

  review.adminReply = reply;
  review.adminRepliedAt = new Date();
  review.adminRepliedBy = adminId;
  await review.save();
  await review.populate('adminRepliedBy', 'name');

  res.json({
    success: true,
    message: 'Đã phản hồi đánh giá',
    data: { review }
  });
});

// Delete review (admin - hard delete)
const deleteReviewAdmin = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);
  if (!review) {
    throw ApiError.notFound('Đánh giá không tồn tại');
  }

  await Review.deleteOne({ _id: reviewId });

  res.json({
    success: true,
    message: 'Đánh giá đã được xóa vĩnh viễn'
  });
});

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  markHelpful,
  getMyReviews,
  getAllReviews,
  updateReviewStatus,
  replyToReview,
  deleteReviewAdmin
};
