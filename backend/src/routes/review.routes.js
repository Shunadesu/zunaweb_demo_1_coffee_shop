const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { auth: authenticate, optionalAuth } = require('../middleware/auth');

// ==================== PUBLIC ROUTES ====================

// Get reviews for a product (public)
router.get('/product/:productId', optionalAuth, reviewController.getProductReviews);

// ==================== USER ROUTES (Authenticated) ====================

// Create a review
router.post('/user/reviews/:productId', authenticate, reviewController.createReview);

// Update own review
router.put('/user/reviews/:reviewId', authenticate, reviewController.updateReview);

// Delete own review
router.delete('/user/reviews/:reviewId', authenticate, reviewController.deleteReview);

// Mark review as helpful
router.post('/user/reviews/:reviewId/helpful', authenticate, reviewController.markHelpful);

// Get user's reviews
router.get('/user/reviews', authenticate, reviewController.getMyReviews);

// ==================== ADMIN ROUTES (Admin Only) ====================

// Get all reviews
router.get('/admin/reviews', authenticate, reviewController.getAllReviews);

// Update review status (publish/unpublish)
router.patch('/admin/reviews/:reviewId/status', authenticate, reviewController.updateReviewStatus);

// Reply to review
router.post('/admin/reviews/:reviewId/reply', authenticate, reviewController.replyToReview);

// Delete review (admin - hard delete)
router.delete('/admin/reviews/:reviewId', authenticate, reviewController.deleteReviewAdmin);

module.exports = router;
