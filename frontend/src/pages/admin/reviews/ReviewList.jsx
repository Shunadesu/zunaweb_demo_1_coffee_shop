import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiCheck, FiX, FiEye, FiTrash2, FiMessageCircle, FiFilter, FiAlertCircle } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '@/api/user/reviewApi';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const ReviewList = () => {
  const queryClient = useQueryClient();
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    isVerified: '',
    rating: '',
    isPublished: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [replyModal, setReplyModal] = useState({ open: false, review: null });
  const [replyText, setReplyText] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, review: null });

  // Fetch reviews
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'reviews', filters],
    queryFn: () => reviewApi.getAllReviews(filters),
  });

  const reviews = data?.data?.reviews || [];
  const pagination = data?.data?.pagination || {};

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ reviewId, isPublished }) => 
      reviewApi.updateReviewStatus(reviewId, { isPublished }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
    },
  });

  // Reply mutation
  const replyMutation = useMutation({
    mutationFn: ({ reviewId, reply }) => 
      reviewApi.replyToReview(reviewId, { reply }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setReplyModal({ open: false, review: null });
      setReplyText('');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (reviewId) => reviewApi.deleteReviewAdmin(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      setDeleteDialog({ open: false, review: null });
    },
  });

  const handleReply = (review) => {
    setReplyModal({ open: true, review });
    setReplyText(review.adminReply || '');
  };

  const submitReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate({
      reviewId: replyModal.review.id,
      reply: replyText.trim(),
    });
  };

  const submitDelete = () => {
    if (deleteDialog.review) {
      deleteMutation.mutate(deleteDialog.review.id);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (rating) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đánh giá</h1>
          <p className="text-gray-500 mt-1">
            Quản lý và phản hồi đánh giá từ khách hàng
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-wrap gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-400" />
            <select
              value={filters.isPublished}
              onChange={(e) => setFilters({ ...filters, isPublished: e.target.value, page: 1 })}
              className="input py-2 text-sm"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="true">Đã xuất bản</option>
              <option value="false">Đã ẩn</option>
            </select>
          </div>

          {/* Verified Filter */}
          <select
            value={filters.isVerified}
            onChange={(e) => setFilters({ ...filters, isVerified: e.target.value, page: 1 })}
            className="input py-2 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="true">Đã mua hàng</option>
            <option value="false">Chưa mua</option>
          </select>

          {/* Rating Filter */}
          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value, page: 1 })}
            className="input py-2 text-sm"
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <LoadingSpinner />
            <table className="w-full mt-4">
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRowSkeleton key={i} columns={6} />
                ))}
              </tbody>
            </table>
          </div>
        ) : error ? (
          <EmptyState
            icon={FiAlertCircle}
            title="Đã xảy ra lỗi"
            description="Không thể tải danh sách đánh giá"
          />
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={FiStar}
            title="Chưa có đánh giá nào"
            description="Danh sách đánh giá trống"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reviews.map((review) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50"
                    >
                      {/* Product */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {review.product?.primaryImage && (
                            <img
                              src={review.product.primaryImage}
                              alt={review.product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {review.product?.name || 'Sản phẩm đã xóa'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                            {review.user?.avatar ? (
                              <img
                                src={review.user.avatar}
                                alt={review.user.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-primary-600 font-semibold text-sm">
                                {review.user?.name?.charAt(0) || 'U'}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.user?.name || 'Người dùng'}</p>
                            {review.isVerified && (
                              <span className="text-xs text-green-600 flex items-center gap-1">
                                <FiCheck className="w-3 h-3" /> Đã mua hàng
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Rating & Comment */}
                      <td className="px-4 py-4 max-w-xs">
                        <div className="mb-1">{renderStars(review.rating)}</div>
                        {review.title && (
                          <p className="font-medium text-gray-900 text-sm">{review.title}</p>
                        )}
                        <p className="text-sm text-gray-500 line-clamp-2">{review.comment}</p>
                        {review.adminReply && (
                          <div className="mt-2 bg-blue-50 rounded-lg p-2 text-sm">
                            <p className="text-blue-800">
                              <span className="font-medium">Phản hồi:</span> {review.adminReply}
                            </p>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            review.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {review.isPublished ? 'Đã xuất bản' : 'Đã ẩn'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Publish */}
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                reviewId: review.id,
                                isPublished: !review.isPublished,
                              })
                            }
                            disabled={updateStatusMutation.isPending}
                            className={`p-2 rounded-lg transition-colors ${
                              review.isPublished
                                ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                            }`}
                            title={review.isPublished ? 'Ẩn đánh giá' : 'Xuất bản đánh giá'}
                          >
                            {review.isPublished ? (
                              <FiX className="w-4 h-4" />
                            ) : (
                              <FiCheck className="w-4 h-4" />
                            )}
                          </button>

                          {/* Reply */}
                          <button
                            onClick={() => handleReply(review)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Phản hồi"
                          >
                            <FiMessageCircle className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteDialog({ open: true, review })}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa vĩnh viễn"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Hiển thị {(pagination.page - 1) * pagination.limit + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} trong{' '}
                  {pagination.total} đánh giá
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setFilters({ ...filters, page: i + 1 })}
                      className={`px-3 py-1.5 text-sm rounded-lg ${
                        pagination.page === i + 1
                          ? 'bg-primary-600 text-white'
                          : 'border hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setFilters({ ...filters, page: pagination.page + 1 })}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reply Modal */}
      {replyModal.open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setReplyModal({ open: false, review: null })}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-2xl w-full max-w-lg"
          >
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">Phản hồi đánh giá</h2>
              <button
                onClick={() => setReplyModal({ open: false, review: null })}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            {replyModal.review && (
              <div className="p-6 space-y-4">
                {/* Original Review */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(replyModal.review.rating)}
                    <span className="text-sm text-gray-500">
                      bởi {replyModal.review.user?.name || 'Người dùng'}
                    </span>
                  </div>
                  <p className="text-gray-700">{replyModal.review.comment}</p>
                </div>

                {/* Reply Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nội dung phản hồi
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Nhập nội dung phản hồi..."
                    rows={4}
                    maxLength={500}
                    className="input resize-none"
                  />
                  <p className="text-sm text-gray-400 text-right mt-1">
                    {replyText.length}/500
                  </p>
                </div>
              </div>
            )}

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setReplyModal({ open: false, review: null })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Hủy
              </button>
              <button
                onClick={submitReply}
                disabled={replyMutation.isPending || !replyText.trim()}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                {replyMutation.isPending ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <FiCheck className="w-4 h-4" />
                )}
                Gửi phản hồi
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Xóa đánh giá"
        message={`Bạn có chắc muốn xóa đánh giá của "${deleteDialog.review?.user?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={submitDelete}
        onCancel={() => setDeleteDialog({ open: false, review: null })}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default ReviewList;
