const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/admin/orderController');
const { auth } = require('../../middleware/auth');
const { admin } = require('../../middleware/admin');

// All routes require auth + admin
router.use(auth, admin);

// CRUD
router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.get('/:id/history', orderController.getHistory);

// Actions
router.put('/:id/status', orderController.updateStatus);
router.put('/:id/assign', orderController.assignOrder);
router.put('/:id/cancel', orderController.cancelOrder);
router.put('/:id/refund', orderController.refundOrder);
router.post('/:id/note', orderController.addNote);

module.exports = router;
