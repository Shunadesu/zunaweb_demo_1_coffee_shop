import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar } from 'react-icons/fi';
import WishlistButton from './WishlistButton';
import { cardHover, productCardVariants } from '../../utils/animations';

const ProductCard = ({ 
  product, 
  index = 0,
  showWishlist = true,
  onClick,
  className = '',
}) => {
  const {
    _id,
    name,
    slug,
    primaryImage,
    images,
    basePrice,
    price,
    rating,
    reviewCount,
    isFeatured,
    isBestSeller,
    category,
    soldCount,
  } = product;

  const productPrice = basePrice || price || 0;
  const productRating = rating || 0;
  const productImage = primaryImage || images?.[0]?.url || 'https://via.placeholder.com/300x200';

  return (
    <motion.div
      variants={productCardVariants}
      whileHover="hover"
      className={`card group relative overflow-hidden ${className}`}
    >
      <Link to={`/menu/${slug || _id}`} onClick={onClick}>
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <motion.img
            variants={cardHover}
            src={productImage}
            alt={name}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isFeatured && (
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="badge-primary"
              >
                Nổi bật
              </motion.span>
            )}
            {isBestSeller && (
              <motion.span 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="badge-warning"
              >
                Bán chạy
              </motion.span>
            )}
          </div>

          {/* Wishlist Button */}
          {showWishlist && (
            <div className="absolute top-2 right-2">
              <WishlistButton
                productId={_id}
                product={product}
                size="sm"
                variant="full"
              />
            </div>
          )}

          {/* Sold Count */}
          {soldCount > 0 && (
            <div className="absolute bottom-2 left-2">
              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                Đã bán {soldCount}+
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
            {category?.name || 'Cà phê'}
          </p>

          {/* Name */}
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {name}
          </h3>

          {/* Rating */}
          {productRating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(productRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                ({reviewCount || 0})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary-600">
              {productPrice.toLocaleString()}đ
            </span>

            {/* Quick Add Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700"
              onClick={(e) => {
                e.preventDefault();
                // Handle add to cart
              }}
            >
              Thêm vào giỏ
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = ({ className = '' }) => (
  <div className={`card overflow-hidden ${className}`}>
    <div className="h-48 bg-gray-200 animate-pulse" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
      <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  </div>
);

// Product Card Grid with Animation
export const ProductCardGrid = ({ 
  products, 
  loading = false,
  columns = 4,
  className = '',
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6 ${className}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          index={index}
        />
      ))}
    </div>
  );
};

export default ProductCard;
