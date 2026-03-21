const { validationResult } = require('express-validator');
const Category = require('../../models/Category');
const Product = require('../../models/Product');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
  const { includeInactive = 'false' } = req.query;
  
  const query = includeInactive === 'true' ? {} : { isActive: true };
  
  const categories = await Category.find(query)
    .populate('createdBy', 'name')
    .sort({ sortOrder: 1, createdAt: -1 });
  
  res.json({ success: true, data: categories });
});

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get category by ID
 * @access  Admin
 */
const getById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('createdBy', 'name');
  
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }
  
  res.json({ success: true, data: category });
});

/**
 * @route   GET /api/admin/categories/:id/products
 * @desc    Get products in category
 * @access  Admin
 */
const getProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  
  const [products, total] = await Promise.all([
    Product.find({ category: req.params.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    Product.countDocuments({ category: req.params.id }),
  ]);
  
  res.json({
    success: true,
    data: products,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }
  
  // Generate slug
  let slug = Category.generateSlug(req.body.name);
  
  // Check slug unique
  const existingSlug = await Category.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }
  
  // Get max sortOrder
  const maxSortOrder = await Category.findOne()
    .sort({ sortOrder: -1 })
    .select('sortOrder');
  
  const categoryData = {
    ...req.body,
    slug,
    sortOrder: req.body.sortOrder ?? (maxSortOrder?.sortOrder + 1 || 0),
    createdBy: req.user._id,
  };
  
  const category = new Category(categoryData);
  await category.save();
  
  res.status(201).json({
    success: true,
    message: 'Tạo danh mục thành công',
    data: category,
  });
});

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }
  
  // Update slug if name changed
  if (req.body.name && req.body.name !== category.name) {
    let slug = Category.generateSlug(req.body.name);
    const existingSlug = await Category.findOne({ 
      slug, 
      _id: { $ne: category._id } 
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
    req.body.slug = slug;
  }
  
  Object.assign(category, req.body);
  await category.save();
  
  res.json({
    success: true,
    message: 'Cập nhật danh mục thành công',
    data: category,
  });
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }
  
  // Check if category has products
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `Không thể xóa danh mục có ${productCount} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`
    );
  }
  
  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({ parentId: req.params.id });
  if (subcategoryCount > 0) {
    throw ApiError.badRequest(
      `Danh mục có ${subcategoryCount} danh mục con. Hãy xóa hoặc chuyển danh mục con trước.`
    );
  }
  
  await Category.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Xóa danh mục thành công',
  });
});

/**
 * @route   PATCH /api/admin/categories/:id/reorder
 * @desc    Reorder category
 * @access  Admin
 */
const reorder = asyncHandler(async (req, res) => {
  const { sortOrder } = req.body;
  
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }
  
  category.sortOrder = sortOrder;
  await category.save();
  
  res.json({
    success: true,
    message: 'Cập nhật thứ tự thành công',
    data: { sortOrder },
  });
});

/**
 * @route   PATCH /api/admin/categories/:id/status
 * @desc    Toggle category status
 * @access  Admin
 */
const toggleStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    throw ApiError.notFound('Không tìm thấy danh mục');
  }
  
  category.isActive = isActive !== undefined ? isActive : !category.isActive;
  await category.save();
  
  res.json({
    success: true,
    message: category.isActive 
      ? 'Danh mục đã được kích hoạt' 
      : 'Danh mục đã bị vô hiệu hóa',
    data: { isActive: category.isActive },
  });
});

module.exports = {
  getAll,
  getById,
  getProducts,
  create,
  update,
  delete: remove,
  reorder,
  toggleStatus,
};
