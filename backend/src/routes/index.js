const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth.routes');
const adminProductRoutes = require('./admin/product.routes');
const adminCategoryRoutes = require('./admin/category.routes');
const adminOrderRoutes = require('./admin/order.routes');
const adminUserRoutes = require('./admin/user.routes');
const adminCouponRoutes = require('./admin/coupon.routes');
const adminBlogRoutes = require('./admin/blog.routes');
const adminStatsRoutes = require('./admin/stats.routes');
const adminUploadRoutes = require('./admin/upload.routes');
const userProfileRoutes = require('./user/profile.routes');
const userOrderRoutes = require('./user/order.routes');
const userMembershipRoutes = require('./user/membership.routes');
const userCouponRoutes = require('./user/coupon.routes');
const publicRoutes = require('./public.routes');

// Use routes
router.use('/auth', authRoutes);

// Public routes
router.use('/public', publicRoutes);

// Admin routes (protected by admin middleware)
router.use('/admin/products', adminProductRoutes);
router.use('/admin/categories', adminCategoryRoutes);
router.use('/admin/orders', adminOrderRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/coupons', adminCouponRoutes);
router.use('/admin/blog', adminBlogRoutes);
router.use('/admin/stats', adminStatsRoutes);
router.use('/admin/upload', adminUploadRoutes);

// User routes (protected by auth middleware)
router.use('/user/profile', userProfileRoutes);
router.use('/user/orders', userOrderRoutes);
router.use('/user/membership', userMembershipRoutes);
router.use('/user/coupons', userCouponRoutes);

module.exports = router;
