// Categories Page
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { adminCategoryApi } from '@/api/admin/categoryApi';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await adminCategoryApi.getAll({ includeInactive: true });
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleToggleStatus = async (id, isActive) => {
    try {
      await adminCategoryApi.toggleStatus(id, !isActive);
      fetchCategories();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
      try {
        await adminCategoryApi.delete(id);
        fetchCategories();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || 'Không thể xóa danh mục');
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Danh mục</h2>
          <p className="text-gray-500">Quản lý danh mục sản phẩm</p>
        </div>
        <Link to="/admin/categories/new" className="btn-primary">
          <FiPlus className="mr-2" />
          Thêm danh mục
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số sản phẩm
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
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <FiMoreVertical className="w-4 h-4 text-gray-400" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {category.image ? (
                        <img src={category.image} alt={category.name} className="w-10 h-10 rounded-lg object-cover mr-4" />
                      ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-primary-600 font-bold">{category.name.charAt(0)}</span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">{category.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {category.productCount || 0}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(category._id, category.isActive)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/categories/${category._id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(category._id)}
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

        {categories.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có danh mục nào</p>
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

export default CategoryList;
