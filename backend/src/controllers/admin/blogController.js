const { validationResult } = require('express-validator');
const Blog = require('../../models/Blog');
const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const { buildPaginationResponse, paginate } = require('../../utils/helpers');

/**
 * @route   GET /api/admin/blog
 * @desc    Get all blogs
 * @access  Admin
 */
const getAll = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, category, status, search, sort = '-createdAt' } = req.query;
  
  const query = {};
  
  if (category) {
    query.category = category;
  }
  
  if (status) {
    query.status = status;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .populate('author', 'name avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Blog.countDocuments(query),
  ]);
  
  res.json(buildPaginationResponse(blogs, total, page, limitNum));
});

/**
 * @route   GET /api/admin/blog/:id
 * @desc    Get blog by ID
 * @access  Admin
 */
const getById = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id)
    .populate('author', 'name avatar')
    .populate('relatedProducts', 'name images basePrice');
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  res.json({ success: true, data: blog });
});

/**
 * @route   GET /api/admin/blog/:id/comments
 * @desc    Get blog comments
 * @access  Admin
 */
const getComments = asyncHandler(async (req, res) => {
  const BlogComment = require('../../models/BlogComment');
  
  const { page = 1, limit = 20 } = req.query;
  const { skip, limit: limitNum } = paginate(page, limit);
  
  const [comments, total] = await Promise.all([
    BlogComment.find({ blog: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    BlogComment.countDocuments({ blog: req.params.id }),
  ]);
  
  res.json(buildPaginationResponse(comments, total, page, limitNum));
});

/**
 * @route   POST /api/admin/blog
 * @desc    Create new blog
 * @access  Admin
 */
const create = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw ApiError.badRequest('Dữ liệu không hợp lệ', errors.array());
  }
  
  // Generate slug
  let slug = Blog.generateSlug(req.body.title);
  
  // Check slug unique
  const existingSlug = await Blog.findOne({ slug });
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }
  
  const blogData = {
    ...req.body,
    slug,
    author: req.user._id,
    authorName: req.user.name,
    authorAvatar: req.user.avatar,
  };
  
  // Set publishedAt if publishing
  if (req.body.status === 'PUBLISHED' && !req.body.publishedAt) {
    blogData.publishedAt = new Date();
  }
  
  const blog = new Blog(blogData);
  await blog.save();
  
  res.status(201).json({
    success: true,
    message: 'Tạo bài viết thành công',
    data: blog,
  });
});

/**
 * @route   PUT /api/admin/blog/:id
 * @desc    Update blog
 * @access  Admin
 */
const update = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  // Update slug if title changed
  if (req.body.title && req.body.title !== blog.title) {
    let slug = Blog.generateSlug(req.body.title);
    const existingSlug = await Blog.findOne({ 
      slug, 
      _id: { $ne: blog._id } 
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }
    req.body.slug = slug;
  }
  
  // Set publishedAt if publishing for first time
  if (req.body.status === 'PUBLISHED' && blog.status !== 'PUBLISHED' && !blog.publishedAt) {
    req.body.publishedAt = new Date();
  }
  
  Object.assign(blog, req.body);
  await blog.save();
  
  res.json({
    success: true,
    message: 'Cập nhật bài viết thành công',
    data: blog,
  });
});

/**
 * @route   DELETE /api/admin/blog/:id
 * @desc    Delete blog
 * @access  Admin
 */
const remove = asyncHandler(async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  // Delete related comments
  const BlogComment = require('../../models/BlogComment');
  await BlogComment.deleteMany({ blog: req.params.id });
  
  res.json({
    success: true,
    message: 'Xóa bài viết thành công',
  });
});

/**
 * @route   PATCH /api/admin/blog/:id/status
 * @desc    Update blog status
 * @access  Admin
 */
const updateStatus = asyncHandler(async (req, res) => {
  const { status, publishedAt } = req.body;
  
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  blog.status = status;
  if (publishedAt) blog.publishedAt = publishedAt;
  if (status === 'PUBLISHED' && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }
  
  await blog.save();
  
  res.json({
    success: true,
    message: 'Cập nhật trạng thái thành công',
    data: { status: blog.status },
  });
});

/**
 * @route   PATCH /api/admin/blog/:id/featured
 * @desc    Toggle featured status
 * @access  Admin
 */
const toggleFeatured = asyncHandler(async (req, res) => {
  const { isFeatured } = req.body;
  
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  blog.isFeatured = isFeatured !== undefined ? isFeatured : !blog.isFeatured;
  await blog.save();
  
  res.json({
    success: true,
    message: blog.isFeatured 
      ? 'Bài viết đã được đánh dấu nổi bật' 
      : 'Đã bỏ đánh dấu nổi bật',
    data: { isFeatured: blog.isFeatured },
  });
});

/**
 * @route   POST /api/admin/blog/:id/images
 * @desc    Upload blog images
 * @access  Admin
 */
const uploadImages = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  const { images } = req.body;
  
  if (Array.isArray(images)) {
    images.forEach(img => {
      blog.gallery.push({
        url: img.url,
        alt: img.alt || '',
        caption: img.caption || '',
      });
    });
  }
  
  await blog.save();
  
  res.json({
    success: true,
    message: 'Thêm ảnh thành công',
    data: blog.gallery,
  });
});

/**
 * @route   GET /api/admin/blog/:id/analytics
 * @desc    Get blog analytics
 * @access  Admin
 */
const getAnalytics = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    throw ApiError.notFound('Không tìm thấy bài viết');
  }
  
  // Get views by day (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // For now, return basic stats
  // In production, you'd have a BlogView model to track daily views
  res.json({
    success: true,
    data: {
      viewCount: blog.viewCount,
      likeCount: blog.likeCount,
      commentCount: blog.commentCount,
      shareCount: blog.shareCount,
      period: '30 days',
    },
  });
});

module.exports = {
  getAll,
  getById,
  getComments,
  create,
  update,
  delete: remove,
  updateStatus,
  toggleFeatured,
  uploadImages,
  getAnalytics,
};
