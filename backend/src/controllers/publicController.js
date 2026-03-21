const Category = require('../models/Category');
const Product = require('../models/Product');
const Blog = require('../models/Blog');
const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../utils/helpers');

/**
 * @route   GET /api/public/categories
 * @desc    Get all active categories
 * @access  Public
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1 })
    .select('name slug image icon description productCount');
  
  res.json({ success: true, data: categories });
});

/**
 * @route   GET /api/public/categories/:slug
 * @desc    Get category by slug
 * @access  Public
 */
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ 
    slug: req.params.slug, 
    isActive: true 
  });
  
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy danh mục',
    });
  }
  
  res.json({ success: true, data: category });
});

/**
 * @route   GET /api/public/products
 * @desc    Get all available products
 * @access  Public
 */
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 12, category, search, sort = 'createdAt', minPrice, maxPrice } = req.query;
  
  const query = { isAvailable: true };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  if (minPrice || maxPrice) {
    query.basePrice = {};
    if (minPrice) query.basePrice.$gte = parseInt(minPrice);
    if (maxPrice) query.basePrice.$lte = parseInt(maxPrice);
  }
  
  let sortOption = { createdAt: -1 };
  switch (sort) {
    case 'price_asc':
      sortOption = { basePrice: 1 };
      break;
    case 'price_desc':
      sortOption = { basePrice: -1 };
      break;
    case 'name':
      sortOption = { name: 1 };
      break;
    case 'popular':
      sortOption = { soldCount: -1 };
      break;
    case 'rating':
      sortOption = { rating: -1 };
      break;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(products, total, page, limitNum));
});

/**
 * @route   GET /api/public/products/featured
 * @desc    Get featured products
 * @access  Public
 */
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;
  
  const [featured, bestSellers] = await Promise.all([
    Product.find({ isAvailable: true, isFeatured: true })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit)),
    Product.find({ isAvailable: true, isBestSeller: true })
      .populate('category', 'name slug')
      .sort({ soldCount: -1 })
      .limit(parseInt(limit)),
  ]);
  
  res.json({
    success: true,
    data: {
      featured,
      bestSellers,
    },
  });
});

/**
 * @route   GET /api/public/products/:slug
 * @desc    Get product by slug
 * @access  Public
 */
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ 
    slug: req.params.slug,
    isAvailable: true,
  }).populate('category', 'name slug description');
  
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy sản phẩm',
    });
  }
  
  // Increment view count
  product.viewCount += 1;
  await product.save();
  
  res.json({ success: true, data: product });
});

/**
 * @route   GET /api/public/blogs
 * @desc    Get published blogs
 * @access  Public
 */
const getBlogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, tag } = req.query;
  
  const query = { 
    status: 'PUBLISHED',
    $or: [
      { scheduledAt: { $exists: false } },
      { scheduledAt: { $lte: new Date() } },
    ],
  };
  
  if (category) {
    query.category = category;
  }
  
  if (tag) {
    query.tags = tag;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate('author', 'name avatar')
      .select('-content -gallery -likes')
      .sort({ isPinned: -1, publishedAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Blog.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(blogs, total, page, limitNum));
});

/**
 * @route   GET /api/public/blogs/:slug
 * @desc    Get blog by slug
 * @access  Public
 */
const getBlogBySlug = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ 
    slug: req.params.slug,
    status: 'PUBLISHED',
  }).populate('author', 'name avatar')
    .populate('relatedProducts', 'name slug images basePrice');
  
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết',
    });
  }
  
  // Increment view count
  blog.viewCount += 1;
  await blog.save();
  
  res.json({ success: true, data: blog });
});

/**
 * @route   POST /api/public/blogs/:id/like
 * @desc    Toggle blog like
 * @access  Public (requires auth via optionalAuth in route)
 */
const toggleBlogLike = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy bài viết',
    });
  }
  
  const isLiked = await blog.toggleLike(req.user._id);
  
  res.json({
    success: true,
    message: isLiked ? 'Đã thích bài viết' : 'Đã bỏ thích',
    data: { likeCount: blog.likeCount, isLiked },
  });
});

/**
 * @route   GET /api/public/coupons/public
 * @desc    Get public coupons
 * @access  Public
 */
const getPublicCoupons = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const coupons = await Coupon.find({
    isActive: true,
    isPublic: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { totalLimit: { $exists: false } },
      { $expr: { $lt: ['$usedCount', '$totalLimit'] } },
    ],
  })
    .sort({ discountValue: -1 })
    .limit(10);
  
  res.json({ success: true, data: coupons });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  getBlogs,
  getBlogBySlug,
  toggleBlogLike,
  getPublicCoupons,
};
