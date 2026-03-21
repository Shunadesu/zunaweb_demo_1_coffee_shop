// Category Form Page
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { adminCategoryApi } from '@/api/admin/categoryApi';

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    description: '',
    isActive: true,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isEditing) {
        await adminCategoryApi.update(id, formData);
      } else {
        await adminCategoryApi.create(formData);
      }
      navigate('/admin/categories');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/categories')}
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
          {isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Tên danh mục *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="label">Slug</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="input"
              placeholder="tu-dong-tao-neu-trong"
            />
          </div>

          <div>
            <label className="label">Hình ảnh (URL)</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="label">Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input h-24 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => navigate('/admin/categories')} className="btn-outline">
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

export default CategoryForm;
