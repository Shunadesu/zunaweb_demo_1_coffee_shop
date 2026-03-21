const mongoose = require('mongoose');

const pointHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: {
    type: String,
    enum: ['EARN', 'REDEEM', 'BONUS', 'ADJUST', 'EXPIRE', 'REFUND'],
    required: true,
  },
  
  // Points
  points: { type: Number, required: true },
  balanceBefore: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  
  // Reference
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  
  // Details
  description: String,
  rankAtThatTime: String,
  multiplier: { type: Number, default: 1 },
  
  // Admin action
  adjustedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reason: String,
  
  expiresAt: Date,
}, {
  timestamps: true,
});

// Indexes
pointHistorySchema.index({ userId: 1 });
pointHistorySchema.index({ type: 1 });
pointHistorySchema.index({ createdAt: -1 });
pointHistorySchema.index({ expiresAt: 1 });

// Static: Calculate points for order
pointHistorySchema.statics.calculatePointsForOrder = function(totalSpent, memberRank) {
  const baseRate = 0.01; // 1 point per 100 VND
  
  const rankMultipliers = {
    BRONZE: 1.0,
    SILVER: 2.0,
    GOLD: 2.5,
    PLATINUM: 3.0,
  };
  
  const multiplier = rankMultipliers[memberRank] || 1.0;
  const points = Math.floor(totalSpent * baseRate * multiplier);
  
  return points;
};

// Static: Get points value
pointHistorySchema.statics.getPointsValue = function(points) {
  // 100 points = 1,000 VND
  return Math.floor(points / 100) * 1000;
};

const PointHistory = mongoose.model('PointHistory', pointHistorySchema);

module.exports = PointHistory;
