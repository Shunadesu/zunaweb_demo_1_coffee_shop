const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateTokens, verifyRefreshToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }

  const { email, phone, password, name, birthday, referralCode } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (existingUser) {
    throw ApiError.conflict('Email hoặc số điện thoại đã được sử dụng');
  }

  // Check referral code
  let referredBy = null;
  if (referralCode) {
    referredBy = await User.findOne({ referralCode });
    if (!referredBy) {
      throw ApiError.badRequest('Mã giới thiệu không hợp lệ');
    }
  }

  // Generate codes
  const memberCode = await User.generateMemberCode();
  const newReferralCode = User.generateReferralCode();

  // Create user
  const user = new User({
    email,
    phone,
    password,
    name,
    birthday,
    memberCode,
    referralCode: newReferralCode,
    referredBy: referredBy?._id,
  });

  await user.save();

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }

  const { identifier, password } = req.body;

  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }],
  }).select('+password');

  if (!user) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  }

  // Check if user is active
  if (!user.isActive) {
    throw ApiError.unauthorized('Tài khoản đã bị vô hiệu hóa');
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
  }

  // Generate tokens
  const { accessToken, refreshToken } = await generateTokens(user);

  res.json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null,
  });

  res.json({
    success: true,
    message: 'Đăng xuất thành công',
  });
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
const refreshTokenHandler = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw ApiError.badRequest('Refresh token is required');
  }

  const user = await verifyRefreshToken(token);

  if (!user) {
    throw ApiError.unauthorized('Refresh token không hợp lệ');
  }

  const tokens = await generateTokens(user);

  res.json({
    success: true,
    data: tokens,
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favoriteProducts', 'name images basePrice')
    .populate('favoriteCategories', 'name image');

  res.json({
    success: true,
    data: user,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, birthday, addresses } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (birthday !== undefined) user.birthday = birthday;
  if (addresses) user.addresses = addresses;

  await user.save();

  res.json({
    success: true,
    message: 'Cập nhật profile thành công',
    data: user,
  });
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }

  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Mật khẩu hiện tại không đúng');
  }

  user.password = newPassword;
  await user.save();

  // Generate new tokens
  const tokens = await generateTokens(user);

  res.json({
    success: true,
    message: 'Đổi mật khẩu thành công',
    data: tokens,
  });
});

module.exports = {
  register,
  login,
  logout,
  refreshToken: refreshTokenHandler,
  getMe,
  updateProfile,
  changePassword,
};
