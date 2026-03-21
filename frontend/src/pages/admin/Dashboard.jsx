import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown, FiShoppingBag, FiDollarSign, FiUsers, FiPackage } from 'react-icons/fi';
import { adminStatsApi } from '@/api/admin/statsApi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const response = await adminStatsApi.getDashboard({ period: 'today' });
      setStats(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng đơn hàng',
      value: stats?.orders?.total || 0,
      icon: FiShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Doanh thu',
      value: `${(stats?.revenue?.total || 0).toLocaleString()}đ`,
      icon: FiDollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8.3%',
      trend: 'up',
    },
    {
      title: 'Khách hàng mới',
      value: stats?.customers?.new || 0,
      icon: FiUsers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+5',
      trend: 'up',
    },
    {
      title: 'Sản phẩm bán ra',
      value: stats?.orders?.completed || 0,
      icon: FiPackage,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-2%',
      trend: 'down',
    },
  ];

  const orderStatusData = [
    { name: 'Hoàn thành', value: stats?.orders?.completed || 0, color: '#10b981' },
    { name: 'Đang làm', value: stats?.orders?.preparing || 0, color: '#f59e0b' },
    { name: 'Chờ xác nhận', value: stats?.orders?.pending || 0, color: '#3b82f6' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-500">Tổng quan hoạt động hôm nay</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <span className={`flex items-center text-sm ${
                card.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.trend === 'up' ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                {card.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
            <p className="text-gray-500 text-sm">{card.title}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Doanh thu</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Trạng thái đơn hàng</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {orderStatusData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Đơn hàng gần đây</h3>
            <a href="/admin/orders" className="text-primary-600 hover:underline text-sm">
              Xem tất cả
            </a>
          </div>
          <div className="space-y-3">
            {/* Placeholder for recent orders */}
            <p className="text-gray-500 text-center py-4">Đang tải...</p>
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Sản phẩm bán chạy</h3>
            <a href="/admin/products" className="text-primary-600 hover:underline text-sm">
              Xem tất cả
            </a>
          </div>
          <div className="space-y-3">
            {(stats?.topProducts || []).slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center">
                <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-xs font-semibold text-primary-600 mr-3">
                  {index + 1}
                </span>
                <img
                  src={product.images?.[0]?.url || 'https://via.placeholder.com/40'}
                  alt={product.name}
                  className="w-10 h-10 rounded-lg object-cover mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.soldCount} đã bán</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
