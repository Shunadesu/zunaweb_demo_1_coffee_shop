import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiThumbsUp, FiStar, FiCheck, FiChevronDown } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../../api/user/reviewApi';
import LoadingSpinner from '../ui/LoadingSpinner';

const ReviewSection = ({ productId, productName }) => {
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('recent');
  const [expandedReviews, setExpandedReviews] = useState({});
  const [filterRating, setFilterRating] = useState(null);

  // Fetch reviews
  const { data, isLoading, error } = useQuery({
    queryKey: ['reviews', productId, sortBy],
    queryFn: () => reviewApi.getProductReviews(productId, { sortBy }),
    staleTime: 1000 * 60 * 2,
  });

  const reviews = data?.data?.reviews || [];
  const stats = data?.data?.stats || {};
  const pagination = data?.data?.pagination || {};

  // Mark helpful mutation
  const helpfulMutation = useMutation({
    mutationFn: (reviewId) => reviewApi.markHelpful(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews', productId]);
    },
  });

  const toggleExpand = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const filteredReviews = filterRating
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-4xl font-bold text-gray-900">
              {stats.averageRating?.toFixed(1) || '0.0'}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <FiStar
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.averageRating || 0)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.totalReviews || 0} đánh giá
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats[`rating${rating}`] || 0;
              const percentage = stats.totalReviews > 0
                ? (count / stats.totalReviews) * 100
                : 0;

              return (
                <button
                  key={rating}
                  onClick={() => setFilterRating(filterRating === rating ? null : rating)}
                  className={`flex items-center gap-2 w-full group ${
                    filterRating === rating ? 'bg-primary-50 px-2 py-1 rounded-lg' : ''
                  }`}
                >
                  <span className="text-sm w-6">{rating}</span>
                  <FiStar className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-yellow-400 rounded-full"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-10">{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sort & Filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          {filteredReviews.length} đánh giá
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="ml-2 text-sm text-primary-600 hover:underline"
            >
              (Xóa lọc)
            </button>
          )}
        </h3>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value="recent">Mới nhất</option>
            <option value="helpful">Hữu ích nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-8">
          <LoadingSpinner />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có đánh giá nào cho sản phẩm này
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isExpanded={expandedReviews[review.id]}
              onToggleExpand={() => toggleExpand(review.id)}
              onMarkHelpful={() => helpfulMutation.mutate(review.id)}
              isHelpfulLoading={helpfulMutation.isPending}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.pages > 1 && (
        <div className="text-center">
          <button className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Xem thêm đánh giá
          </button>
        </div>
      )}
    </div>
  );
};

const ReviewCard = ({
  review,
  isExpanded,
  onToggleExpand,
  onMarkHelpful,
  isHelpfulLoading,
}) => {
  const isLongComment = review.comment?.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            {review.user?.avatar ? (
              <img
                src={review.user.avatar}
                alt={review.user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-semibold">
                {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.user?.name || 'Người dùng'}
              </span>
              {review.isVerified && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <FiCheck className="w-3 h-3" />
                  Đã mua hàng
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-3 h-3 ${
                      star <= review.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>•</span>
              <span>{formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {review.title && (
        <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
      )}

      <p className="text-gray-600">
        {isExpanded || !isLongComment
          ? review.comment
          : `${review.comment?.slice(0, 200)}...`}
        {isLongComment && (
          <button
            onClick={onToggleExpand}
            className="text-primary-600 hover:underline ml-1"
          >
            {isExpanded ? 'Thu gọn' : 'Xem thêm'}
          </button>
        )}
      </p>

      {/* Images */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mt-3">
          {review.images.map((img, index) => (
            <img
              key={index}
              src={img.url}
              alt={`Review image ${index + 1}`}
              className="w-20 h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      {/* Admin Reply */}
      {review.adminReply && (
        <div className="mt-4 bg-gray-50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-900 mb-1">
            Phản hồi từ Coffee Shop
          </div>
          <p className="text-sm text-gray-600">{review.adminReply}</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={onMarkHelpful}
          disabled={isHelpfulLoading}
          className={`flex items-center gap-2 text-sm transition-colors ${
            review.isUserMarked
              ? 'text-primary-600'
              : 'text-gray-500 hover:text-primary-600'
          }`}
        >
          <FiThumbsUp className="w-4 h-4" />
          Hữu ích ({review.helpful || 0})
        </button>
      </div>
    </motion.div>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default ReviewSection;
