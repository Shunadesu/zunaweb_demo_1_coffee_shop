const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
  
  type: {
    type: String,
    enum: [
      'ORDER_NEW', 
      'ORDER_CONFIRMED', 
      'ORDER_PREPARING', 
      'ORDER_READY', 
      'ORDER_COMPLETED', 
      'ORDER_CANCELLED',
      'POINTS_EARNED', 
      'POINTS_REDEEMED', 
      'POINTS_EXPIRING',
      'COUPON_NEW', 
      'COUPON_EXPIRING', 
      'BIRTHDAY',
      'BLOG_NEW', 
      'PROMOTION',
      'SYSTEM'
    ],
    required: true,
  },
  
  title: { type: String, required: true },
  message: { type: String, required: true },
  
  // Data
  data: {
    orderId: mongoose.Schema.Types.ObjectId,
    couponId: mongoose.Schema.Types.ObjectId,
    blogId: mongoose.Schema.Types.ObjectId,
    productId: mongoose.Schema.Types.ObjectId,
    amount: Number,
    points: Number,
    rank: String,
  },
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  // Delivery
  channel: {
    type: String,
    enum: ['IN_APP', 'EMAIL', 'SMS', 'PUSH'],
    default: 'IN_APP',
  },
  isSent: { type: Boolean, default: false },
  sentAt: Date,
  
  // For broadcast
  isBroadcast: { type: Boolean, default: false },
  targetAudience: String,
  
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ userId: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isRead: 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ isBroadcast: 1 });

// Mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Static: Create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  return notification;
};

// Static: Create order notification
notificationSchema.statics.createOrderNotification = async function(
  userId, 
  type, 
  order, 
  extraData = {}
) {
  const messages = {
    ORDER_CONFIRMED: {
      title: 'Đơn hàng đã được xác nhận',
      message: `Đơn hàng #${order.orderNumber} đã được xác nhận và đang được chuẩn bị.`,
    },
    ORDER_PREPARING: {
      title: 'Đơn hàng đang được chuẩn bị',
      message: `Đơn hàng #${order.orderNumber} đang được pha chế.`,
    },
    ORDER_READY: {
      title: 'Đơn hàng đã sẵn sàng',
      message: `Đơn hàng #${order.orderNumber} đã hoàn thành và sẵn sàng ${
        order.orderType === 'DELIVERY' ? 'để giao hàng' : 'để nhận'
      }.`,
    },
    ORDER_COMPLETED: {
      title: 'Cảm ơn bạn đã đặt hàng!',
      message: `Đơn hàng #${order.orderNumber} đã hoàn tất. Cảm ơn bạn!`,
    },
    ORDER_CANCELLED: {
      title: 'Đơn hàng đã bị hủy',
      message: `Đơn hàng #${order.orderNumber} đã bị hủy. Liên hệ để được hỗ trợ.`,
    },
  };
  
  const { title, message } = messages[type] || { 
    title: 'Thông báo', 
    message: 'Có thông báo mới từ Coffee Shop.' 
  };
  
  return this.createNotification({
    userId,
    type,
    title,
    message,
    data: {
      orderId: order._id,
      ...extraData,
    },
  });
};

// Static: Create points notification
notificationSchema.statics.createPointsNotification = async function(
  userId, 
  type, 
  points, 
  order = null
) {
  const messages = {
    POINTS_EARNED: {
      title: 'Bạn nhận được điểm thưởng!',
      message: `Chúc mừng! Bạn đã nhận được ${points} điểm ${
        order ? `từ đơn hàng #${order.orderNumber}` : ''
      }.`,
    },
    POINTS_REDEEMED: {
      title: 'Điểm đã được sử dụng',
      message: `Bạn đã sử dụng ${points} điểm.`,
    },
  };
  
  const { title, message } = messages[type] || {
    title: 'Thông báo điểm',
    message: 'Có thông báo về điểm thưởng.',
  };
  
  return this.createNotification({
    userId,
    type,
    title,
    message,
    data: { points },
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
