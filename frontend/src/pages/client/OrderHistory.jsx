import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiEye, FiRefreshCw } from 'react-icons/fi';
import { useOrderStore } from '@/stores/orderStore';

const OrderHistory = () => {
  const { orders, fetchOrders, pagination } = useOrderStore();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchOrders({ status: statusFilter });
  }, [fetchOrders, statusFilter]);

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Chờ xác nhận' },
      CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Đã xác nhận' },
      PREPARING: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Đang làm' },
      READY: { bg: 'bg-green-100', text: 'text-green-800', label: 'Sẵn sàng' },
      COMPLETED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Hoàn thành' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Đã hủy' },
    };
    return statusMap[status] || statusMap.PENDING;
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="section-title mb-8">Lịch sử đơn hàng</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['', 'PENDING', 'CONFIRMED', 'PREPARING', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === '' ? 'Tất cả' : getStatusBadge(status).label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FiPackage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Chưa có đơn hàng nào</p>
            <Link to="/menu" className="btn-primary">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const badge = getStatusBadge(order.status);
              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-semibold">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                      {badge.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center text-sm">
                        <span className="text-gray-500">x{item.quantity}</span>
                        <span className="ml-2">{item.name}</span>
                        {item.size && <span className="text-gray-400 ml-1">({item.size})</span>}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <p className="text-sm text-gray-500">
                        +{order.items.length - 3} sản phẩm khác
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-lg font-bold text-primary-600">
                      {order.total.toLocaleString()}đ
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/orders/${order._id}`}
                        className="btn-outline text-sm"
                      >
                        <FiEye className="mr-1" />
                        Chi tiết
                      </Link>
                      {order.status === 'COMPLETED' && (
                        <button className="btn-ghost text-sm">
                          <FiRefreshCw className="mr-1" />
                          Đặt lại
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => fetchOrders({ page: i + 1, status: statusFilter })}
                  className={`w-10 h-10 rounded-lg ${
                    pagination.page === i + 1
                      ? 'bg-primary-600 text-white'
                      : 'bg-white hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
