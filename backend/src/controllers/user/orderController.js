const { validationResult } = require('express-validator');
const Order = require('../../models/Order');
const User = require('../../models/User');
const Coupon = require('../../models/Coupon');
const PointHistory = require('../../models/PointHistory');
const Product = require('../../models/Product');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');
const notificationService = require('../../services/notificationService');
const pointsService = require('../../services/pointsService');
const couponService = require('../../services/couponService');
const socket = require('../../socket');

/**
 * @route   GET /api/user/orders
 * @desc    Get user's orders
 * @access  User
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { userId: req.user._id };
  if (status) query.status = status;
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [orders, total] = await Promise.all([
    Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(orders, total, page, limitNum));
});

/**
 * @route   GET /api/user/orders/:id
 * @desc    Get order by ID
 * @access  User
 */
const getById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate('items.product', 'name images');
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  res.json({ success: true, data: order });
});

/**
 * @route   GET /api/user/orders/track/:orderNumber
 * @desc    Track order by order number
 * @access  Public (with optional auth)
 */
const trackOrder = asyncHandler(async (req, res) => {
  const { orderNumber } = req.params;
  const { phone } = req.query;
  
  const query = { orderNumber };
  
  // If not logged in, require phone number
  if (!req.user && phone) {
    query['customer.phone'] = phone;
  } else if (!req.user && !phone) {
    throw ApiError.badRequest('Vui lòng cung cấp số điện thoại để tra cứu');
  }
  
  const order = await Order.findOne(query)
    .select('orderNumber status statusHistory customer.name customer.phone orderType createdAt items total');
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  res.json({ success: true, data: order });
});

/**
 * @route   POST /api/user/orders
 * @desc    Create new order
 * @access  User
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }
  
  const {
    items,
    customer,
    orderType,
    tableNumber,
    paymentMethod,
    couponCode,
    pointsToRedeem,
    customerNotes,
  } = req.body;
  
  // Validate items
  if (!items || items.length === 0) {
    throw ApiError.badRequest('Giỏ hàng trống');
  }
  
  // Process items and calculate totals
  const processedItems = [];
  let subtotal = 0;
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw ApiError.badRequest(`Sản phẩm không tồn tại: ${item.product}`);
    }
    if (!product.isAvailable) {
      throw ApiError.badRequest(`Sản phẩm "${product.name}" hiện không có sẵn`);
    }
    
    // Calculate item price
    let unitPrice = product.basePrice;
    if (item.size && product.sizes?.length > 0) {
      const sizeObj = product.sizes.find(s => s.name === item.size);
      if (sizeObj) unitPrice += sizeObj.priceModifier;
    }
    
    // Add toppings
    let toppingsTotal = 0;
    const toppings = [];
    if (item.toppings?.length > 0) {
      for (const toppingName of item.toppings) {
        const topping = product.toppings.find(t => t.name === toppingName);
        if (topping) {
          toppings.push({ name: topping.name, price: topping.price });
          toppingsTotal += topping.price;
        }
      }
    }
    
    const itemSubtotal = (unitPrice + toppingsTotal) * item.quantity;
    
    processedItems.push({
      product: product._id,
      name: product.name,
      image: product.primaryImage,
      size: item.size || '',
      toppings,
      quantity: item.quantity,
      unitPrice,
      notes: item.notes || '',
      subtotal: itemSubtotal,
    });
    
    subtotal += itemSubtotal;
  }
  
  // Calculate discount
  let discountAmount = 0;
  let coupon = null;
  let freeItem = null;
  
  if (couponCode) {
    coupon = await couponService.validateAndApply(
      couponCode,
      subtotal,
      req.user._id,
      processedItems
    );
    if (coupon) {
      discountAmount = couponService.calculateDiscount(coupon, subtotal);
      if (coupon.type === 'FREE_ITEM' && coupon.freeItemProduct) {
        freeItem = await Product.findById(coupon.freeItemProduct);
      }
    }
  }
  
  // Calculate points redemption
  let pointsRedeemed = 0;
  let pointsDiscount = 0;
  
  if (pointsToRedeem && pointsToRedeem > 0 && req.user.pointBalance >= pointsToRedeem) {
    pointsRedeemed = pointsToRedeem;
    pointsDiscount = await pointsService.getPointsValue(pointsToRedeem);
  }
  
  // Calculate shipping fee
  const shippingFee = orderType === 'DELIVERY' ? 15000 : 0;
  
  // Calculate points to earn
  const finalTotal = subtotal - discountAmount - pointsDiscount + shippingFee;
  const pointsEarned = await pointsService.calculatePointsForOrder(
    finalTotal,
    req.user.memberRank
  );
  
  // Generate order number
  const orderNumber = await Order.generateOrderNumber();
  
  // Create order
  const order = new Order({
    orderNumber,
    customerType: 'MEMBER',
    customer,
    userId: req.user._id,
    memberCode: req.user.memberCode,
    memberRank: req.user.memberRank,
    orderType,
    tableNumber,
    items: processedItems,
    subtotal,
    discountAmount,
    couponCode: coupon?.code,
    couponId: coupon?._id,
    pointsRedeemed,
    pointsDiscount,
    pointsEarned,
    shippingFee,
    total: finalTotal,
    paymentMethod,
    customerNotes,
    source: 'WEB',
    statusHistory: [{
      status: 'PENDING',
      changedAt: new Date(),
      changedBy: req.user._id,
    }],
  });
  
  await order.save();
  
  // Update user points
  if (pointsRedeemed > 0) {
    await pointsService.redeemPoints(req.user._id, pointsRedeemed, order._id);
  }
  
  // Update coupon usage
  if (coupon) {
    await couponService.useCoupon(coupon._id, req.user._id);
  }
  
  // Update product sold counts
  for (const item of processedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { soldCount: item.quantity },
    });
  }
  
  // Send notification to admin
  if (socket.io) {
    socket.io.to('admin').emit('order:new', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      customerName: customer.name,
      itemsCount: items.length,
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Đặt hàng thành công',
    data: order,
  });
});

/**
 * @route   PUT /api/user/orders/:id/cancel
 * @desc    Cancel order
 * @access  User
 */
