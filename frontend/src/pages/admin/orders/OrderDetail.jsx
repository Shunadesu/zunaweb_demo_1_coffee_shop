import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiClock } from 'react-icons/fi';
import { adminOrderApi } from '@/api/admin/orderApi';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const response = await adminOrderApi.getById(id);
      setOrder(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await adminOrderApi.updateStatus(id, { status: newStatus });
      fetchOrder();
    } catch (error) {
      console.error(error);
    }
  };

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

  const statusActions = {
    PENDING: [{ status: 'CONFIRMED', label: 'Xác nhận', icon: FiCheck, color: 'btn-primary' }],
    CONFIRMED: [{ status: 'PREPARING', label: 'Bắt đầu làm', icon: FiCheck, color: 'btn-primary' }],
    PREPARING: [{ status: 'READY', label: 'Hoàn thành', icon: FiCheck, color: 'btn-success' }],
    READY: [{ status: 'COMPLETED', label: 'Giao hàng', icon: FiCheck, color: 'btn-success' }],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
      </div>
    );
  }

  const badge = getStatusBadge(order.status);
  const actions = statusActions[order.status] || [];

  return (
    <div>
      <button
        onClick={() => navigate('/admin/orders')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Đơn hàng #{order.orderNumber}</h2>
                <p className="text-gray-500 text-sm">
                  {new Date(order.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
              </span>
            </div>

            {/* Actions */}
            {actions.length > 0 && (
              <div className="flex gap-2 mb-4">
                {actions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => handleUpdateStatus(action.status)}
                    className={`btn ${action.color}`}
                  >
                    <action.icon className="mr-2" />
                    {action.label}
                  </button>
                ))}
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus('CANCELLED')}
                    className="btn btn-danger"
                  >
                    Hủy đơn
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4">Sản phẩm</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center">
                    <img
                      src={item.image || 'https://via.placeholder.com/50'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover mr-4"
                    />
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {item.unitPrice?.toLocaleString()}đ
                        {item.size && ` (${item.size})`}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{item.subtotal?.toLocaleString()}đ</p>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính</span>
                <span>{order.subtotal?.toLocaleString()}đ</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Giảm giá</span>
                  <span>-{order.discountAmount?.toLocaleString()}đ</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Tổng cộng</span>
                <span className="text-primary-600">{order.total?.toLocaleString()}đ</span>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4">Lịch sử trạng thái</h3>
            <div className="space-y-4">
              {order.statusHistory?.map((history, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <FiClock className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{getStatusBadge(history.status).label}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(history.changedAt).toLocaleString('vi-VN')}
                    </p>
                    {history.note && <p className="text-sm text-gray-600 mt-1">{history.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4">Khách hàng</h3>
            <div className="space-y-2">
              <p className="font-medium">{order.customer?.name}</p>
              <p className="text-gray-500">{order.customer?.phone}</p>
              {order.customer?.email && (
                <p className="text-gray-500">{order.customer?.email}</p>
              )}
            </div>
          </motion.div>

          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4">Thông tin giao hàng</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Loại:</span>{' '}
                {order.orderType === 'DELIVERY' ? 'Giao hàng' : 'Nhận tại quán'}
              </p>
              {order.orderType === 'DELIVERY' && order.customer?.address && (
                <p className="text-gray-600">
                  <span className="font-medium">Địa chỉ:</span>{' '}
                  {order.customer.address.street}, {order.customer.address.ward}, {order.customer.address.district}
                </p>
              )}
            </div>
          </motion.div>

          {/* Payment */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <h3 className="font-semibold mb-4">Thanh toán</h3>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Phương thức:</span>{' '}
                {order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : order.paymentMethod}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Trạng thái:</span>{' '}
                {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
