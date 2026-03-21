// Settings Page
import { motion } from 'framer-motion';

const Settings = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cài đặt</h2>
        <p className="text-gray-500">Quản lý cấu hình cửa hàng</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Thông tin cửa hàng</h3>
          <form className="space-y-4">
            <div>
              <label className="label">Tên cửa hàng</label>
              <input type="text" className="input" defaultValue="Coffee Shop" />
            </div>
            <div>
              <label className="label">Địa chỉ</label>
              <input type="text" className="input" defaultValue="123 Nguyễn Trãi, Q1, TP.HCM" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Hotline</label>
                <input type="tel" className="input" defaultValue="1900 1234" />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" defaultValue="contact@coffeeshop.com" />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Lưu thay đổi
            </button>
          </form>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Thông báo</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <span>Email thông báo đơn hàng mới</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between">
              <span>Email thông báo khách hàng mới</span>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between">
              <span>SMS thông báo</span>
              <input type="checkbox" className="w-5 h-5" />
            </label>
          </div>
        </motion.div>

        {/* Order Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Cài đặt đơn hàng</h3>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phí giao hàng mặc định</label>
                <input type="number" className="input" defaultValue="15000" />
              </div>
              <div>
                <label className="label">Miễn phí ship từ</label>
                <input type="number" className="input" defaultValue="200000" />
              </div>
            </div>
            <div>
              <label className="label">Thời gian giao hàng dự kiến</label>
              <input type="text" className="input" defaultValue="30-45 phút" />
            </div>
            <button type="submit" className="btn-primary">
              Lưu thay đổi
            </button>
          </form>
        </motion.div>

        {/* Points Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold text-lg mb-4">Cài đặt điểm thưởng</h3>
          <form className="space-y-4">
            <div>
              <label className="label">Tỷ lệ tích điểm cơ bản</label>
              <input type="number" className="input" defaultValue="1" />
              <p className="text-sm text-gray-500 mt-1">% mỗi 100đ chi tiêu</p>
            </div>
            <div>
              <label className="label">100 điểm =</label>
              <input type="number" className="input" defaultValue="1000" />
              <p className="text-sm text-gray-500 mt-1">VND</p>
            </div>
            <button type="submit" className="btn-primary">
              Lưu thay đổi
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
