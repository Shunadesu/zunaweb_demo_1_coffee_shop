import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiCheck, FiX } from 'react-icons/fi';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Xác nhận',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  variant = 'danger', // 'danger', 'warning', 'success', 'info'
  icon: CustomIcon = null,
  loading = false,
  size = 'md', // 'sm', 'md', 'lg'
  closeOnOverlay = true,
  closeOnEscape = true,
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlay) {
      onClose();
    }
  };

  const variants = {
    danger: {
      icon: FiAlertTriangle,
      iconColor: 'text-red-500',
      iconBg: 'bg-red-100',
      buttonClass: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    },
    warning: {
      icon: FiAlertTriangle,
      iconColor: 'text-yellow-500',
      iconBg: 'bg-yellow-100',
      buttonClass: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    },
    success: {
      icon: FiCheck,
      iconColor: 'text-green-500',
      iconBg: 'bg-green-100',
      buttonClass: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
    },
    info: {
      icon: FiAlertTriangle,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-100',
      buttonClass: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  const { icon: Icon, iconColor, iconBg, buttonClass } = variants[variant];

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden="true"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center p-4`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <div
              className={`
                ${sizeClasses[size]}
                w-full bg-white rounded-xl shadow-2xl overflow-hidden
              `}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 id="dialog-title" className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Đóng"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-5">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                  </div>

                  {/* Message */}
                  <div className="flex-1">
                    <p className="text-gray-600">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className={`
                    px-4 py-2 rounded-lg font-medium
                    text-gray-700 bg-white border border-gray-300
                    hover:bg-gray-50
                    focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                  `}
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`
                    px-4 py-2 rounded-lg font-medium text-white
                    ${buttonClass}
                    focus:outline-none focus:ring-2 focus:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors
                    flex items-center gap-2
                  `}
                >
                  {loading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  )}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Preset Confirm Dialogs
export const DeleteConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName = 'mục này',
  loading = false,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Xác nhận xóa"
    message={`Bạn có chắc chắn muốn xóa "${itemName}"? Hành động này không thể hoàn tác.`}
    confirmText="Xóa"
    cancelText="Hủy"
    variant="danger"
    loading={loading}
  />
);

export const LogoutConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  loading = false,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Đăng xuất"
    message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
    confirmText="Đăng xuất"
    cancelText="Hủy"
    variant="info"
    loading={loading}
  />
);

export const CancelOrderDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  orderNumber = '',
  loading = false,
}) => (
  <ConfirmDialog
    isOpen={isOpen}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Hủy đơn hàng"
    message={`Bạn có chắc chắn muốn hủy đơn hàng #${orderNumber}? Nếu đã thanh toán, tiền sẽ được hoàn trả.`}
    confirmText="Hủy đơn"
    cancelText="Không hủy"
    variant="warning"
    loading={loading}
  />
);

export default ConfirmDialog;
