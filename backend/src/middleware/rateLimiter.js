const rateLimit = require('express-rate-limit');

// ==================== RATE LIMITERS ====================

// Memory store (always available)
const createMemoryStore = () => {
  return new rateLimit.MemoryStore();
};

// ==================== RATE LIMITERS ====================

// 1. General API Limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 2. Strict Limiter for Auth Endpoints - 5 attempts per hour
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Đã vượt quá số lần đăng nhập. Vui lòng thử lại sau 1 giờ.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  store: createMemoryStore(),
});

// 3. Registration Limiter - 3 attempts per hour
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Đã vượt quá số lần đăng ký. Vui lòng thử lại sau 1 giờ.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 4. Password Reset Limiter - 3 attempts per hour
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Đã vượt quá số lần đặt lại mật khẩu. Vui lòng thử lại sau 1 giờ.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 5. Upload Limiter - 20 uploads per minute
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: {
    success: false,
    message: 'Quá nhiều upload. Vui lòng thử lại sau.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 6. Search Limiter - 30 searches per minute
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: 'Quá nhiều tìm kiếm. Vui lòng thử lại sau.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 7. Order Creation Limiter - 10 orders per minute
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Quá nhiều đơn hàng. Vui lòng thử lại sau.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 8. Contact/Feedback Limiter - 5 per hour
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: {
    success: false,
    message: 'Đã gửi quá nhiều. Vui lòng thử lại sau.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// 9. API Key Limiter (for public APIs) - 1000 requests per day
const publicApiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 1000,
  message: {
    success: false,
    message: 'Đã vượt quá giới hạn API. Vui lòng nâng cấp gói.',
    retryAfter: 24 * 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || req.ip;
  },
  store: createMemoryStore(),
});

// 10. Admin Limiter - More lenient for admin actions
const adminLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu admin. Vui lòng thử lại sau.',
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: createMemoryStore(),
});

// ==================== CUSTOM LIMITERS ====================

// Create a custom limiter with specific options
const createLimiter = (options) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: createMemoryStore(),
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// ==================== HELPER FUNCTIONS ====================

// Skip rate limiting for certain conditions
const skipRateLimit = (req) => {
  // Skip for health checks
  if (req.path === '/health') return true;
  
  // Skip for whitelisted IPs
  const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
  if (whitelist.includes(req.ip)) return true;
  
  return false;
};

// Conditional limiter
const conditionalLimiter = (limiter, skipCondition) => {
  return (req, res, next) => {
    if (skipCondition(req)) {
      return next();
    }
    return limiter(req, res, next);
  };
};

module.exports = {
  apiLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  uploadLimiter,
  searchLimiter,
  orderLimiter,
  contactLimiter,
  publicApiLimiter,
  adminLimiter,
  createLimiter,
  skipRateLimit,
  conditionalLimiter,
};
