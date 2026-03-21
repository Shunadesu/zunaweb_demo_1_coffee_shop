const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/userController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// All routes require auth + admin
router.use(auth, admin);

// CRUD
router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.get('/:id/orders', userController.getUserOrders);
router.get('/:id/points', userController.getUserPoints);
router.put('/:id', userController.update);
router.put('/:id/points', userController.updatePoints);
router.put('/:id/block', userController.toggleBlock);
router.delete('/:id', userController.delete);

module.exports = router;
