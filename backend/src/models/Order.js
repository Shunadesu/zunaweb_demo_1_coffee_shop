const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  name: { type: String, required: true }, // Snapshot
  image: { type: String, default: '' },
  size: { type: String, default: '' },
  toppings: [{
    name: String,
    price: Number,
  }],
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: Number, // Price at order time
  notes: { type: String, default: '' },
  subtotal: Number,
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
});

const orderSchema = new mongoose.Schema({
  orderNumber: { 
    type: String, 
    unique: true 
  },
  
  // Customer Info
  customerType: { 
    type: String, 
    enum: ['GUEST', 'MEMBER'],
    required: true 
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: {
      street: String,
      ward: String,
      district: String,
      city: { type: String, default: 'TP.HCM' },
    },
  },
  
  // User reference (if member)
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  memberCode: String,
  memberRank: String,
  
  // Order Type
  orderType: { 
    type: String, 
    enum: ['DELIVERY', 'PICKUP', 'DINE_IN'],
    required: true 
  },
  tableNumber: String,
  
  // Items
  items: [orderItemSchema],
  
  // Pricing
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: String,
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  
  // Points
  pointsRedeemed: { type: Number, default: 0 },
  pointsDiscount: { type: Number, default: 0 },
  pointsEarned: { type: Number, default: 0 },
  
  // Shipping
  shippingFee: { type: Number, default: 0 },
  deliveryTime: String,
  
  // Total
  total: { type: Number, required: true },
  
  // Payment
  paymentMethod: { 
    type: String, 
    enum: ['COD', 'BANKING', 'MOMO', 'VNPAY', 'WALLET'],
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED', 'PARTIAL_REFUND'],
    default: 'PENDING' 
  },
  paidAt: Date,
  transactionId: String,
  
  // Status
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERING', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING',
  },
  statusHistory: [statusHistorySchema],
  
  // Admin
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  preparedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Notes
  customerNotes: String,
  adminNotes: String,
  
  // Review
  isReviewed: { type: Boolean, default: false },
  rating: Number,
  review: String,
  reviewImages: [String],
  
  // Source
  source: { type: String, enum: ['WEB', 'APP', 'POS'], default: 'WEB' },
}, {
  timestamps: true,
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ userId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.phone': 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ total: 1 });

// Generate order number
orderSchema.statics.generateOrderNumber = async function() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const prefix = `CF${year}${month}${day}`;
  
  // Find the last order with this prefix
  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^${prefix}`),
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

// Add status to history
orderSchema.methods.addStatusHistory = function(status, changedBy = null, note = null) {
  this.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy,
    note,
  });
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal 
    - this.discountAmount 
    - this.pointsDiscount 
    + this.shippingFee;
};

// Static method to get valid status transitions
orderSchema.statics.getValidTransitions = function() {
  return {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PREPARING', 'CANCELLED'],
    PREPARING: ['READY', 'CANCELLED'],
    READY: ['DELIVERING', 'COMPLETED'],
    DELIVERING: ['COMPLETED'],
    COMPLETED: [],
    CANCELLED: ['REFUNDED'],
    REFUNDED: [],
  };
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
