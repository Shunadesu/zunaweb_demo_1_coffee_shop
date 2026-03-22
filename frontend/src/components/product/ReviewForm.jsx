import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiStar, FiX, FiUpload, FiCheck } from 'react-icons/fi';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../api/user/reviewApi';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import LoadingSpinner from '../ui/LoadingSpinner';

const ReviewForm = ({
  productId,
  productName,
  onSuccess,
  onCancel,
  orderId = null,
  variant = 'modal', // 'modal' | 'inline'
}) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  // Create review mutation
  const createMutation = useMutation({
    mutationFn: (data) => reviewApi.createReview(productId, data),
    onSuccess: (response) => {
      addToast({
        type: 'success',
        message: 'Cảm ơn bạn! Đánh giá của bạn đã được gửi.',
      });
      
      // Invalidate reviews query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] });
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Reset form
      setRating(0);
      setTitle('');
      setComment('');
      setImages([]);
    },
    onError: (error) => {
      addToast({
        type: 'error',
        message: error?.response?.data?.message || 'Đã xảy ra lỗi khi gửi đánh giá.',
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (rating === 0) {
      newErrors.rating = 'Vui lòng chọn số sao đánh giá';
    }
    if (!comment.trim()) {
      newErrors.comment = 'Vui lòng nhập nội dung đánh giá';
    }
    if (comment.length > 1000) {
      newErrors.comment = 'Đánh giá không được vượt quá 1000 ký tự';
    }
    if (title.length > 100) {
      newErrors.title = 'Tiêu đề không được vượt quá 100 ký tự';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    createMutation.mutate({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images,
      orderId,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      addToast({
        type: 'warning',
        message: 'Tối đa 5 hình ảnh',
      });
      return;
    }

    // Preview images (in real app, upload to server first)
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  // Star rating component
  const StarRating = ({ size = 'lg', interactive = true }) => {
    const starSizes = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <FiStar
              className={`
                ${starSizes[size]}
                ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }
                transition-colors
              `}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-gray-600 mb-4">
          Bạn cần đăng nhập để viết đánh giá
        </p>
        <a
          href="/login"
          className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Đăng nhập ngay
        </a>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <motion.form
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
      >
        <h3 className="font-semibold text-gray-900">
          Viết đánh giá cho {productName}
        </h3>

        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Đánh giá của bạn
          </label>
          <div className="flex items-center gap-3">
            <StarRating />
            <span className="text-sm text-gray-500">
              {rating > 0 ? `${rating}/5 sao` : 'Chọn số sao'}
            </span>
          </div>
          {errors.rating && (
            <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề (tùy chọn)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tóm tắt đánh giá của bạn"
            maxLength={100}
            className={`input ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá
          </label>
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setErrors({ ...errors, comment: undefined });
            }}
            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
            rows={4}
            maxLength={1000}
            className={`input resize-none ${errors.comment ? 'border-red-500' : ''}`}
          />
          <div className="flex justify-between mt-1">
            {errors.comment && (
              <p className="text-red-500 text-sm">{errors.comment}</p>
            )}
            <span className="text-sm text-gray-400 ml-auto">
              {comment.length}/1000
            </span>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hình ảnh (tùy chọn)
          </label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative w-20 h-20 rounded-lg overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                <FiUpload className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-400 mt-1">Tải lên</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn btn-primary flex items-center gap-2"
          >
            {createMutation.isPending ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                <span>Đang gửi...</span>
              </>
            ) : (
              <>
                <FiCheck className="w-4 h-4" />
                <span>Gửi đánh giá</span>
              </>
            )}
          </button>
        </div>
      </motion.form>
    );
  }

  // Modal variant (default)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel?.()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg text-gray-900">
            Đánh giá sản phẩm
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Product Info */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <p className="text-sm text-gray-500">Đánh giá cho:</p>
          <p className="font-medium text-gray-900">{productName}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá của bạn *
            </label>
            <div className="flex items-center gap-3">
              <StarRating size="lg" />
              <span className="text-sm text-gray-500">
                {rating > 0 ? `${rating}/5 sao` : 'Chọn số sao'}
              </span>
            </div>
            {errors.rating && (
              <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề đánh giá
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Sản phẩm rất ngon, sẽ mua lại!"
              maxLength={100}
              className={`input ${errors.title ? 'border-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title}</p>
              )}
              <span className="text-sm text-gray-400 ml-auto">
                {title.length}/100
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nội dung đánh giá *
            </label>
            <textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setErrors({ ...errors, comment: undefined });
              }}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này. Bạn thích điều gì? Sản phẩm có điểm gì cần cải thiện?"
              rows={5}
              maxLength={1000}
              className={`input resize-none ${errors.comment ? 'border-red-500' : ''}`}
            />
            <div className="flex justify-between mt-1">
              {errors.comment && (
                <p className="text-red-500 text-sm">{errors.comment}</p>
              )}
              <span className="text-sm text-gray-400 ml-auto">
                {comment.length}/1000
              </span>
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh (tùy chọn)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Tải lên tối đa 5 hình ảnh để chia sẻ trải nghiệm của bạn
            </p>
            <div className="flex flex-wrap gap-3">
              {images.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative w-24 h-24 rounded-xl overflow-hidden group"
                >
                  <img
                    src={img.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
              {images.length < 5 && (
                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <FiUpload className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400 mt-1">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">
              Mẹo viết đánh giá hay:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Chia sẻ trải nghiệm thực tế khi sử dụng sản phẩm</li>
              <li>• Nêu rõ điều gì bạn thích và không thích</li>
              <li>• So sánh với các sản phẩm tương tự đã dùng</li>
              <li>• Đánh giá về chất lượng, giá cả và dịch vụ</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="btn btn-primary px-6 py-2.5 flex items-center gap-2 disabled:opacity-50"
            >
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <FiCheck className="w-4 h-4" />
                  <span>Gửi đánh giá</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ReviewForm;
