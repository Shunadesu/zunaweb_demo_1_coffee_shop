import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiTag } from 'react-icons/fi';
import { useCartStore } from '@/stores/cartStore';

const Cart = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    coupon,
    couponDiscount,
    removeCoupon,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-semibold mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng</p>
        <Link to="/menu" className="btn-primary px-8 py-3">
          Xem Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom">
        <h1 className="section-title mb-8">Giỏ hàng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 flex items-center gap-4 ${
                    index !== items.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                >
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    {item.size && (
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                    )}
                    {item.toppings?.length > 0 && (
                      <p className="text-sm text-gray-500">
                        Topping: {item.toppings.map(t => t.name).join(', ')}
                      </p>
                    )}
                    <p className="text-primary-600 font-semibold">
                      {item.unitPrice.toLocaleString()}đ
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <FiMinus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 hover:bg-gray-100"
                      >
                        <FiPlus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[100px]">
                      <p className="font-bold text-gray-900">
                        {item.subtotal.toLocaleString()}đ
                      </p>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <Link
              to="/menu"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              ← Tiếp tục mua hàng
            </Link>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
            >
              <h2 className="font-semibold text-lg mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span>{getSubtotal().toLocaleString()}đ</span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center">
                      <FiTag className="mr-1" />
                      Giảm giá
                    </span>
                    <span>-{couponDiscount.toLocaleString()}đ</span>
                  </div>
                )}
              </div>

              {coupon && (
                <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg mb-4">
                  <div>
                    <p className="text-green-700 font-medium">{coupon.code}</p>
                    <p className="text-sm text-green-600">{coupon.name}</p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-green-600 hover:text-green-700"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">
                    {(getSubtotal() - (couponDiscount || 0)).toLocaleString()}đ
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full py-3 text-center"
              >
                Tiến hành thanh toán
              </Link>

              <p className="text-center text-sm text-gray-500 mt-4">
                Miễn phí giao hàng cho đơn từ 200,000đ
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
