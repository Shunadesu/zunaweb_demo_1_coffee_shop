const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const categoryController = require('../../controllers/admin/categoryController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// Validation
const categoryValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Tên danh mục là bắt buộc'),
];

// All routes require auth + admin
router.use(auth, admin);

// CRUD
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.get('/:id/products', categoryController.getProducts);
router.post('/', categoryValidation, categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

// Actions
router.patch('/:id/reorder', categoryController.reorder);
router.patch('/:id/status', categoryController.toggleStatus);

module.exports = router;
