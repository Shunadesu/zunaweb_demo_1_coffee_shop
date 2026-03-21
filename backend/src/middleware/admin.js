const ApiError = require('../utils/ApiError');

/**
 * Admin role check middleware
 */
const admin = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  
  if (req.user.role !== 'admin') {
    throw ApiError.forbidden('Bạn không có quyền truy cập trang này');
  }
  
  next();
};

/**
 * Customer role check middleware
 */
const customer = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  
  if (req.user.role !== 'customer' && req.user.role !== 'admin') {
    throw ApiError.forbidden('Bạn không có quyền thực hiện hành động này');
  }
  
  next();
};

/**
 * Check if user is member (not guest)
 */
const member = (req, res, next) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  
  if (req.user.role === 'admin') {
    return next(); // Admin can do anything
  }
  
  // User must have memberCode to be considered a member
  if (!req.user.memberCode) {
    throw ApiError.forbidden('Bạn cần đăng ký thành viên để thực hiện hành động này');
  }
  
  next();
};

/**
 * Role-based access control
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden('Bạn không có quyền thực hiện hành động này');
    }
    
    next();
  };
};

module.exports = {
  admin,
  customer,
  member,
  authorize,
};
