const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');

/**
 * Auth middleware - Required authentication
 */
const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục');
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw ApiError.unauthorized('Tài khoản không tồn tại');
      }
      
      if (!user.isActive) {
        throw ApiError.unauthorized('Tài khoản đã bị vô hiệu hóa');
      }
      
      req.user = user;
      req.token = token;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw ApiError.unauthorized('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
      }
      if (jwtError.name === 'JsonWebTokenError') {
        throw ApiError.unauthorized('Token không hợp lệ');
      }
      throw jwtError;
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - continues as guest if no token
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      try {
        const decoded = jwt.verify(token, config.jwtSecret);
        const user = await User.findById(decoded.id);
        
        if (user && user.isActive) {
          req.user = user;
          req.token = token;
        }
      } catch (jwtError) {
        // Ignore JWT errors, continue as guest
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Generate JWT tokens
 */
const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { id: user._id },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  
  const refreshToken = jwt.sign(
    { id: user._id },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
  
  // Save refresh token to user
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();
  
  return { accessToken, refreshToken };
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (token) => {
  try {
    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);
    
    if (!user || user.refreshToken !== token) {
      return null;
    }
    
    return user;
  } catch (error) {
    return null;
  }
};

module.exports = {
  auth,
  optionalAuth,
  generateTokens,
  verifyRefreshToken,
};
