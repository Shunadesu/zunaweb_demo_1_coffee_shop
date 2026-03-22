import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiTrash2, FiShoppingBag, FiChevronRight } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/api/user/wishlistApi';
import { useCartStore } from '@/stores/cartStore';
import { useUIStore } from '@/stores/uiStore';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import WishlistButton from '@/components/product/WishlistButton';

const Wishlist = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { addItem } = useCartStore();
  const { addToast } = useUIStore();
  
  const [deleteDialog, setDeleteDialog] = useState({ open: false, productId: null });
  const [clearDialog, setClearDialog] = useState(false);

  // Fetch wishlist
  const { data, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.getWishlist(),
  });

  const wishlist = data?.data?.wishlist || [];
  const totalItems = data?.data?.totalItems || 0;

  // Remove from wishlist mutation
  const removeMutation = useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      addToast({ type: 'success', message: 'Đã xóa khỏi danh sách yêu thích' });
      setDeleteDialog({ open: false, productId: null });
    },
    onError: () => {
      addToast({ type: 'error', message: 'Đã xảy ra lỗi' });
    },
  });

  // Clear wishlist mutation
  const clearMutation = useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      addToast({ type: 'success', message: 'Đã xóa toàn bộ danh sách yêu thích' });
      setClearDialog(false);
    },
  });

  // Add to cart
  const handleAddToCart = (product) => {
    addItem(product, '', [], 1, '');
    addToast({ type: 'success', message: 'Đã thêm vào giỏ hàng' });
    navigate('/cart');
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteDialog.productId) {
      removeMutation.mutate(deleteDialog.productId);
    }
  };

  // Handle clear all
  const handleClearAll = () => {
    clearMutation.mutate();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiHeart className="w-7 h-7 text-red-500" />
              Danh sách yêu thích
            </h1>
            <p className="text-gray-500 mt-1">
              {totalItems} sản phẩm
            </p>
          </div>
          
          {wishlist.length > 0 && (
            <button
              onClick={() => setClearDialog(true)}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Empty State */}
        {wishlist.length === 0 && !isLoading && (
          <EmptyState
            icon={FiHeart}
            title="Chưa có sản phẩm yêu thích"
            description="Hãy thêm những sản phẩm bạn thích vào danh sách yêu thích để dễ dàng tìm lại sau nhé!"
            action={{
              label: 'Khám phá Menu',
              href: '/menu',
            }}
          />
        )}

        {/* Wishlist Grid */}
        {wishlist.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {wishlist.map((item, index) => (
                <motion.div
                  key={item.product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow group"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Link to={`/product/${item.product.slug}`}>
                      <img
                        src={item.product.primaryImage || 'https://via.placeholder.com/400'}
                        alt={item.product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3">
                      <WishlistButton
                        productId={item.product._id}
                        size="md"
                        variant="full"
                      />
                    </div>

                    {/* Badges */}
                    {item.product.isFeatured && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-primary-600 text-white text-xs font-medium rounded-full">
                        Nổi bật
                      </span>
                    )}
                    {item.product.isBestSeller && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                        Bán chạy
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <Link 
                      to={`/product/${item.product.slug}`}
                      className="block"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {item.product.category?.name}
                      </p>
                    </Link>

                    {/* Price & Rating */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-primary-600">
                        {formatPrice(item.product.basePrice)}
                      </span>
                      {item.product.rating > 0 && (
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-400">★</span>
                          <span className="text-gray-600">{item.product.rating.toFixed(1)}</span>
                          <span className="text-gray-400">({item.product.reviewCount})</span>
                        </div>
                      )}
                    </div>

                    {/* Note */}
                    {item.note && (
                      <p className="text-sm text-gray-500 italic mb-3 line-clamp-2">
                        "{item.note}"
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="flex-1 btn btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                      >
                        <FiShoppingBag className="w-4 h-4" />
                        Thêm vào giỏ
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ open: true, productId: item.product._id })}
                        className="px-3 py-2.5 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Continue Shopping */}
        {wishlist.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link
              to="/menu"
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <span>Tiếp tục mua sắm</span>
              <FiChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        title="Xóa sản phẩm"
        message="Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog({ open: false, productId: null })}
        isLoading={removeMutation.isPending}
      />

      {/* Clear All Confirmation Dialog */}
      <ConfirmDialog
        open={clearDialog}
        title="Xóa tất cả"
        message="Bạn có chắc muốn xóa toàn bộ danh sách yêu thích? Hành động này không thể hoàn tác."
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        variant="danger"
        onConfirm={handleClearAll}
        onCancel={() => setClearDialog(false)}
        isLoading={clearMutation.isPending}
      />
    </div>
  );
};

export default Wishlist;
