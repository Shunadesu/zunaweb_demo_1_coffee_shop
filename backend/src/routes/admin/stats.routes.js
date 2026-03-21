const express = require('express');
const router = express.Router();
const statsController = require('../../controllers/admin/statsController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// All routes require auth + admin
router.use(auth, admin);

router.get('/dashboard', statsController.getDashboard);
router.get('/revenue', statsController.getRevenue);
router.get('/orders', statsController.getOrderStats);
router.get('/products', statsController.getProductStats);
router.get('/customers', statsController.getCustomerStats);
router.get('/coupons', statsController.getCouponStats);
router.get('/comparison', statsController.getComparison);

module.exports = router;
