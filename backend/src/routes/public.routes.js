const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public endpoints - no authentication required

// Categories
router.get('/categories', publicController.getCategories);
router.get('/categories/:slug', publicController.getCategoryBySlug);

// Products
router.get('/products', publicController.getProducts);
router.get('/products/featured', publicController.getFeaturedProducts);
router.get('/products/:slug', publicController.getProductBySlug);

// Blogs
router.get('/blogs', publicController.getBlogs);
router.get('/blogs/:slug', publicController.getBlogBySlug);
router.post('/blogs/:id/like', publicController.toggleBlogLike);

// Coupons
router.get('/coupons/public', publicController.getPublicCoupons);

module.exports = router;
