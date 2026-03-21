import { motion } from 'framer-motion';
import { FiCheck, FiMapPin, FiPhone } from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';

const OrderSuccess = () => {
  const { orderNumber } = useParams();

  return (
    <div className="py-16">
      <div className="container-custom max-w-lg">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <FiCheck className="w-10 h-10 text-green-600" />
          </motion.div>

          <h1 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h1>
          <p className="text-gray-600 mb-6">
            Cảm ơn bạn đã đặt hàng. Đơn hàng #{orderNumber} đang được xử lý.
          </p>

          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center text-primary-700">
              <FiMapPin className="mr-2" />
              <span>Quán Coffee Shop - 123 Nguyễn Trãi, Q1, TP.HCM</span>
            </div>
            <div className="flex items-center justify-center text-primary-700 mt-2">
              <FiPhone className="mr-2" />
              <span>Hotline: 1900 1234</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link to={`/order-tracking?order=${orderNumber}`} className="btn-primary w-full">
              Theo dõi đơn hàng
            </Link>
            <Link to="/orders" className="btn-outline w-full">
              Xem lịch sử đơn hàng
            </Link>
            <Link to="/menu" className="btn-ghost w-full">
              Tiếp tục mua hàng
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderSuccess;
