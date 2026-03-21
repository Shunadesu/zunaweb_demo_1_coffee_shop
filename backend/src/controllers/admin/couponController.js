const { validationResult } = require('express-validator');
const Coupon = require('../../models/Coupon');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');

/**
 * @route   GET /api/admin/coupons
 * @desc    Get all coupons
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type, status, search } = req.query;
  
  const query = {};
  
  if (type) {
    query.type = type;
  }
  
  if (search) {
    query.$or = [
      { code: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }
  
  // Filter by status
  if (status === 'active') {
    query.isActive = true;
    query.validFrom = { $lte: new Date() };
    query.validUntil = { $gte: new Date() };
  } else if (status === 'inactive') {
    query.$or = [
      { isActive: false },
      { validUntil: { $lt: new Date() } },
    ];
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [coupons, total] = await Promise.all([
    Coupon.find(query)
      .populate('createdBy', 'name')
      .populate('freeItemProduct', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Coupon.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(coupons, total, page, limitNum));
});

/**
 * @route   GET /api/admin/coupons/:id
 * @desc    Get coupon by ID
 * @access  Admin
 */
const getById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('freeItemProduct', 'name');
  
  if (!coupon) {
    throw ApiError.notFound('Không tìm thấy coupon');
  }
  
  res.json({ success: true, data: coupon });
});

/**
 * @route   GET /api/admin/coupons/:id/usage
 * @desc    Get coupon usage history
 * @access  Admin
 */
const getUsage = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Không tìm thấy coupon');
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const Order = require('../../models/Order');
  const [orders, total] = await Promise.all([
    Order.find({ couponId: req.params.id })
      .populate('userId', 'name phone email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments({ couponId: req.params.id }),
  ]);
  
  res.json(buildPaginationResponse(orders, total, page, limitNum));
});

/**
 * @route   POST /api/admin/coupons
 * @desc    Create new coupon
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }
  
  // Generate code if not provided
  let code = req.body.code;
  if (!code) {
    code = await Coupon.generateCode(req.body.prefix || 'PROMO');
  } else {
    // Check if code exists
    const existing = await Coupon.findOne({ code: code.toUpperCase() });
    if (existing) {
      throw ApiError.conflict('Mã coupon đã tồn tại');
    }
    code = code.toUpperCase();
  }
  
  const couponData = {
    ...req.body,
    code,
    createdBy: req.user._id,
  };
  
  const coupon = new Coupon(couponData);
  await coupon.save();
  
  res.status(201).json({
    success: true,
    message: 'Tạo coupon thành công',
    data: coupon,
  });
});

/**
 * @route   PUT /api/admin/coupons/:id
 * @desc    Update coupon
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Không tìm thấy coupon');
  }
  
  // Don't allow changing code if orders have used it
  if (req.body.code && req.body.code !== coupon.code) {
    const Order = require('../../models/Order');
    const usedCount = await Order.countDocuments({ couponId: coupon._id });
    if (usedCount > 0) {
      throw ApiError.badRequest('Không thể đổi mã coupon đã có người sử dụng');
    }
    req.body.code = req.body.code.toUpperCase();
  }
  
  Object.assign(coupon, req.body);
  await coupon.save();
  
  res.json({
    success: true,
    message: 'Cập nhật coupon thành công',
    data: coupon,
  });
});

/**
 * @route   DELETE /api/admin/coupons/:id
 * @desc    Delete coupon
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Không tìm thấy coupon');
  }
  
  // Check if coupon is used
  if (coupon.usedCount > 0) {
    throw ApiError.badRequest('Không thể xóa coupon đã có người sử dụng. Hãy vô hiệu hóa thay thế.');
  }
  
  await Coupon.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Xóa coupon thành công',
  });
});

/**
 * @route   PATCH /api/admin/coupons/:id/status
 * @desc    Toggle coupon active status
 * @access  Admin
 */
const toggleStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Không tìm thấy coupon');
  }
  
  coupon.isActive = isActive !== undefined ? isActive : !coupon.isActive;
  await coupon.save();
  
  res.json({
    success: true,
    message: coupon.isActive 
      ? 'Coupon đã được kích hoạt' 
      : 'Coupon đã bị vô hiệu hóa',
    data: { isActive: coupon.isActive },
  });
});

/**
 * @route   POST /api/admin/coupons/:id/duplicate
 * @desc    Duplicate coupon
 * @access  Admin
 */
const duplicate = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  
  if (!coupon) {
    throw ApiError.notFound('Không tìm thấy coupon');
  }
  
  const newCode = await Coupon.generateCode();
  
  const newCoupon = new Coupon({
    ...coupon.toObject(),
    _id: undefined,
    code: newCode,
    usedCount: 0,
    userUsage: [],
    validFrom: req.body.validFrom || new Date(),
    validUntil: req.body.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdBy: req.user._id,
  });
  
  await newCoupon.save();
  
  res.status(201).json({
    success: true,
    message: 'Đã tạo bản sao coupon',
    data: newCoupon,
  });
});

module.exports = {
  getAll,
  getById,
  getUsage,
  create,
  update,
  delete: remove,
  toggleStatus,
  duplicate,
};
