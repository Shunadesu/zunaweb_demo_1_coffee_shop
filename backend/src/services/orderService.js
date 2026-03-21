const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const pointsService = require('./pointsService');
const couponService = require('./couponService');

/**
 * Create new order
 */
const createOrder = async (orderData, user) => {
  const {
    items,
    customer,
    orderType,
    tableNumber,
    paymentMethod,
    couponCode,
    pointsToRedeem,
    customerNotes,
  } = orderData;
  
  // Process items
  const processedItems = [];
  let subtotal = 0;
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) throw new Error(`Product not found: ${item.product}`);
    if (!product.isAvailable) throw new Error(`Product unavailable: ${product.name}`);
    
    let unitPrice = product.basePrice;
    if (item.size && product.sizes?.length > 0) {
      const sizeObj = product.sizes.find(s => s.name === item.size);
      if (sizeObj) unitPrice += sizeObj.priceModifier;
    }
    
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
  
  // Process coupon
  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    coupon = await couponService.validateAndApply(
      couponCode,
      subtotal,
      user._id,
      processedItems
    );
    if (coupon) {
      discountAmount = couponService.calculateDiscount(coupon, subtotal);
    }
  }
  
  // Process points
  let pointsRedeemed = 0;
  let pointsDiscount = 0;
  if (pointsToRedeem && pointsToRedeem > 0 && user.pointBalance >= pointsToRedeem) {
    pointsRedeemed = pointsToRedeem;
    pointsDiscount = await pointsService.getPointsValue(pointsRedeemed);
  }
  
  // Calculate totals
  const shippingFee = orderType === 'DELIVERY' ? 15000 : 0;
  const total = subtotal - discountAmount - pointsDiscount + shippingFee;
  const pointsEarned = await pointsService.calculatePointsForOrder(total, user.memberRank);
  
  // Generate order number
  const orderNumber = await Order.generateOrderNumber();
  
  // Create order
  const order = new Order({
    orderNumber,
    customerType: 'MEMBER',
    customer,
    userId: user._id,
    memberCode: user.memberCode,
    memberRank: user.memberRank,
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
    total,
    paymentMethod,
    customerNotes,
    source: 'WEB',
    statusHistory: [{
      status: 'PENDING',
      changedAt: new Date(),
      changedBy: user._id,
    }],
  });
  
  await order.save();
  
  // Update points
  if (pointsRedeemed > 0) {
    await pointsService.redeemPoints(user._id, pointsRedeemed, order._id);
  }
  
  // Update coupon usage
  if (coupon) {
    await couponService.useCoupon(coupon._id, user._id);
  }
  
  // Update product sold counts
  for (const item of processedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { soldCount: item.quantity },
    });
  }
  
  return order;
};

/**
 * Update order status
 */
const updateOrderStatus = async (orderId, newStatus, changedBy, note = null) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error('Order not found');
  
  const validTransitions = Order.getValidTransitions();
  if (!validTransitions[order.status]?.includes(newStatus)) {
    throw new Error(`Invalid status transition from ${order.status} to ${newStatus}`);
  }
  
  order.status = newStatus;
  order.addStatusHistory(newStatus, changedBy, note);
  
  if (newStatus === 'COMPLETED') {
    order.paymentStatus = 'PAID';
    order.paidAt = new Date();
    
    // Award points
    await pointsService.earnPoints(
      order.userId,
      order._id,
      order.total,
      order.memberRank
    );
  }
  
  if (newStatus === 'CANCELLED') {
    // Refund points
    if (order.pointsRedeemed > 0) {
      await pointsService.refundPoints(order.userId, order.pointsRedeemed, order._id);
    }
  }
  
  await order.save();
  return order;
};

module.exports = {
  createOrder,
  updateOrderStatus,
};
