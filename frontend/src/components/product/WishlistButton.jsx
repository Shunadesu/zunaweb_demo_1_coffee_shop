import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '../../api/user/wishlistApi';
import { useAuthStore } from '../../stores/authStore';

const WishlistButton = ({
  productId,
  product,
  size = 'md',
  showText = false,
  className = '',
  variant = 'default', // 'default', 'full', 'outline'
}) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if product is in wishlist
  const { data: wishlistCheck } = useQuery({
    queryKey: ['wishlist', 'check', productId],
    queryFn: () => wishlistApi.checkWishlist(productId),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const isInWishlist = wishlistCheck?.data?.isInWishlist || false;

  // Toggle wishlist mutation
  const toggleMutation = useMutation({
    mutationFn: () => isInWishlist
      ? wishlistApi.removeFromWishlist(productId)
      : wishlistApi.addToWishlist(productId),
    onMutate: () => {
      setIsAnimating(true);
    },
    onSuccess: (data) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        ['wishlist', 'check', productId],
        { data: { isInWishlist: !isInWishlist } }
      );
      
      // Invalidate wishlist queries to refresh
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onSettled: () => {
      setTimeout(() => setIsAnimating(false), 500);
    },
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirect to login or show auth modal
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return;
    }
    
    toggleMutation.mutate();
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'full') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        className={`
          flex items-center justify-center gap-2
          ${sizeClasses[size]}
          rounded-full
          transition-all duration-200
          ${isInWishlist
            ? 'bg-red-50 text-red-500 hover:bg-red-100'
            : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }
          ${toggleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        aria-label={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <FiHeart
            className={`
              ${iconSizes[size]}
              ${isInWishlist ? 'fill-current' : ''}
            `}
          />
        </motion.div>
        {showText && (
          <span className="text-sm font-medium">
            {isInWishlist ? 'Yêu thích' : 'Yêu thích'}
          </span>
        )}
      </motion.button>
    );
  }

  if (variant === 'outline') {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={toggleMutation.isPending}
        className={`
          flex items-center justify-center
          ${sizeClasses[size]}
          rounded-full border-2
          transition-all duration-200
          ${isInWishlist
            ? 'border-red-500 text-red-500 bg-red-50'
            : 'border-gray-300 text-gray-400 hover:border-red-400 hover:text-red-400'
          }
          ${toggleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        aria-label={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
        <motion.div
          animate={isAnimating ? {
            scale: [1, 1.4, 1],
            rotate: [0, -15, 15, 0]
          } : {}}
          transition={{ duration: 0.4 }}
        >
          <FiHeart
            className={`
              ${iconSizes[size]}
              ${isInWishlist ? 'fill-current' : ''}
            `}
          />
        </motion.div>
      </motion.button>
    );
  }

  // Default variant - simple icon button
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleClick}
      disabled={toggleMutation.isPending}
      className={`
        flex items-center justify-center
        ${sizeClasses[size]}
        rounded-full
        transition-all duration-200
        ${isInWishlist
          ? 'text-red-500'
          : 'text-gray-400 hover:text-red-400'
        }
        ${toggleMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isInWishlist ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <motion.div
        animate={isAnimating ? {
          scale: [1, 1.5, 1],
        } : {}}
        transition={{ duration: 0.3 }}
      >
        <FiHeart
          className={`
            ${iconSizes[size]}
            ${isInWishlist ? 'fill-current' : ''}
          `}
        />
      </motion.div>
    </motion.button>
  );
};

// Wishlist Counter Badge
export const WishlistBadge = ({ count, className = '' }) => {
  if (!count || count === 0) return null;

  return (
    <AnimatePresence>
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className={`
          absolute -top-1 -right-1
          min-w-[18px] h-[18px]
          flex items-center justify-center
          bg-red-500 text-white
          text-xs font-bold
          rounded-full
          px-1
          ${className}
        `}
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    </AnimatePresence>
  );
};

// Floating Wishlist Button (for product cards)
export const FloatingWishlistButton = ({ productId, product }) => {
  return (
    <div className="absolute top-3 right-3 z-10">
      <WishlistButton
        productId={productId}
        product={product}
        size="md"
        variant="full"
      />
    </div>
  );
};

export default WishlistButton;
