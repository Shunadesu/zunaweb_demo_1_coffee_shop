const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { auth: authenticate } = require('../middleware/auth');

// ==================== USER ROUTES (Authenticated) ====================

// Get user's wishlist
router.get('/', authenticate, wishlistController.getWishlist);

// Add product to wishlist
router.post('/', authenticate, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', authenticate, wishlistController.removeFromWishlist);

// Check if product is in wishlist
router.get('/check/:productId', authenticate, wishlistController.checkWishlist);

// Clear entire wishlist
router.delete('/clear', authenticate, wishlistController.clearWishlist);

// Update wishlist item note
router.patch('/:productId/note', authenticate, wishlistController.updateWishlistItemNote);

// Move product to cart
router.post('/:productId/move-to-cart', authenticate, wishlistController.moveToCart);

module.exports = router;
