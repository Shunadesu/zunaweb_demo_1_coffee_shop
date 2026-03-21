/**
 * Helper functions
 */

/**
 * Format currency to VND
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date to Vietnamese
 */
const formatDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };
  return new Date(date).toLocaleDateString('vi-VN', defaultOptions);
};

/**
 * Format date time
 */
const formatDateTime = (date) => {
  return new Date(date).toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Paginate helper
 */
const paginate = (query, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit),
  };
};

/**
 * Build pagination response
 */
const buildPaginationResponse = (data, total, page, limit) => {
  return {
    data,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
};

/**
 * Pick fields from object
 */
const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

/**
 * Omit fields from object
 */
const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach((key) => delete result[key]);
  return result;
};

/**
 * Convert string to boolean
 */
const toBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return Boolean(value);
};

/**
 * Calculate distance between two dates in days
 */
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Get date range for period
 */
const getDateRange = (period) => {
  const now = new Date();
  let startDate, endDate = now;
  
  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'yesterday':
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
    default:
      startDate = new Date(0);
  }
  
  return { startDate, endDate };
};

/**
 * Validate phone number (Vietnam)
 */
const isValidPhone = (phone) => {
  const phoneRegex = /(84|0)[3|5|7|8|9][0-9]{8}/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sleep utility
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
  formatCurrency,
  formatDate,
  formatDateTime,
  paginate,
  buildPaginationResponse,
  pick,
  omit,
  toBoolean,
  daysBetween,
  getDateRange,
  isValidPhone,
  isValidEmail,
  sleep,
};
