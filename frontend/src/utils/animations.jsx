import { motion } from 'framer-motion';

// Animation Variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const fadeInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const fadeInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

export const slideInFromRight = {
  hidden: { x: '100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export const slideInFromLeft = {
  hidden: { x: '-100%', opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

// Stagger Container
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Button Animations
export const buttonHover = {
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

export const buttonTap = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

// Card Animations
export const cardHover = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  hover: { 
    y: -5, 
    transition: { duration: 0.2 } 
  },
};

export const cardScaleHover = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { 
    scale: 1.03, 
    transition: { duration: 0.2 } 
  },
};

// Page Transitions
export const pageVariants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.2 } },
};

export const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3,
};

// Modal/Dialog Animations
export const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9, 
    y: 20,
    transition: { duration: 0.2 } 
  },
};

export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// List Item Animation
export const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

// Toast Animation
export const toastVariants = {
  initial: { opacity: 0, x: 100, scale: 0.9 },
  animate: { opacity: 1, x: 0, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: 100, scale: 0.9, transition: { duration: 0.2 } },
};

// Skeleton Pulse
export const skeletonPulse = {
  animate: {
    opacity: [0.4, 0.8, 0.4],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
};

// Bounce Animation
export const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 15 }
  },
};

// Rotate Animation
export const rotateIn = {
  hidden: { opacity: 0, rotate: -180 },
  visible: { 
    opacity: 1, 
    rotate: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 }
  },
};

// Preset Animation Components
export const MotionDiv = ({ children, variant = fadeInUp, className = '', ...props }) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={variant}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const MotionUl = ({ children, variant = staggerContainer, className = '', ...props }) => (
  <motion.ul
    initial="hidden"
    animate="visible"
    variants={variant}
    className={className}
    {...props}
  >
    {children}
  </motion.ul>
);

export const MotionLi = ({ children, variant = fadeInUp, custom = 0, className = '', ...props }) => (
  <motion.li
    custom={custom}
    variants={variant}
    className={className}
    {...props}
  >
    {children}
  </motion.li>
);

// Animation Presets for Different Sections
export const productGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

export const productCardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' } 
  },
  hover: {
    y: -8,
    transition: { duration: 0.2 }
  },
};

export const blogGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const blogCardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3 } 
  },
};

export const statsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
    },
  }),
};

// Export all animations
export const animations = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromRight,
  slideInFromLeft,
  staggerContainer,
  staggerContainerFast,
  buttonHover,
  buttonTap,
  cardHover,
  cardScaleHover,
  pageVariants,
  modalVariants,
  backdropVariants,
  listItemVariants,
  toastVariants,
  bounceIn,
  rotateIn,
};

export default animations;
