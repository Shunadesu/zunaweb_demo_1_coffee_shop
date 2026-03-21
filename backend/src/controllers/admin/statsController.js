const Order = require('../../models/Order');
const Product = require('../../models/Product');
const User = require('../../models/User');
const Coupon = require('../../models/Coupon');
const { asyncHandler } = require('../../middleware/errorHandler');
const { getDateRange } = require('../../utils/helpers');

/**
 * @route   GET /api/admin/stats/dashboard
 * @desc    Get dashboard statistics
 * @access  Admin
 */
const getDashboard = asyncHandler(async (req, res) => {
  const { period = 'today' } = req.query;
  const { startDate, endDate } = getDateRange(period);
  
  // Orders stats
  const [orders, revenue, newCustomers, topProducts] = await Promise.all([
    // Order counts by status
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]),
    
    // Total revenue
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $nin: ['CANCELLED', 'REFUNDED'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]),
    
    // New customers
    User.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      role: 'customer',
    }),
    
    // Top products
    Product.find({ soldCount: { $gt: 0 } })
      .sort({ soldCount: -1 })
      .limit(5)
      .select('name soldCount images'),
  ]);
  
  // Calculate order counts
  const orderCounts = orders.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
  
  const totalOrders = Object.values(orderCounts).reduce((a, b) => a + b, 0);
  
  // Get previous period for growth calculation
  const periodLength = endDate - startDate;
  const prevStartDate = new Date(startDate.getTime() - periodLength);
  const prevEndDate = new Date(startDate.getTime() - 1);
  
  const [prevRevenue] = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: prevStartDate, $lte: prevEndDate },
        status: { $nin: ['CANCELLED', 'REFUNDED'] },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$total' },
      },
    },
  ]);
  
  const currentRevenue = revenue[0]?.total || 0;
  const previousRevenue = prevRevenue?.total || 0;
  const revenueGrowth = previousRevenue > 0 
    ? ((currentRevenue - previousRevenue) / previousRevenue * 100).toFixed(1)
    : 0;
  
  res.json({
    success: true,
    data: {
      period,
      timestamp: new Date(),
      orders: {
        total: totalOrders,
        pending: orderCounts.PENDING || 0,
        confirmed: orderCounts.CONFIRMED || 0,
        preparing: orderCounts.PREPARING || 0,
        completed: orderCounts.COMPLETED || 0,
        cancelled: orderCounts.CANCELLED || 0,
      },
      revenue: {
        total: currentRevenue,
        count: revenue[0]?.count || 0,
        growth: parseFloat(revenueGrowth),
      },
      customers: {
        new: newCustomers,
        total: await User.countDocuments({ role: 'customer' }),
      },
      topProducts,
      orderStatusBreakdown: orders,
    },
  });
});

/**
 * @route   GET /api/admin/stats/revenue
 * @desc    Get revenue statistics
 * @access  Admin
 */
const getRevenue = asyncHandler(async (req, res) => {
  const { from, to, groupBy = 'day' } = req.query;
  
  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = to ? new Date(to) : new Date();
  
  let groupFormat;
  switch (groupBy) {
    case 'month':
      groupFormat = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
      break;
    case 'week':
      groupFormat = { 
        year: { $year: '$createdAt' }, 
        week: { $week: '$createdAt' } 
      };
      break;
    default: // day
      groupFormat = { 
        year: { $year: '$createdAt' }, 
        month: { $month: '$createdAt' }, 
        day: { $dayOfMonth: '$createdAt' } 
      };
  }
  
  const revenue = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $nin: ['CANCELLED', 'REFUNDED'] },
      },
    },
    {
      $group: {
        _id: groupFormat,
        revenue: { $sum: '$total' },
        orders: { $sum: 1 },
        items: { $sum: { $size: '$items' } },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);
  
  res.json({ success: true, data: revenue });
});

