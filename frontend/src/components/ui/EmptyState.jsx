import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiPackage, FiHeart, FiSearch, FiFileText, FiClipboard } from 'react-icons/fi';

const EmptyState = ({
  icon = 'shopping',
  title = 'Không có dữ liệu',
  description = 'Chưa có nội dung nào ở đây.',
  action = null,
  actionLabel = 'Khám phá ngay',
  actionLink = '/',
  className = '',
}) => {
  const icons = {
    shopping: FiShoppingBag,
    package: FiPackage,
    heart: FiHeart,
    search: FiSearch,
    file: FiFileText,
    clipboard: FiClipboard,
  };

  const Icon = icons[icon] || FiPackage;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 15,
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <motion.div
        variants={iconVariants}
        className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6"
      >
        <Icon className="w-12 h-12 text-gray-400" />
      </motion.div>

      <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center">
        {title}
      </h3>

      <p className="text-gray-500 text-center max-w-md mb-6">
        {description}
      </p>

      {action && (
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={actionLink}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            {action}
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
};

// Preset Empty States
export const EmptyCart = ({ className = '' }) => (
  <EmptyState
    icon="shopping"
    title="Giỏ hàng trống"
    description="Khám phá menu của chúng tôi và thêm những món bạn yêu thích vào giỏ hàng nhé!"
    action="Xem menu"
    actionLink="/menu"
    className={className}
  />
);

export const EmptyOrders = ({ className = '' }) => (
  <EmptyState
    icon="clipboard"
    title="Chưa có đơn hàng nào"
    description="Bạn chưa có đơn hàng nào. Hãy bắt đầu đặt hàng để trải nghiệm dịch vụ của chúng tôi!"
    action="Đặt hàng ngay"
    actionLink="/menu"
    className={className}
  />
);

export const EmptyWishlist = ({ className = '' }) => (
  <EmptyState
    icon="heart"
    title="Danh sách yêu thích trống"
    description="Lưu lại những món bạn thích để đặt hàng nhanh hơn vào lần sau!"
    action="Khám phá menu"
    actionLink="/menu"
    className={className}
  />
);

export const EmptySearch = ({ query = '', className = '' }) => (
  <EmptyState
    icon="search"
    title="Không tìm thấy kết quả"
    description={query ? `Không có sản phẩm nào phù hợp với "${query}"` : 'Thử tìm kiếm với từ khóa khác'}
    action="Xem tất cả sản phẩm"
    actionLink="/menu"
    className={className}
  />
);

export const EmptyProducts = ({ className = '' }) => (
  <EmptyState
    icon="package"
    title="Chưa có sản phẩm nào"
    description="Danh mục này hiện đang trống. Hãy quay lại sau nhé!"
    action="Xem danh mục khác"
    actionLink="/menu"
    className={className}
  />
);

export const EmptyBlog = ({ className = '' }) => (
  <EmptyState
    icon="file"
    title="Chưa có bài viết nào"
    description="Chúng tôi đang cập nhật nội dung mới. Hãy quay lại sau nhé!"
    action="Quay về trang chủ"
    actionLink="/"
    className={className}
  />
);

export const EmptyReviews = ({ className = '' }) => (
  <EmptyState
    icon="file"
    title="Chưa có đánh giá nào"
    description="Hãy là người đầu tiên đánh giá sản phẩm này!"
    className={className}
  />
);

export const EmptyNotifications = ({ className = '' }) => (
  <EmptyState
    icon="file"
    title="Không có thông báo nào"
    description="Bạn sẽ nhận được thông báo khi có cập nhật mới từ đơn hàng và khuyến mãi."
    className={className}
  />
);

export default EmptyState;
