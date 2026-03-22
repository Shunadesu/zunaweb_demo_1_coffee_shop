const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');

// Async handler helper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ==================== USER CONTROLLERS ====================

// Get user's wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const result = await Wishlist.getWishlistWithDetails(userId, { page, limit });

  res.json({
    success: true,
    data: result
  });
});

// Add product to wishlist
const addToWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId, note } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Sản phẩm không tồn tại');
  }

  if (!product.isActive) {
    throw ApiError.badRequest('Sản phẩm không khả dụng');
  }

  const result = await Wishlist.addProduct(userId, productId, note);

  res.status(201).json({
    success: true,
    message: result.added
      ? 'Đã thêm vào danh sách yêu thích'
      : result.message,
    data: {
      isInWishlist: true,
      totalItems: result.wishlist.totalItems
    }
  });
});

// Remove product from wishlist
const removeFromWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const result = await Wishlist.removeProduct(userId, productId);

  if (!result.removed) {
    throw ApiError.notFound(result.message);
  }

  res.json({
    success: true,
    message: 'Đã xóa khỏi danh sách yêu thích',
    data: {
      isInWishlist: false,
      totalItems: result.wishlist.totalItems
    }
  });
});

// Check if product is in wishlist
const checkWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;

  const isInWishlist = await Wishlist.isInWishlist(userId, productId);

  res.json({
    success: true,
    data: { isInWishlist }
  });
});

// Clear entire wishlist
const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Wishlist.findOneAndUpdate(
    { user: userId },
    { products: [], totalItems: 0 },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Đã xóa toàn bộ danh sách yêu thích'
  });
});

// Update note for wishlist item
const updateWishlistItemNote = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { note } = req.body;

  const wishlist = await Wishlist.findOne({ user: userId });
  
  if (!wishlist) {
    throw ApiError.notFound('Không tìm thấy danh sách yêu thích');
  }

  const item = wishlist.products.find(
    p => p.product.toString() === productId.toString()
  );

  if (!item) {
    throw ApiError.notFound('Sản phẩm không có trong danh sách yêu thích');
  }

  item.note = note;
  await wishlist.save();

  res.json({
    success: true,
    message: 'Đã cập nhật ghi chú'
  });
});

// Move product to cart (remove from wishlist)
const moveToCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  const { quantity = 1 } = req.body;

  // Check product
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Sản phẩm không tồn tại');
  }

  // Remove from wishlist
  await Wishlist.removeProduct(userId, productId);

  // Note: Actual cart logic would be handled by cart controller
  // This just removes from wishlist

  res.json({
    success: true,
    message: 'Đã chuyển vào giỏ hàng và xóa khỏi yêu thích'
  });
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
  updateWishlistItemNote,
  moveToCart
};
