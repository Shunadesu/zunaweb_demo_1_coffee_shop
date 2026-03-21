const express = require('express');
const router = express.Router();
const couponController = require('../../controllers/user/couponController');
const { auth } = require('../../middleware/auth');

// All routes require auth
router.use(auth);

router.get('/', couponController.getMyCoupons);
router.get('/available', couponController.getAvailable);
router.post('/validate', couponController.validate);
router.post('/claim/:id', couponController.claim);
router.get('/:id', couponController.getById);

module.exports = router;
