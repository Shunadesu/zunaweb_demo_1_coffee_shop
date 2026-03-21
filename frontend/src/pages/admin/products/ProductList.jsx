import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { adminProductApi } from '@/api/admin/productApi';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '' });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await adminProductApi.getAll(filters);
      setProducts(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleToggleAvailability = async (id, isAvailable) => {
    try {
      await adminProductApi.toggleAvailability(id, !isAvailable);
      fetchProducts();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      try {
        await adminProductApi.delete(id);
        fetchProducts();
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sản phẩm</h2>
          <p className="text-gray-500">Quản lý sản phẩm trong cửa hàng</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <FiPlus className="mr-2" />
          Thêm sản phẩm
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
                placeholder="Tìm tên sản phẩm..."
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
            <option value="available">Còn hàng</option>
            <option value="unavailable">Hết hàng</option>
            <option value="featured">Nổi bật</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giá
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={product.primaryImage || 'https://via.placeholder.com/50'}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">Đã bán: {product.soldCount || 0}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {product.category?.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-primary-600">
                      {product.basePrice?.toLocaleString()}đ
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleAvailability(product._id, product.isAvailable)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        product.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/product/${product.slug}`}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <FiEye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/products/${product._id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id)}
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

        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có sản phẩm nào</p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductList;
