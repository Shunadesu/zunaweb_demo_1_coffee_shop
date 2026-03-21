const ApiError = require('../../utils/ApiError');
const { asyncHandler } = require('../../middleware/errorHandler');
const config = require('../../config/env');
const path = require('path');

/**
 * @route   POST /api/admin/upload/image
 * @desc    Upload single image
 * @access  Admin
 */
const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Vui lòng chọn file ảnh');
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Tải ảnh lên thành công',
    data: {
      url: imageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
});

/**
 * @route   POST /api/admin/upload/images
 * @desc    Upload multiple images
 * @access  Admin
 */
const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw ApiError.badRequest('Vui lòng chọn ít nhất một file ảnh');
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const images = req.files.map(file => ({
    url: `${baseUrl}/uploads/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname,
    size: file.size,
  }));

  res.json({
    success: true,
    message: `Tải ${images.length} ảnh lên thành công`,
    data: images,
  });
});

module.exports = {
  uploadImage,
  uploadImages,
};
