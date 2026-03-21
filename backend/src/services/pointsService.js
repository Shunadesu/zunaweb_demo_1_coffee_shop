const User = require('../models/User');
const PointHistory = require('../models/PointHistory');

// Rank multipliers for points
const RANK_MULTIPLIERS = {
  BRONZE: 1.0,
  SILVER: 2.0,
  GOLD: 2.5,
  PLATINUM: 3.0,
};

/**
 * Calculate points for an order
 */
const calculatePointsForOrder = async (totalSpent, memberRank) => {
  const baseRate = 0.01; // 1% base rate
  const multiplier = RANK_MULTIPLIERS[memberRank] || 1.0;
  
  return Math.floor(totalSpent * baseRate * multiplier);
};

/**
 * Earn points from order
 */
const earnPoints = async (userId, orderId, totalSpent, memberRank) => {
  const points = await calculatePointsForOrder(totalSpent, memberRank);
  
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const balanceBefore = user.pointBalance;
  
  // Update user
  user.pointBalance += points;
  user.points += points;
  user.totalSpent += totalSpent;
  
  // Check for rank upgrade
  const newRank = calculateRank(user.totalSpent);
  if (newRank !== user.memberRank) {
    user.memberRank = newRank;
    user.rankUpgradedAt = new Date();
  }
  
  await user.save();
  
  // Create history
  await PointHistory.create({
    userId,
    type: 'EARN',
    points,
    balanceBefore,
    balanceAfter: user.pointBalance,
    orderId,
    description: `Tích điểm từ đơn hàng`,
    rankAtThatTime: memberRank,
    multiplier: RANK_MULTIPLIERS[memberRank],
  });
  
  return { points, newRank: user.memberRank };
};

/**
 * Redeem points
 */
const redeemPoints = async (userId, points, orderId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  if (user.pointBalance < points) {
    throw new Error('Insufficient points');
  }
  
  const balanceBefore = user.pointBalance;
  user.pointBalance -= points;
  await user.save();
  
  await PointHistory.create({
    userId,
    type: 'REDEEM',
    points: -points,
    balanceBefore,
    balanceAfter: user.pointBalance,
    orderId,
    description: 'Sử dụng điểm để giảm giá',
  });
  
  return user.pointBalance;
};

/**
 * Refund points
 */
const refundPoints = async (userId, points, orderId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  
  const balanceBefore = user.pointBalance;
  user.pointBalance += points;
  await user.save();
  
  await PointHistory.create({
    userId,
    type: 'REFUND',
    points,
    balanceBefore,
    balanceAfter: user.pointBalance,
    orderId,
    description: 'Hoàn điểm từ đơn hàng bị hủy',
  });
  
  return user.pointBalance;
};

/**
 * Get points value in VND
 */
const getPointsValue = (points) => {
  // 100 points = 1,000 VND
  return Math.floor(points / 100) * 1000;
};

/**
 * Calculate rank based on total spent
 */
const calculateRank = (totalSpent) => {
  if (totalSpent >= 5000000) return 'PLATINUM';
  if (totalSpent >= 2000000) return 'GOLD';
  if (totalSpent >= 500000) return 'SILVER';
  return 'BRONZE';
};

module.exports = {
  calculatePointsForOrder,
  earnPoints,
  redeemPoints,
  refundPoints,
  getPointsValue,
  calculateRank,
  RANK_MULTIPLIERS,
};
