const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const blogController = require('../../controllers/admin/blogController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// Validation
const blogValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Tiêu đề là bắt buộc'),
  body('content')
    .notEmpty()
    .withMessage('Nội dung là bắt buộc'),
  body('category')
    .isIn(['NEWS', 'PROMOTION', 'REVIEW', 'GUIDE', 'STORY', 'RECIPE'])
    .withMessage('Danh mục không hợp lệ'),
];

// All routes require auth + admin
router.use(auth, admin);

// CRUD
router.get('/', blogController.getAll);
router.get('/:id', blogController.getById);
router.get('/:id/comments', blogController.getComments);
router.post('/', blogValidation, blogController.create);
router.put('/:id', blogController.update);
router.delete('/:id', blogController.delete);

// Actions
router.patch('/:id/status', blogController.updateStatus);
router.patch('/:id/featured', blogController.toggleFeatured);
router.post('/:id/images', blogController.uploadImages);
router.get('/:id/analytics', blogController.getAnalytics);

module.exports = router;
