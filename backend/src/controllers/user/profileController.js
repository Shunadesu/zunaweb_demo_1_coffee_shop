const User = require('../../models/User');
const Product = require('../../models/Product');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  User
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('favoriteProducts', 'name images basePrice slug')
    .populate('favoriteCategories', 'name image slug');
  
  res.json({ success: true, data: user });
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  User
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar, birthday } = req.body;
  
  const user = await User.findById(req.user._id);
  
  if (name) user.name = name;
  if (avatar !== undefined) user.avatar = avatar;
  if (birthday !== undefined) user.birthday = birthday;
  
  await user.save();
  
  res.json({
    success: true,
    message: 'Cập nhật profile thành công',
    data: user,
  });
});

/**
 * @route   PUT /api/user/profile/address
 * @desc    Update user addresses
 * @access  User
 */
const updateAddress = asyncHandler(async (req, res) => {
  const { addresses } = req.body;
  
  if (!Array.isArray(addresses)) {
    return res.status(400).json({
      success: false,
      message: 'Địa chỉ phải là một mảng',
    });
  }
  
  const user = await User.findById(req.user._id);
  
  // Ensure only one default address
  if (addresses.some(addr => addr.isDefault)) {
    addresses.forEach((addr, i) => {
      addr.isDefault = i === addresses.findIndex(a => a.isDefault);
    });
  }
  
  user.addresses = addresses;
  await user.save();
  
  res.json({
    success: true,
    message: 'Cập nhật địa chỉ thành công',
    data: user.addresses,
  });
});

/**
 * @route   GET /api/user/profile/favorites
 * @desc    Get favorite products
 * @access  User
 */
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate({
      path: 'favoriteProducts',
      select: 'name slug images basePrice rating category isAvailable',
    });
  
  res.json({
    success: true,
    data: user.favoriteProducts || [],
  });
});

/**
 * @route   POST /api/user/profile/favorites/:productId
 * @desc    Add to favorites
 * @access  User
 */
const addFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm',
    });
  }
  
  const user = await User.findById(req.user._id);
  
  if (user.favoriteProducts.includes(productId)) {
    return res.json({
      success: true,
      message: 'Sản phẩm đã có trong danh sách yêu thích',
      data: user.favoriteProducts,
    });
  }
  
  user.favoriteProducts.push(productId);
  await user.save();
  
  res.json({
    success: true,
    message: 'Đã thêm vào danh sách yêu thích',
    data: user.favoriteProducts,
  });
});

/**
 * @route   DELETE /api/user/profile/favorites/:productId
 * @desc    Remove from favorites
 * @access  User
 */
const removeFavorite = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const user = await User.findById(req.user._id);
  
  user.favoriteProducts = user.favoriteProducts.filter(
    id => id.toString() !== productId
  );
  await user.save();
  
  res.json({
    success: true,
    message: 'Đã xóa khỏi danh sách yêu thích',
    data: user.favoriteProducts,
  });
});

module.exports = {
  getProfile,
  updateProfile,
  updateAddress,
  getFavorites,
  addFavorite,
  removeFavorite,
};
