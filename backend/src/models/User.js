const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Nhà' },
  street: { type: String, required: true },
  ward: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, default: 'TP.HCM' },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true, select: false },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: { type: String, required: true, trim: true },
  avatar: { type: String, default: '' },
  
  // Auth
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer',
  },
  isActive: { type: Boolean, default: true },
  emailVerified: { type: Boolean, default: false },
  
  // Membership
  memberCode: { type: String, unique: true, sparse: true },
  memberRank: {
    type: String,
    enum: ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'],
    default: 'BRONZE',
  },
  points: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  pointBalance: { type: Number, default: 0 },
  
  // Referral
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Personal
  birthday: Date,
  addresses: [addressSchema],
  
  // Preferences
  favoriteProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  favoriteCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  
  // Tokens
  refreshToken: { type: String, select: false },
  lastLogin: Date,
  
  // Rank upgrade tracking
  rankUpgradedAt: Date,
}, {
  timestamps: true,
});

// Indexes
userSchema.index({ memberCode: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ memberRank: 1 });
userSchema.index({ createdAt: -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform output
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

// Static method to generate member code
userSchema.statics.generateMemberCode = async function() {
  const year = new Date().getFullYear();
  const count = await this.countDocuments({
    memberCode: new RegExp(`^CAFE${year}`),
  });
  return `CAFE${year}${String(count + 1).padStart(4, '0')}`;
};

// Static method to generate referral code
userSchema.statics.generateReferralCode = function() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'REF';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
