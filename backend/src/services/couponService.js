const Coupon = require('../models/Coupon');
const User = require('../models/User');

/**
 * Validate and apply coupon
 */
const validateAndApply = async (code, subtotal, userId, cartItems = []) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  
  if (!coupon) return null;
  
  // Check validity
  const now = new Date();
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return null;
  }
  
  if (!coupon.isActive) return null;
  
  // Check total limit
  if (coupon.totalLimit && coupon.usedCount >= coupon.totalLimit) {
    return null;
  }
  
  // Check per-user limit
  const userUsage = coupon.userUsage?.find(
    u => u.userId.toString() === userId.toString()
  );
  if (userUsage && userUsage.count >= coupon.perUserLimit) {
    return null;
  }
  
  // Check min order value
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return null;
  }
  
  // Check rank requirement
  if (coupon.memberRanks?.length > 0) {
    const user = await User.findById(userId);
    if (!coupon.memberRanks.includes(user.memberRank)) {
      return null;
    }
  }
  
  return coupon;
};

/**
 * Calculate discount amount
 */
const calculateDiscount = (coupon, subtotal) => {
  switch (coupon.type) {
    case 'PERCENT':
      let discount = subtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
      return Math.round(discount);
      
    case 'FIXED':
      return Math.min(coupon.discountValue, subtotal);
      
    case 'FREE_SHIP':
      return 15000; // Default shipping fee
      
    default:
      return 0;
  }
};

/**
 * Use coupon
 */
const useCoupon = async (couponId, userId) => {
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return;
  
  coupon.usedCount += 1;
  
  // Update user usage
  if (!coupon.userUsage) coupon.userUsage = [];
  
  const userUsage = coupon.userUsage.find(
    u => u.userId.toString() === userId.toString()
  );
  
  if (userUsage) {
    userUsage.count += 1;
    userUsage.lastUsed = new Date();
  } else {
    coupon.userUsage.push({
      userId,
      count: 1,
      lastUsed: new Date(),
    });
  }
  
  await coupon.save();
};

module.exports = {
  validateAndApply,
  calculateDiscount,
  useCoupon,
};
