// Coupon Form Page
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { adminCouponApi } from '@/api/admin/couponApi';

const CouponForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'PERCENT',
    discountValue: '',
    maxDiscount: '',
    minOrderValue: '',
    validFrom: '',
    validUntil: '',
    totalLimit: '',
    perUserLimit: 1,
    isPublic: true,
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        totalLimit: formData.totalLimit ? parseInt(formData.totalLimit) : undefined,
        perUserLimit: parseInt(formData.perUserLimit),
        validFrom: new Date(formData.validFrom),
        validUntil: new Date(formData.validUntil),
      };

      if (isEditing) {
        await adminCouponApi.update(id, data);
      } else {
        await adminCouponApi.create(data);
      }
      navigate('/admin/coupons');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/coupons')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại danh sách
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm max-w-2xl"
      >
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? 'Sửa coupon' : 'Tạo coupon mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Mã coupon *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="input font-mono"
                required
                disabled={isEditing}
              />
            </div>
            <div>
              <label className="label">Tên coupon *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Loại *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="PERCENT">Giảm %</option>
                <option value="FIXED">Giảm tiền</option>
                <option value="FREE_SHIP">Free ship</option>
              </select>
            </div>
            <div>
              <label className="label">Giá trị *</label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Giảm tối đa</label>
              <input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="input"
                placeholder="Cho loại PERCENT"
              />
            </div>
            <div>
              <label className="label">Đơn tối thiểu</label>
              <input
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Ngày bắt đầu *</label>
              <input
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Ngày kết thúc *</label>
              <input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Tổng số lượng</label>
              <input
                type="number"
                value={formData.totalLimit}
                onChange={(e) => setFormData({ ...formData, totalLimit: e.target.value })}
                className="input"
                placeholder="Để trống = không giới hạn"
              />
            </div>
            <div>
              <label className="label">Mỗi người dùng</label>
              <input
                type="number"
                value={formData.perUserLimit}
                onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                className="input"
                min="1"
              />
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isPublic}
                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                className="w-4 h-4 mr-2"
              />
              Hiển thị với khách hàng
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 mr-2"
              />
              Kích hoạt
            </label>
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/admin/coupons')} className="btn-outline">
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              <FiSave className="mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CouponForm;
