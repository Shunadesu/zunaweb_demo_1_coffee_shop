const { validationResult } = require('express-validator');
const Order = require('../../models/Order');
const User = require('../../models/User');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');
const notificationService = require('../../services/notificationService');
const socket = require('../../socket');

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status, 
    dateFrom, 
    dateTo, 
    search,
    orderType,
    paymentStatus,
  } = req.query;
  
  const query = {};
  
  if (status) {
    query.status = status;
  }
  
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }
  
  if (orderType) {
    query.orderType = orderType;
  }
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }
  
  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'customer.name': { $regex: search, $options: 'i' } },
      { 'customer.phone': { $regex: search, $options: 'i' } },
    ];
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('userId', 'name email phone memberCode memberRank')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(orders, total, page, limitNum));
});

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order by ID
 * @access  Admin
 */
const getById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('userId', 'name email phone memberCode memberRank avatar')
    .populate('assignedTo', 'name')
    .populate('preparedBy', 'name');
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  res.json({ success: true, data: order });
});

/**
 * @route   GET /api/admin/orders/:id/history
 * @desc    Get order status history
 * @access  Admin
 */
const getHistory = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select('orderNumber statusHistory')
    .populate('statusHistory.changedBy', 'name');
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  res.json({ 
    success: true, 
    data: {
      orderNumber: order.orderNumber,
      history: order.statusHistory,
    },
  });
});

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  // Validate status transition
  const validTransitions = Order.getValidTransitions();
  if (!validTransitions[order.status]?.includes(status)) {
    throw ApiError.badRequest(
      `Không thể chuyển từ ${order.status} sang ${status}`
    );
  }
  
  // Update order
  order.status = status;
  order.addStatusHistory(status, req.user._id, note);
  
  // Update payment status for completed/cancelled
  if (status === 'COMPLETED') {
    order.paymentStatus = 'PAID';
    order.paidAt = new Date();
  }
  
  await order.save();
  
  // Send notification to user
  if (order.userId) {
    await notificationService.sendOrderStatusUpdate(order.userId, order, status);
    
    // Emit via socket
    if (socket.io) {
      socket.io.to(`user:${order.userId}`).emit('order:status', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status,
      });
    }
  }
  
  // Emit to admin dashboard
  if (socket.io) {
    socket.io.to('admin').emit('order:updated', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status,
      updatedBy: req.user.name,
    });
  }
  
  res.json({
    success: true,
    message: `Đơn hàng đã được cập nhật sang trạng thái ${status}`,
    data: { status: order.status },
  });
});

/**
 * @route   PUT /api/admin/orders/:id/assign
 * @desc    Assign order to staff
 * @access  Admin
 */
const assignOrder = asyncHandler(async (req, res) => {
  const { assignedTo } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  order.assignedTo = assignedTo;
  await order.save();
  
  res.json({
    success: true,
    message: 'Đã giao đơn hàng cho nhân viên',
  });
});

/**
 * @route   PUT /api/admin/orders/:id/cancel
 * @desc    Cancel order
 * @access  Admin
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw ApiError.badRequest('Không thể hủy đơn hàng ở trạng thái này');
  }
  
  order.status = 'CANCELLED';
  order.adminNotes = reason || 'Hủy bởi admin';
  order.addStatusHistory('CANCELLED', req.user._id, reason);
  
  // Refund points if redeemed
  if (order.pointsRedeemed > 0 && order.userId) {
    const user = await User.findById(order.userId);
    if (user) {
      user.pointBalance += order.pointsRedeemed;
      await user.save();
    }
  }
  
  await order.save();
  
  // Send notification
  if (order.userId) {
    await notificationService.sendOrderStatusUpdate(order.userId, order, 'CANCELLED');
  }
  
  res.json({
    success: true,
    message: 'Đơn hàng đã được hủy',
  });
});

/**
 * @route   PUT /api/admin/orders/:id/refund
 * @desc    Refund order
 * @access  Admin
 */
const refundOrder = asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  if (order.paymentStatus === 'REFUNDED') {
    throw ApiError.badRequest('Đơn hàng đã được hoàn tiền');
  }
  
  order.paymentStatus = amount && amount < order.total ? 'PARTIAL_REFUND' : 'REFUNDED';
  order.status = 'REFUNDED';
  order.adminNotes = reason ? `${order.adminNotes || ''}\nHoàn tiền: ${reason}` : order.adminNotes;
  order.addStatusHistory('REFUNDED', req.user._id, `Hoàn tiền: ${reason || 'Không có lý do'}`);
  
  await order.save();
  
  res.json({
    success: true,
    message: 'Đã hoàn tiền thành công',
    data: { paymentStatus: order.paymentStatus },
  });
});

/**
 * @route   POST /api/admin/orders/:id/note
 * @desc    Add admin note
 * @access  Admin
 */
const addNote = asyncHandler(async (req, res) => {
  const { note } = req.body;
  
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  const timestamp = new Date().toLocaleString('vi-VN');
  order.adminNotes = order.adminNotes 
    ? `${order.adminNotes}\n[${timestamp}] ${req.user.name}: ${note}`
    : `[${timestamp}] ${req.user.name}: ${note}`;
  
  await order.save();
  
  res.json({
    success: true,
    message: 'Đã thêm ghi chú',
  });
});

module.exports = {
  getAll,
  getById,
  getHistory,
  updateStatus,
  assignOrder,
  cancelOrder,
  refundOrder,
  addNote,
};
