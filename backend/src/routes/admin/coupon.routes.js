const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const couponController = require('../../controllers/admin/couponController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// Validation
const couponValidation = [
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Mã coupon là bắt buộc'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên coupon là bắt buộc'),
  body('type')
    .isIn(['PERCENT', 'FIXED', 'FREE_ITEM', 'FREE_SHIP'])
    .withMessage('Loại coupon không hợp lệ'),
  body('discountValue')
    .isNumeric()
    .withMessage('Giá trị giảm phải là số'),
  body('validFrom')
    .isISO8601()
    .withMessage('Ngày bắt đầu không hợp lệ'),
  body('validUntil')
    .isISO8601()
    .withMessage('Ngày kết thúc không hợp lệ'),
];

// All routes require auth + admin
router.use(auth, admin);

// CRUD
router.get('/', couponController.getAll);
router.get('/:id', couponController.getById);
router.get('/:id/usage', couponController.getUsage);
router.post('/', couponValidation, couponController.create);
router.put('/:id', couponController.update);
router.delete('/:id', couponController.delete);

// Actions
router.patch('/:id/status', couponController.toggleStatus);
router.post('/:id/duplicate', couponController.duplicate);

module.exports = router;
