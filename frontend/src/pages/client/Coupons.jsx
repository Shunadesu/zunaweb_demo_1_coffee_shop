import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag, FiGift } from 'react-icons/fi';
import { userCouponApi } from '@/api/user/couponApi';

const Coupons = () => {
  const [activeTab, setActiveTab] = useState('available');
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, [activeTab]);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await userCouponApi.getMyCoupons({ status: activeTab });
      setCoupons(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const getCouponTypeLabel = (type) => {
    const labels = {
      PERCENT: 'Giảm %',
      FIXED: 'Giảm tiền',
      FREE_ITEM: 'Tặng quà',
      FREE_SHIP: 'Free ship',
    };
    return labels[type] || type;
  };

  const isExpiringSoon = (validUntil) => {
    const days = (new Date(validUntil) - new Date()) / (1000 * 60 * 60 * 24);
    return days <= 3;
  };

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="section-title mb-8">Kho voucher</h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: 'available', label: 'Có thể sử dụng' },
            { key: 'used', label: 'Đã sử dụng' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Coupons */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <FiTag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Chưa có voucher nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon, index) => (
              <motion.div
                key={coupon._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl overflow-hidden shadow-sm ${
                  !coupon.isValid ? 'opacity-60' : ''
                }`}
              >
                <div className="flex">
                  {/* Left side */}
                  <div className={`p-6 ${coupon.isFeatured ? 'bg-gradient-to-br from-primary-500 to-secondary-500 text-white' : 'bg-primary-100 text-primary-800'} flex flex-col items-center justify-center min-w-[120px]`}>
                    <FiGift className="w-8 h-8 mb-2" />
                    <span className="text-2xl font-bold">
                      {coupon.type === 'PERCENT' ? `${coupon.discountValue}%` : `${coupon.discountValue / 1000}k`}
                    </span>
                    {coupon.maxDiscount && (
                      <span className="text-xs mt-1">tối đa {coupon.maxDiscount.toLocaleString()}đ</span>
                    )}
                  </div>

                  {/* Right side */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{coupon.name}</h3>
                        <p className="text-sm text-gray-500">{coupon.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {coupon.minOrderValue > 0 && (
                            <span>Đơn tối thiểu {coupon.minOrderValue.toLocaleString()}đ</span>
                          )}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.isValid ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {coupon.isValid ? 'Còn hạn' : 'Hết hạn'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="text-sm text-gray-500">
                        HSD: {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}
                        {isExpiringSoon(coupon.validUntil) && (
                          <span className="text-red-500 ml-2">Sắp hết hạn!</span>
                        )}
                      </div>
                      <code className="bg-gray-100 px-3 py-1 rounded font-mono">
                        {coupon.code}
                      </code>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Coupons;
