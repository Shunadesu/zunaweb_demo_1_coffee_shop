import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const Toast = ({ id, type = 'info', message, title }) => {
  const icons = {
    success: FiCheck,
    error: FiX,
    warning: FiAlertCircle,
    info: FiInfo,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const Icon = icons[type] || FiInfo;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      className={`${colors[type]} text-white rounded-lg shadow-lg p-4 min-w-[300px] max-w-md`}
    >
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          {title && <p className="font-semibold text-sm">{title}</p>}
          <p className="text-sm opacity-90">{message}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Toast;
