// User Detail Page
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiPlus, FiMinus } from 'react-icons/fi';
import { adminUserApi } from '@/api/admin/userApi';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [pointsHistory, setPointsHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adjustPoints, setAdjustPoints] = useState({ points: '', type: 'ADD', reason: '' });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const [userRes, pointsRes] = await Promise.all([
        adminUserApi.getById(id),
        adminUserApi.getUserPoints(id),
      ]);
      setUser(userRes.data);
      setPointsHistory(pointsRes.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleAdjustPoints = async (e) => {
    e.preventDefault();
    try {
      await adminUserApi.updatePoints(id, {
        points: parseInt(adjustPoints.points),
        type: adjustPoints.type,
        reason: adjustPoints.reason,
      });
      fetchUser();
      setAdjustPoints({ points: '', type: 'ADD', reason: '' });
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy khách hàng</p>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/admin/users')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại danh sách
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl font-bold text-primary-600">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-gray-500">{user.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
              {user.memberRank} Member
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Số điện thoại</span>
              <span className="font-medium">{user.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Mã thành viên</span>
              <span className="font-medium font-mono">{user.memberCode}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Điểm tích lũy</span>
              <span className="font-bold text-primary-600">{user.pointBalance?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">Tổng chi tiêu</span>
              <span className="font-medium">{user.totalSpent?.toLocaleString()}đ</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Trạng thái</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.isActive ? 'Hoạt động' : 'Bị khóa'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Points Adjustment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h3 className="font-semibold mb-4">Điều chỉnh điểm</h3>
          <form onSubmit={handleAdjustPoints} className="space-y-4">
            <div>
              <label className="label">Số điểm</label>
              <input
                type="number"
                value={adjustPoints.points}
                onChange={(e) => setAdjustPoints({ ...adjustPoints, points: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Hành động</label>
              <select
                value={adjustPoints.type}
                onChange={(e) => setAdjustPoints({ ...adjustPoints, type: e.target.value })}
                className="input"
              >
                <option value="ADD">Cộng điểm</option>
                <option value="SUBTRACT">Trừ điểm</option>
              </select>
            </div>
            <div>
              <label className="label">Lý do</label>
              <input
                type="text"
                value={adjustPoints.reason}
                onChange={(e) => setAdjustPoints({ ...adjustPoints, reason: e.target.value })}
                className="input"
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              <FiPlus className="mr-2" />
              Cập nhật điểm
            </button>
          </form>
        </motion.div>

        {/* Points History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-6 shadow-sm lg:col-span-1"
        >
          <h3 className="font-semibold mb-4">Lịch sử điểm</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {pointsHistory.slice(0, 10).map((item) => (
              <div key={item._id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className={`font-bold ${item.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UserDetail;
