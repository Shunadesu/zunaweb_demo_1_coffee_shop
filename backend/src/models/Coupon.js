const mongoose = require('mongoose');

const userUsageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  count: { type: Number, default: 0 },
  lastUsed: Date,
});

const applicableItemSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['CATEGORY', 'PRODUCT'],
    required: true 
  },
  id: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    refPath: 'applicableItems.type === 'CATEGORY' ? 'Category' : 'Product'
  },
});

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  name: { type: String, required: true },
  description: String,
  
  // Type & Value
  type: { 
    type: String, 
    enum: ['PERCENT', 'FIXED', 'FREE_ITEM', 'FREE_SHIP'],
    required: true 
  },
  discountValue: { type: Number, required: true },
  maxDiscount: Number,
  minOrderValue: { type: Number, default: 0 },
  
  // Free item
  freeItemProduct: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product' 
  },
  freeItemQuantity: { type: Number, default: 1 },
  
  // Applicability
  applicableTo: {
    type: String,
    enum: ['ALL', 'CATEGORY', 'PRODUCT', 'MEMBER_RANK'],
    default: 'ALL',
  },
  applicableItems: [applicableItemSchema],
  memberRanks: [{
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
  }],
  
  // Limits
  totalLimit: Number,
  usedCount: { type: Number, default: 0 },
  perUserLimit: { type: Number, default: 1 },
  userUsage: [userUsageSchema],
  
  // Validity
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  
  // Auto apply
  isAutoApply: { type: Boolean, default: false },
  isPublic: { type: Boolean, default: true },
  
  // Status
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  
  // Design
  color: { type: String, default: '#8B4513' },
  icon: { type: String, default: 'Giảm giá' },
  
  // Admin
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
}, {
  timestamps: true,
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isPublic: 1 });
couponSchema.index({ createdAt: -1 });

// Virtual for is valid
couponSchema.virtual('isValid').get(function() {
  const now = new Date();
  return this.isActive && 
         this.validFrom <= now && 
         this.validUntil >= now &&
         (!this.totalLimit || this.usedCount < this.totalLimit);
});

// Check if user can use this coupon
couponSchema.methods.canUserUse = function(userId) {
  // Check if expired
  const now = new Date();
  if (now < this.validFrom || now > this.validUntil) {
    return { canUse: false, reason: 'Coupon đã hết hạn' };
  }
  
  // Check total limit
  if (this.totalLimit && this.usedCount >= this.totalLimit) {
    return { canUse: false, reason: 'Coupon đã hết lượt sử dụng' };
  }
  
  // Check per user limit
  const userUsage = this.userUsage.find(
    u => u.userId.toString() === userId.toString()
  );
  if (userUsage && userUsage.count >= this.perUserLimit) {
    return { canUse: false, reason: 'Bạn đã sử dụng coupon này rồi' };
  }
  
  return { canUse: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function(subtotal, cartItems = []) {
  switch (this.type) {
    case 'PERCENT':
      let discount = subtotal * (this.discountValue / 100);
      if (this.maxDiscount) {
        discount = Math.min(discount, this.maxDiscount);
      }
      return Math.round(discount);
      
    case 'FIXED':
      return Math.min(this.discountValue, subtotal);
      
    case 'FREE_ITEM':
      return 0; // Discount is the free item
      
    case 'FREE_SHIP':
      return 0; // Shipping discount handled separately
      
    default:
      return 0;
  }
};

// Static to generate unique code
couponSchema.statics.generateCode = async function(prefix = 'PROMO') {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  let isUnique = false;
  
  while (!isUnique) {
    code = prefix;
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const existing = await this.findOne({ code });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return code;
};

const Coupon = mongoose.model('Coupon', couponSchema);

module.exports = Coupon;
