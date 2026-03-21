const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/user/orderController');
const { auth, optionalAuth } = require('../../middleware/auth');

// Public route for tracking
router.get('/track/:orderNumber', optionalAuth, orderController.trackOrder);

// All other routes require auth
router.get('/', auth, orderController.getMyOrders);
router.get('/:id', auth, orderController.getById);
router.post('/', auth, orderController.create);
router.put('/:id/cancel', auth, orderController.cancel);
router.post('/:id/review', auth, orderController.review);
router.post('/:id/reorder', auth, orderController.reorder);

module.exports = router;
