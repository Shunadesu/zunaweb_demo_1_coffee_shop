import { motion } from 'framer-motion';

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  label = 'Đang tải...',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    primary: 'border-primary-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`
          ${sizeClasses[size]}
          border-4 border-gray-200 rounded-full
          ${colorClasses[color]}
          border-t-transparent
        `}
      />
      {label && (
        <span className="text-sm text-gray-500">{label}</span>
      )}
    </div>
  );
};

// Dot Loading (three bouncing dots)
export const DotSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <div className={`flex items-center justify-center gap-1 ${className}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
          className={`
            ${dotSizes[size]}
            ${colorClasses[color]}
            rounded-full
          `}
        />
      ))}
    </div>
  );
};

// Pulse Loading
export const PulseSpinner = ({ size = 'md', color = 'primary', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colorClasses = {
    primary: 'bg-primary-600',
    white: 'bg-white',
    gray: 'bg-gray-600',
  };

  return (
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [1, 0.5, 1],
      }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full
        ${className}
      `}
    />
  );
};

// Skeleton Line
export const SkeletonLine = ({ width = '100%', height = 16, className = '' }) => (
  <motion.div
    animate={{
      opacity: [0.4, 0.8, 0.4],
    }}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
    className={`bg-gray-200 rounded ${className}`}
    style={{ width, height }}
  />
);

export default LoadingSpinner;