const cancel = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    throw ApiError.badRequest('Không thể hủy đơn hàng ở trạng thái này');
  }
  
  order.status = 'CANCELLED';
  order.addStatusHistory('CANCELLED', req.user._id, reason || 'Hủy bởi khách hàng');
  
  // Refund points
  if (order.pointsRedeemed > 0) {
    await pointsService.refundPoints(req.user._id, order.pointsRedeemed, order._id);
  }
  
  await order.save();
  
  res.json({
    success: true,
    message: 'Đã hủy đơn hàng thành công',
  });
});

/**
 * @route   POST /api/user/orders/:id/review
 * @desc    Review order
 * @access  User
 */
const review = asyncHandler(async (req, res) => {
  const { rating, comment, images } = req.body;
  
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  
  if (!order) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  if (order.status !== 'COMPLETED') {
    throw ApiError.badRequest('Chỉ có thể đánh giá đơn hàng đã hoàn thành');
  }
  
  if (order.isReviewed) {
    throw ApiError.badRequest('Bạn đã đánh giá đơn hàng này');
  }
  
  order.isReviewed = true;
  order.rating = rating;
  order.review = comment;
  order.reviewImages = images || [];
  await order.save();
  
  // Update product ratings
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      // Recalculate average rating
      const Order = require('../../models/Order');
      const reviews = await Order.find({
        'items.product': product._id,
        isReviewed: true,
        rating: { $exists: true },
      }).select('rating');
      
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      product.rating = totalRating / reviews.length;
      product.reviewCount = reviews.length;
      await product.save();
    }
  }
  
  res.json({
    success: true,
    message: 'Cảm ơn bạn đã đánh giá!',
  });
});

/**
 * @route   POST /api/user/orders/:id/reorder
 * @desc    Reorder (create new order from previous)
 * @access  User
 */
const reorder = asyncHandler(async (req, res) => {
  const previousOrder = await Order.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  
  if (!previousOrder) {
    throw ApiError.notFound('Không tìm thấy đơn hàng');
  }
  
  // Create new order with same items
  const newOrder = new Order({
    ...previousOrder.toObject(),
    _id: undefined,
    orderNumber: await Order.generateOrderNumber(),
    status: 'PENDING',
    paymentStatus: 'PENDING',
    statusHistory: [{
      status: 'PENDING',
      changedAt: new Date(),
      changedBy: req.user._id,
    }],
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  await newOrder.save();
  
  res.status(201).json({
    success: true,
    message: 'Đã tạo đơn hàng mới từ đơn cũ',
    data: newOrder,
  });
});

module.exports = {
  getMyOrders,
  getById,
  trackOrder,
  create,
  cancel,
  review,
  reorder,
};
