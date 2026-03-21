const User = require('../../models/User');
const Order = require('../../models/Order');
const PointHistory = require('../../models/PointHistory');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    role, 
    rank, 
    search,
    dateFrom,
    dateTo,
  } = req.query;
  
  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (rank) {
    query.memberRank = rank;
  }
  
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { memberCode: { $regex: search, $options: 'i' } },
    ];
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [users, total] = await Promise.all([
    User.find(query)
      .select('-refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    User.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(users, total, page, limitNum));
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Admin
 */
const getById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-refreshToken')
    .populate('referredBy', 'name memberCode');
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }
  
  res.json({ success: true, data: user });
});

/**
 * @route   GET /api/admin/users/:id/orders
 * @desc    Get user's orders
 * @access  Admin
 */
const getUserOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  const query = { userId: req.params.id };
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
 * @route   GET /api/admin/users/:id/points
 * @desc    Get user's point history
 * @access  Admin
 */
const getUserPoints = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;
  
  const query = { userId: req.params.id };
  if (type) query.type = type;
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [history, total] = await Promise.all([
    PointHistory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    PointHistory.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(history, total, page, limitNum));
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
  const { name, role, isActive, memberRank, birthday } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }
  
  // Prevent admin from demoting themselves
  if (req.user._id.toString() === user._id.toString() && role && role !== 'admin') {
    throw ApiError.badRequest('Bạn không thể thay đổi vai trò của chính mình');
  }
  
  if (name) user.name = name;
  if (role !== undefined) user.role = role;
  if (isActive !== undefined) user.isActive = isActive;
  if (memberRank) user.memberRank = memberRank;
  if (birthday !== undefined) user.birthday = birthday;
  
  await user.save();
  
  res.json({
    success: true,
    message: 'Cập nhật người dùng thành công',
    data: user,
  });
});

/**
 * @route   PUT /api/admin/users/:id/points
 * @desc    Adjust user points
 * @access  Admin
 */
const updatePoints = asyncHandler(async (req, res) => {
  const { points, type = 'ADJUST', reason } = req.body;
  
  if (!points || points === 0) {
    throw ApiError.badRequest('Số điểm không hợp lệ');
  }
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }
  
  const balanceBefore = user.pointBalance;
  
  if (type === 'ADD') {
    user.pointBalance += Math.abs(points);
  } else if (type === 'SUBTRACT') {
    if (user.pointBalance < Math.abs(points)) {
      throw ApiError.badRequest('Số dư điểm không đủ');
    }
    user.pointBalance -= Math.abs(points);
  } else {
    // ADJUST - set absolute value
    user.pointBalance = Math.max(0, points);
  }
  
  // Create point history
  const pointHistory = new PointHistory({
    userId: user._id,
    type: 'ADJUST',
    points: points,
    balanceBefore,
    balanceAfter: user.pointBalance,
    description: reason || 'Điều chỉnh bởi admin',
    adjustedBy: req.user._id,
    reason,
  });
  
  await Promise.all([user.save(), pointHistory.save()]);
  
  res.json({
    success: true,
    message: `Đã ${points > 0 ? 'cộng' : 'trừ'} ${Math.abs(points)} điểm`,
    data: {
      pointBalance: user.pointBalance,
      points,
      type,
    },
  });
});

/**
 * @route   PUT /api/admin/users/:id/block
 * @desc    Block/unblock user
 * @access  Admin
 */
const toggleBlock = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }
  
  // Prevent admin from blocking themselves
  if (req.user._id.toString() === user._id.toString()) {
    throw ApiError.badRequest('Bạn không thể khóa chính mình');
  }
  
  user.isActive = isActive !== undefined ? isActive : !user.isActive;
  await user.save();
  
  res.json({
    success: true,
    message: user.isActive 
      ? 'Đã mở khóa tài khoản' 
      : 'Đã khóa tài khoản',
    data: { isActive: user.isActive },
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    throw ApiError.notFound('Không tìm thấy người dùng');
  }
  
  // Prevent admin from deleting themselves
  if (req.user._id.toString() === user._id.toString()) {
    throw ApiError.badRequest('Bạn không thể xóa chính mình');
  }
  
  // Check if user has orders
  const orderCount = await Order.countDocuments({ userId: req.params.id });
  if (orderCount > 0) {
    // Soft delete instead
    user.isActive = false;
    user.email = `deleted_${user._id}_${user.email}`;
    user.phone = `deleted_${user._id}_${user.phone}`;
    await user.save();
    
    return res.json({
      success: true,
      message: 'Người dùng có đơn hàng nên đã bị vô hiệu hóa thay vì xóa',
    });
  }
  
  await User.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Xóa người dùng thành công',
  });
});

module.exports = {
  getAll,
  getById,
  getUserOrders,
  getUserPoints,
  update,
  updatePoints,
  toggleBlock,
  delete: remove,
};
