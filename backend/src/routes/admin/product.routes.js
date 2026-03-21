const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const productController = require('../../controllers/admin/productController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// Validation
const productValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên sản phẩm là bắt buộc'),
  body('category')
    .notEmpty()
    .withMessage('Danh mục là bắt buộc')
    .isMongoId()
    .withMessage('ID danh mục không hợp lệ'),
  body('basePrice')
    .isNumeric()
    .withMessage('Giá phải là số')
    .custom((value) => value > 0)
    .withMessage('Giá phải lớn hơn 0'),
];

// All routes require auth + admin
router.use(auth, admin);

// CRUD
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.get('/:id/stats', productController.getStats);
router.post('/', productValidation, productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

// Actions
router.patch('/:id/availability', productController.toggleAvailability);
router.patch('/:id/featured', productController.toggleFeatured);
router.post('/:id/images', productController.uploadImages);
router.delete('/:id/images/:imageId', productController.deleteImage);

module.exports = router;
