import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiAward } from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';

const Profile = () => {
  const { user, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!user) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-4xl">
        <h1 className="section-title mb-8">Tài khoản của tôi</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm h-fit"
          >
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl font-bold text-primary-600">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center text-gray-600">
                <FiPhone className="w-4 h-4 mr-3" />
                {user.phone}
              </div>
              <div className="flex items-center text-gray-600">
                <FiMail className="w-4 h-4 mr-3" />
                {user.email || 'Chưa cập nhật'}
              </div>
              {user.birthday && (
                <div className="flex items-center text-gray-600">
                  <FiCalendar className="w-4 h-4 mr-3" />
                  {new Date(user.birthday).toLocaleDateString('vi-VN')}
                </div>
              )}
            </div>

            {user.memberCode && (
              <div className="mt-6 p-4 bg-primary-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <FiAward className="w-5 h-5 text-primary-600 mr-2" />
                  <span className="font-semibold text-primary-700">Thành viên</span>
                </div>
                <p className="text-sm text-primary-600">Hạng: {user.memberRank}</p>
                <p className="text-sm text-primary-600">Mã: {user.memberCode}</p>
              </div>
            )}
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Personal Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-4">Thông tin cá nhân</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Họ tên</label>
                    <input type="text" defaultValue={user.name} className="input" />
                  </div>
                  <div>
                    <label className="label">Số điện thoại</label>
                    <input type="text" defaultValue={user.phone} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" defaultValue={user.email} className="input" />
                </div>
                <div>
                  <label className="label">Ngày sinh</label>
                  <input type="date" defaultValue={user.birthday?.split('T')[0]} className="input" />
                </div>
                <button type="submit" className="btn-primary">
                  Lưu thay đổi
                </button>
              </form>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Địa chỉ giao hàng</h2>
                <button className="text-primary-600 hover:underline text-sm">
                  + Thêm địa chỉ
                </button>
              </div>
              
              {user.addresses?.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((address, index) => (
                    <div key={index} className="flex items-start p-4 border rounded-lg">
                      <FiMapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium">{address.label}</p>
                        <p className="text-gray-600 text-sm">
                          {address.street}, {address.ward}, {address.district}, {address.city}
                        </p>
                      </div>
                      {address.isDefault && (
                        <span className="badge-primary">Mặc định</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Chưa có địa chỉ giao hàng
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
