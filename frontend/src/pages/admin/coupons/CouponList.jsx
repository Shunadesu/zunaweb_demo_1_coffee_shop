// Coupon List Page
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { adminCouponApi } from '@/api/admin/couponApi';

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });

  useEffect(() => {
    fetchCoupons();
  }, [filters]);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await adminCouponApi.getAll(filters);
      setCoupons(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await adminCouponApi.toggleStatus(id, !isActive);
      fetchCoupons();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa coupon này?')) {
      try {
        await adminCouponApi.delete(id);
        fetchCoupons();
      } catch (error) {
        console.error(error);
        alert('Không thể xóa coupon đã có người sử dụng');
      }
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      PERCENT: 'Giảm %',
      FIXED: 'Giảm tiền',
      FREE_ITEM: 'Tặng quà',
      FREE_SHIP: 'Free ship',
    };
    return types[type] || type;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupon</h2>
          <p className="text-gray-500">Quản lý mã giảm giá</p>
        </div>
        <Link to="/admin/coupons/new" className="btn-primary">
          <FiPlus className="mr-2" />
          Tạo coupon
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm mã, tên coupon..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="input w-auto"
          >
            <option value="">Tất cả</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá trị
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đã dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạn sử dụng
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium font-mono">{coupon.code}</p>
                      <p className="text-sm text-gray-500">{coupon.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge-primary">{getTypeLabel(coupon.type)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary-600">
                      {coupon.type === 'PERCENT' ? `${coupon.discountValue}%` : `${coupon.discountValue.toLocaleString()}đ`}
                    </span>
                    {coupon.maxDiscount && (
                      <p className="text-xs text-gray-500">Tối đa {coupon.maxDiscount.toLocaleString()}đ</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {coupon.usedCount}{coupon.totalLimit ? `/${coupon.totalLimit}` : ''}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(coupon.validUntil).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/coupons/${coupon._id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(coupon._id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {coupons.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có coupon nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponList;