/**
 * @route   GET /api/admin/stats/orders
 * @desc    Get order statistics
 * @access  Admin
 */
const getOrderStats = asyncHandler(async (req, res) => {
  const { from, to, status } = req.query;
  
  const query = {};
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  if (status) query.status = status;
  
  const [byStatus, byType, byPaymentMethod] = await Promise.all([
    Order.aggregate([
      { $match: query },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: query },
      { $group: { _id: '$orderType', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...query, paymentStatus: 'PAID' } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]),
  ]);
  
  res.json({
    success: true,
    data: { byStatus, byType, byPaymentMethod },
  });
});

/**
 * @route   GET /api/admin/stats/products
 * @desc    Get product statistics
 * @access  Admin
 */
const getProductStats = asyncHandler(async (req, res) => {
  const { from, to, limit = 10 } = req.query;
  
  const matchStage = {};
  if (from || to) {
    matchStage.createdAt = {};
    if (from) matchStage.createdAt.$gte = new Date(from);
    if (to) matchStage.createdAt.$lte = new Date(to);
  }
  
  // Get top selling products
  const topSelling = await Product.find({ soldCount: { $gt: 0 } })
    .sort({ soldCount: -1 })
    .limit(parseInt(limit))
    .select('name images soldCount basePrice');
  
  // Get most viewed products
  const mostViewed = await Product.find({ viewCount: { $gt: 0 } })
    .sort({ viewCount: -1 })
    .limit(parseInt(limit))
    .select('name images viewCount');
  
  // Category distribution
  const byCategory = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $project: { name: '$category.name', count: 1 } },
    { $sort: { count: -1 } },
  ]);
  
  res.json({
    success: true,
    data: { topSelling, mostViewed, byCategory },
  });
});

/**
 * @route   GET /api/admin/stats/customers
 * @desc    Get customer statistics
 * @access  Admin
 */
const getCustomerStats = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  
  const query = {};
  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to) query.createdAt.$lte = new Date(to);
  }
  
  const [byRank, byMonth] = await Promise.all([
    User.aggregate([
      { $match: { role: 'customer', ...query } },
      { $group: { _id: '$memberRank', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    User.aggregate([
      { $match: { role: 'customer' } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);
  
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  
  res.json({
    success: true,
    data: {
      total: totalCustomers,
      byRank,
      byMonth,
    },
  });
});

/**
 * @route   GET /api/admin/stats/coupons
 * @desc    Get coupon statistics
 * @access  Admin
 */
const getCouponStats = asyncHandler(async (req, res) => {
  const [coupons, mostUsed] = await Promise.all([
    Coupon.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, totalUsed: { $sum: '$usedCount' } } },
    ]),
    Coupon.find({ usedCount: { $gt: 0 } })
      .sort({ usedCount: -1 })
      .limit(5)
      .select('code name usedCount'),
  ]);
  
  res.json({
    success: true,
    data: { byType: coupons, mostUsed },
  });
});

/**
 * @route   GET /api/admin/stats/comparison
 * @desc    Compare two periods
 * @access  Admin
 */
const getComparison = asyncHandler(async (req, res) => {
  const { period1 = 'today', period2 = 'yesterday' } = req.query;
  
  const getStats = async (period) => {
    const { startDate, endDate } = getDateRange(period);
    
    const [orders, revenue, customers] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate },
            status: { $nin: ['CANCELLED', 'REFUNDED'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      User.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        role: 'customer',
      }),
    ]);
    
    return {
      period,
      orders,
      revenue: revenue[0]?.total || 0,
      customers,
    };
  };
  
  const [stats1, stats2] = await Promise.all([
    getStats(period1),
    getStats(period2),
  ]);
  
  res.json({
    success: true,
    data: { period1: stats1, period2: stats2 },
  });
});

module.exports = {
  getDashboard,
  getRevenue,
  getOrderStats,
  getProductStats,
  getCustomerStats,
  getCouponStats,
  getComparison,
};
