import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiPackage } from 'react-icons/fi';
import { useOrderStore } from '@/stores/orderStore';

const OrderTracking = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const { trackingOrder, trackOrder, isLoading } = useOrderStore();

  const handleTrack = async (e) => {
    e.preventDefault();
    await trackOrder(orderNumber, phone);
  };

  const statusSteps = [
    { key: 'PENDING', label: 'Đã đặt' },
    { key: 'CONFIRMED', label: 'Xác nhận' },
    { key: 'PREPARING', label: 'Đang làm' },
    { key: 'READY', label: 'Sẵn sàng' },
    { key: 'COMPLETED', label: 'Hoàn thành' },
  ];

  const getCurrentStep = (status) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  return (
    <div className="py-16">
      <div className="container-custom max-w-2xl">
        <h1 className="section-title text-center mb-8">Theo dõi đơn hàng</h1>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleTrack}
          className="bg-white rounded-xl p-6 shadow-sm mb-8"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Mã đơn hàng *</label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ví dụ: CF2024032100001"
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Số điện thoại *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0xxx xxx xxx"
                className="input"
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full mt-4" disabled={isLoading}>
            <FiSearch className="mr-2" />
            {isLoading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </motion.form>

        {trackingOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center mb-6">
              <FiPackage className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <h2 className="font-semibold text-lg">Đơn hàng #{trackingOrder.orderNumber}</h2>
                <p className="text-gray-500 text-sm">
                  Đặt lúc {new Date(trackingOrder.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-8">
              <div className="flex justify-between relative">
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-primary-600 transition-all"
                    style={{
                      width: `${(getCurrentStep(trackingOrder.status) / (statusSteps.length - 1)) * 100}%`
                    }}
                  />
                </div>
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= getCurrentStep(trackingOrder.status);
                  return (
                    <div key={step.key} className="relative text-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center ${
                          isCompleted ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className={`text-xs mt-2 ${isCompleted ? 'text-primary-600 font-medium' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
              <p className="text-gray-600">{trackingOrder.customer.name}</p>
              <p className="text-gray-600">{trackingOrder.customer.phone}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
