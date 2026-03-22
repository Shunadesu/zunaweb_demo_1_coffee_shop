import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp } from 'react-icons/fi';

const BackToTop = ({
  threshold = 300,
  smooth = true,
  duration = 500,
  className = '',
  showOnMobile = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > threshold);
      setIsAtTop(scrolled < 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    if (smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, 0);
    }
  };

  // Hide on mobile if configured
  if (!showOnMobile && typeof window !== 'undefined' && window.innerWidth < 768) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={`
            fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40
            w-12 h-12 md:w-14 md:h-14
            rounded-full bg-primary-600 text-white shadow-lg
            flex items-center justify-center
            hover:bg-primary-700
            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
            transition-colors duration-200
            ${className}
          `}
          aria-label="Cuộn lên đầu trang"
        >
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: isAtTop ? 0 : [-2, 2, -2] }}
            transition={{
              duration: 1.5,
              repeat: isAtTop ? 0 : Infinity,
              ease: 'easeInOut',
            }}
          >
            <FiArrowUp className="w-5 h-5 md:w-6 md:h-6" />
          </motion.div>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

// Progress indicator variant
export const BackToTopWithProgress = ({ 
  threshold = 300, 
  showProgress = true,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      setIsVisible(scrolled > threshold);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min((scrolled / docHeight) * 100, 100);
      setProgress(scrollProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={scrollToTop}
      className={`
        fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40
        w-14 h-14
        rounded-full bg-white shadow-lg border border-gray-200
        flex items-center justify-center overflow-hidden
        hover:bg-gray-50
        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2
        ${className}
      `}
      aria-label="Cuộn lên đầu trang"
    >
      {showProgress && (
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="#8B4513"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
            className="transition-all duration-150"
          />
        </svg>
      )}
      <FiArrowUp className="w-5 h-5 text-primary-600 relative z-10" />
    </motion.button>
  );
};

export default BackToTop;
