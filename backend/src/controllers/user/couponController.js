const Coupon = require('../../models/Coupon');
const Order = require('../../models/Order');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');

/**
 * @route   GET /api/user/coupons
 * @desc    Get user's coupons
 * @access  User
 */
const getMyCoupons = asyncHandler(async (req, res) => {
  const { status = 'available', page = 1, limit = 10 } = req.query;
  
  const now = new Date();
  
  // Get orders that used coupons
  const usedCoupons = await Order.distinct('couponCode', {
    userId: req.user._id,
    couponCode: { $ne: null },
  });
  
  let query = {
    code: { $in: usedCoupons },
    isActive: true,
  };
  
  if (status === 'available') {
    query.validUntil = { $gte: now };
    query.usedCount = { $lt: query.totalLimit || Infinity };
  } else if (status === 'used') {
    // Coupons that have been fully used
    query = {
      code: { $in: usedCoupons },
      $or: [
        { validUntil: { $lt: now } },
        { totalLimit: { $lte: usedCoupons.length } },
      ],
    };
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .sort({ validUntil: 1 })
      .skip(skip)
      .limit(limitNum),
    Coupon.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(coupons, total, page, limitNum));
});

/**
 * @route   GET /api/user/coupons/available
 * @desc    Get available coupons for user
 * @access  User
 */
const getAvailable = asyncHandler(async (req, res) => {
  const { cartTotal = 0 } = req.query;
  const now = new Date();
  
  const user = req.user;
  
  // Get coupons user has used
  const usedCoupons = await Order.distinct('couponCode', {
    userId: user._id,
    couponCode: { $ne: null },
  });
  
  // Find available coupons
  const coupons = await Coupon.find({
    isActive: true,
    isPublic: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $nor: [
      { totalLimit: { $lte: usedCoupons.length } },
    ],
  }).sort({ discountValue: -1 });
  
  // Filter by user's rank and usage
  const availableCoupons = [];
  
  for (const coupon of coupons) {
    // Check if user reached per-user limit
    const userUsage = coupon.userUsage?.find(
      u => u.userId.toString() === user._id.toString()
    );
    if (userUsage && userUsage.count >= coupon.perUserLimit) {
      continue;
    }
    
    // Check rank requirement
    if (coupon.memberRanks?.length > 0) {
      if (!coupon.memberRanks.includes(user.memberRank)) {
        continue;
      }
    }
    
    // Check min order value
    if (coupon.minOrderValue && cartTotal < coupon.minOrderValue) {
      continue;
    }
    
    // Check if already used
    if (usedCoupons.includes(coupon.code)) {
      continue;
    }
    
    availableCoupons.push(coupon);
  }
  
  res.json({
    success: true,
    data: availableCoupons,
  });
});

/**
 * @route   POST /api/user/coupons/validate
 * @desc    Validate coupon
 * @access  User
 */
const validate = asyncHandler(async (req, res) => {
  const { code, cartTotal, cartItems } = req.body;
  
  if (!code) {
    throw ApiError.badRequest('Vui lòng nhập mã coupon');
  }
  
  const coupon = await Coupon.findOne({ 
    code: code.toUpperCase(),
    isActive: true,
  });
  
  if (!coupon) {
    throw ApiError.notFound('Coupon không tồn tại');
  }
  
  // Check validity
  const now = new Date();
  if (now < coupon.validFrom) {
    throw ApiError.badRequest('Coupon chưa có hiệu lực');
  }
  if (now > coupon.validUntil) {
    throw ApiError.badRequest('Coupon đã hết hạn');
  }
  
  // Check total limit
  if (coupon.totalLimit && coupon.usedCount >= coupon.totalLimit) {
    throw ApiError.badRequest('Coupon đã hết lượt sử dụng');
  }
  
  // Check per-user limit
  const userUsage = coupon.userUsage?.find(
    u => u.userId.toString() === req.user._id.toString()
  );
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    throw ApiError.badRequest('Bạn đã sử dụng coupon này rồi');
  }
  
  // Check rank
  if (coupon.memberRanks?.length > 0) {
    if (!coupon.memberRanks.includes(req.user.memberRank)) {
      throw ApiError.badRequest(`Chỉ thành viên ${coupon.memberRanks.join(', ')} mới được sử dụng`);
    }
  }
  
  // Check min order value
  if (coupon.minOrderValue && (!cartTotal || cartTotal < coupon.minOrderValue)) {
    throw ApiError.badRequest(
      `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ để sử dụng coupon`
    );
  }
  
  // Calculate discount
  let discount = 0;
  let freeItem = null;
  
  switch (coupon.type) {
    case 'PERCENT':
      discount = Math.min(
        cartTotal * (coupon.discountValue / 100),
        coupon.maxDiscount || Infinity
      );
      break;
    case 'FIXED':
      discount = Math.min(coupon.discountValue, cartTotal);
      break;
    case 'FREE_ITEM':
      if (coupon.freeItemProduct) {
        const Product = require('../../models/Product');
        freeItem = await Product.findById(coupon.freeItemProduct);
      }
      break;
    case 'FREE_SHIP':
      discount = 15000; // Default shipping fee
      break;
  }
  
  res.json({
    success: true,
    data: {
      coupon,
      discount: Math.round(discount),
      freeItem,
      message: 'Coupon hợp lệ',
    },
  });
});

/**
 * @route   POST /api/user/coupons/claim/:id
 * @desc    Claim a coupon
 * @access  User
 */
const claim = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Coupon không tồn tại');
  }
  
  if (!coupon.isPublic) {
    throw ApiError.forbidden('Coupon này không thể nhận');
  }
  
  // Check if already claimed
  const userUsage = coupon.userUsage?.find(
    u => u.userId.toString() === req.user._id.toString()
  );
  if (userUsage) {
    throw ApiError.badRequest('Bạn đã nhận coupon này rồi');
  }
  
  // Add user to usage list
  if (!coupon.userUsage) coupon.userUsage = [];
  coupon.userUsage.push({
    userId: req.user._id,
    count: 0,
    lastUsed: new Date(),
  });
  
  await coupon.save();
  
  res.json({
    success: true,
    message: 'Nhận coupon thành công!',
    data: coupon,
  });
});

/**
 * @route   GET /api/user/coupons/:id
 * @desc    Get coupon by ID
 * @access  User
 */
const getById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Coupon không tồn tại');
  }
  
  // Check if user has used this coupon
  const used = await Order.exists({
    userId: req.user._id,
    couponCode: coupon.code,
  });
  
  res.json({
    success: true,
    data: {
      ...coupon.toObject(),
      hasUsed: !!used,
    },
  });
});

module.exports = {
  getMyCoupons,
  getAvailable,
  validate,
  claim,
  getById,
};
