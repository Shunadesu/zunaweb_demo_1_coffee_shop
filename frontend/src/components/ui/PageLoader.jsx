import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

const PageLoader = ({
  message = 'Đang tải...',
  logo = null,
  showProgress = false,
  progress = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Logo animation */}
        {logo ? (
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <LoadingSpinner size="lg" />
          </motion.div>
        )}

        {/* Brand text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-2xl font-bold text-primary-600 mb-2">
            Coffee Shop
          </h1>
          <p className="text-gray-500">{message}</p>
        </motion.div>

        {/* Progress bar (optional) */}
        {showProgress && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="w-48 h-1 bg-primary-600 rounded-full"
          />
        )}
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.03, 0.05, 0.03],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-[radial-gradient(circle,var(--primary-color)_1px,transparent_1px)] bg-[length:30px_30px]"
          style={{ '--primary-color': '#8B4513' }}
        />
      </div>
    </motion.div>
  );
};

// Inline Page Loader (for buttons, cards)
export const InlineLoader = ({ className = '' }) => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    }}
    className={`w-5 h-5 border-2 border-gray-300 border-t-primary-600 rounded-full ${className}`}
  />
);

// Section Loader
export const SectionLoader = ({ height = '200px', className = '' }) => (
  <div
    className={`flex items-center justify-center bg-gray-50 ${className}`}
    style={{ minHeight: height }}
  >
    <LoadingSpinner size="md" />
  </div>
);

export default PageLoader;
