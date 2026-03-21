const Notification = require('../models/Notification');
const Order = require('../models/Order');

/**
 * Send order status update notification
 */
const sendOrderStatusUpdate = async (userId, order, newStatus) => {
  const statusMessages = {
    CONFIRMED: {
      title: 'Đơn hàng đã được xác nhận',
      message: `Đơn hàng #${order.orderNumber} đã được xác nhận và đang được chuẩn bị.`,
    },
    PREPARING: {
      title: 'Đơn hàng đang được chuẩn bị',
      message: `Đơn hàng #${order.orderNumber} đang được pha chế.`,
    },
    READY: {
      title: 'Đơn hàng đã sẵn sàng',
      message: `Đơn hàng #${order.orderNumber} đã hoàn thành và sẵn sàng ${
        order.orderType === 'DELIVERY' ? 'để giao hàng' : 'để nhận'
      }.`,
    },
    COMPLETED: {
      title: 'Cảm ơn bạn đã đặt hàng!',
      message: `Đơn hàng #${order.orderNumber} đã hoàn tất. Cảm ơn bạn!`,
    },
    CANCELLED: {
      title: 'Đơn hàng đã bị hủy',
      message: `Đơn hàng #${order.orderNumber} đã bị hủy. Liên hệ để được hỗ trợ.`,
    },
  };
  
  const msg = statusMessages[newStatus];
  if (!msg) return;
  
  await Notification.create({
    userId,
    type: `ORDER_${newStatus}`,
    title: msg.title,
    message: msg.message,
    data: { orderId: order._id, orderNumber: order.orderNumber },
    channel: 'IN_APP',
  });
};

/**
 * Send points notification
 */
const sendPointsNotification = async (userId, type, points, description = '') => {
  const messages = {
    EARN: {
      title: 'Bạn nhận được điểm thưởng!',
      message: `Chúc mừng! Bạn đã nhận được ${points} điểm.`,
    },
    REDEEM: {
      title: 'Điểm đã được sử dụng',
      message: `Bạn đã sử dụng ${points} điểm.`,
    },
    EXPIRE: {
      title: 'Điểm sắp hết hạn',
      message: `Một số điểm của bạn sẽ hết hạn trong 7 ngày.`,
    },
  };
  
  const msg = messages[type];
  if (!msg) return;
  
  await Notification.create({
    userId,
    type: `POINTS_${type}`,
    title: msg.title,
    message: msg.message + (description ? ` ${description}` : ''),
    data: { points },
    channel: 'IN_APP',
  });
};

/**
 * Send coupon notification
 */
const sendCouponNotification = async (userId, coupon, type) => {
  const messages = {
    NEW: {
      title: 'Coupon mới!',
      message: `Bạn có coupon "${coupon.name}" đang chờ.`,
    },
    EXPIRING: {
      title: 'Coupon sắp hết hạn',
      message: `Coupon "${coupon.name}" sẽ hết hạn trong 3 ngày.`,
    },
  };
  
  const msg = messages[type];
  if (!msg) return;
  
  await Notification.create({
    userId,
    type: `COUPON_${type}`,
    title: msg.title,
    message: msg.message,
    data: { couponId: coupon._id, code: coupon.code },
    channel: 'IN_APP',
  });
};

/**
 * Send birthday notification
 */
const sendBirthdayNotification = async (userId) => {
  await Notification.create({
    userId,
    type: 'BIRTHDAY',
    title: 'Chúc mừng sinh nhật!',
    message: 'Chúc mừng sinh nhật bạn! Nhận ưu đãi đặc biệt hôm nay.',
    data: { birthday: true },
    channel: 'IN_APP',
  });
};

/**
 * Get user notifications
 */
const getNotifications = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ userId }),
    Notification.countDocuments({ userId, isRead: false }),
  ]);
  
  return {
    notifications,
    total,
    unreadCount,
    hasMore: skip + limit < total,
  };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({ 
    _id: notificationId, 
    userId 
  });
  
  if (notification && !notification.isRead) {
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
  }
};

/**
 * Mark all as read
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

module.exports = {
  sendOrderStatusUpdate,
  sendPointsNotification,
  sendCouponNotification,
  sendBirthdayNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
};
