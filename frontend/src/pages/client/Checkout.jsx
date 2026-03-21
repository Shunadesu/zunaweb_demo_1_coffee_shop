import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';

const Checkout = () => {
  const { user } = useAuthStore();

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="section-title mb-8">Thanh toán</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Customer Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Thông tin khách hàng</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Họ tên *</label>
                  <input type="text" className="input" defaultValue={user?.name} />
                </div>
                <div>
                  <label className="label">Số điện thoại *</label>
                  <input type="tel" className="input" defaultValue={user?.phone} />
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Địa chỉ email</label>
                <input type="email" className="input" defaultValue={user?.email} />
              </div>
            </div>

            {/* Order Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Hình thức nhận hàng</h2>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                  <input type="radio" name="orderType" value="delivery" className="mr-3" defaultChecked />
                  <div>
                    <p className="font-medium">Giao hàng</p>
                    <p className="text-sm text-gray-500">Phí 15,000đ</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                  <input type="radio" name="orderType" value="pickup" className="mr-3" />
                  <div>
                    <p className="font-medium">Nhận tại quán</p>
                    <p className="text-sm text-gray-500">Miễn phí</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                  <input type="radio" name="payment" value="cod" className="mr-3" defaultChecked />
                  <div>
                    <p className="font-medium">Tiền mặt (COD)</p>
                    <p className="text-sm text-gray-500">Thanh toán khi nhận hàng</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50">
                  <input type="radio" name="payment" value="banking" className="mr-3" />
                  <div>
                    <p className="font-medium">Chuyển khoản</p>
                    <p className="text-sm text-gray-500">Ngân hàng Vietcombank</p>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:pl-8"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Đơn hàng</h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {/* Cart items would be rendered here */}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>0đ</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng</span>
                  <span>15,000đ</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">0đ</span>
                </div>
              </div>

              <button className="btn-primary w-full mt-6 py-3">
                Đặt hàng
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
