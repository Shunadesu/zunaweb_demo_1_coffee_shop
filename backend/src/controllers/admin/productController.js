const { validationResult } = require('express-validator');
const Product = require('../../models/Product');
const Category = require('../../models/Category');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');

/**
 * @route   GET /api/admin/products
 * @desc    Get all products
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, search, status, sort = '-createdAt' } = req.query;
  
  const query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  if (status === 'available') {
    query.isAvailable = true;
  } else if (status === 'unavailable') {
    query.isAvailable = false;
  } else if (status === 'featured') {
    query.isFeatured = true;
  } else if (status === 'bestseller') {
    query.isBestSeller = true;
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(products, total, page, limitNum));
});

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product by ID
 * @access  Admin
 */
const getById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug description');
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  res.json({ success: true, data: product });
});

/**
 * @route   GET /api/admin/products/:id/stats
 * @desc    Get product statistics
 * @access  Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  res.json({
    success: true,
    data: {
      soldCount: product.soldCount,
      viewCount: product.viewCount,
      rating: product.rating,
      reviewCount: product.reviewCount,
      stock: product.stock,
      isAvailable: product.isAvailable,
    },
  });
});

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }
  
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }
  
  // Generate slug
  let slug = Product.generateSlug(req.body.name);
  
  // Check slug unique
  const existingSlug = await Product.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }
  
  const productData = {
    ...req.body,
    slug,
    categoryName: category.name,
    createdBy: req.user._id,
  };
  
  const product = new Product(productData);
  await product.save();
  
  res.status(201).json({
    success: true,
    message: 'Tạo sản phẩm thành công',
    data: product,
  });
});

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  // If category changed, update categoryName
  if (req.body.category && req.body.category !== product.category.toString()) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      throw ApiError.notFound('Không tìm thấy danh mục');
    }
    req.body.categoryName = category.name;
  }
  
  // Update slug if name changed
  if (req.body.name && req.body.name !== product.name) {
    let slug = Product.generateSlug(req.body.name);
    const existingSlug = await Product.findOne({ 
      slug, 
      _id: { $ne: product._id } 
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
    req.body.slug = slug;
  }
  
  Object.assign(product, req.body);
  await product.save();
  
  res.json({
    success: true,
    message: 'Cập nhật sản phẩm thành công',
    data: product,
  });
});

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Delete product
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  res.json({
    success: true,
    message: 'Xóa sản phẩm thành công',
  });
});

// Alias for delete
const deleteProduct = remove;

/**
 * @route   PATCH /api/admin/products/:id/availability
 * @desc    Toggle product availability
 * @access  Admin
 */
const toggleAvailability = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  product.isAvailable = !product.isAvailable;
  await product.save();
  
  res.json({
    success: true,
    message: product.isAvailable 
      ? 'Sản phẩm đã được hiển thị' 
      : 'Sản phẩm đã được ẩn',
    data: { isAvailable: product.isAvailable },
  });
});

/**
 * @route   PATCH /api/admin/products/:id/featured
 * @desc    Toggle featured status
 * @access  Admin
 */
const toggleFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  product.isFeatured = !product.isFeatured;
  await product.save();
  
  res.json({
    success: true,
    message: product.isFeatured 
      ? 'Sản phẩm đã được đánh dấu nổi bật' 
      : 'Đã bỏ đánh dấu nổi bật',
    data: { isFeatured: product.isFeatured },
  });
});

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Upload product images
 * @access  Admin
 */
const uploadImages = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  // In production, use multer + cloudinary
  // For now, accept URL strings
  const { images } = req.body;
  
  if (Array.isArray(images)) {
    images.forEach((img, index) => {
      product.images.push({
        url: img.url,
        alt: img.alt || product.name,
        isPrimary: images.length === 1 || (img.isPrimary && index === 0),
      });
    });
  }
  
  await product.save();
  
  res.json({
    success: true,
    message: 'Thêm ảnh thành công',
    data: product.images,
  });
});

/**
 * @route   DELETE /api/admin/products/:id/images/:imageId
 * @desc    Delete product image
 * @access  Admin
 */
const deleteImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw ApiError.notFound('Không tìm thấy sản phẩm');
  }
  
  const imageIndex = product.images.findIndex(
    img => img._id.toString() === req.params.imageId
  );
  
  if (imageIndex === -1) {
    throw ApiError.notFound('Không tìm thấy ảnh');
  }
  
  product.images.splice(imageIndex, 1);
  
  // Set new primary if needed
  if (product.images.length > 0 && !product.images.some(img => img.isPrimary)) {
    product.images[0].isPrimary = true;
  }
  
  await product.save();
  
  res.json({
    success: true,
    message: 'Xóa ảnh thành công',
    data: product.images,
  });
});

module.exports = {
  getAll,
  getById,
  getStats,
  create,
  update,
  delete: deleteProduct,
  toggleAvailability,
  toggleFeatured,
  uploadImages,
  deleteImage,
};
