import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { adminProductApi } from '@/api/admin/productApi';
import { adminCategoryApi } from '@/api/admin/categoryApi';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    basePrice: '',
    description: '',
    shortDescription: '',
    isAvailable: true,
    isFeatured: false,
    sizes: [],
    toppings: [],
  });

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchProduct();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await adminCategoryApi.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await adminProductApi.getById(id);
      const product = response.data;
      setFormData({
        name: product.name,
        category: product.category?._id,
        basePrice: product.basePrice,
        description: product.description,
        shortDescription: product.shortDescription,
        isAvailable: product.isAvailable,
        isFeatured: product.isFeatured,
        sizes: product.sizes || [],
        toppings: product.toppings || [],
      });
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
      };
      
      if (isEditing) {
        await adminProductApi.update(id, data);
      } else {
        await adminProductApi.create(data);
      }
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/products')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại danh sách
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm max-w-4xl"
      >
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Tên sản phẩm *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">Danh mục *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Giá cơ bản *</label>
              <input
                type="number"
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="input"
                required
              />
            </div>
            <div className="flex items-center space-x-6 pt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4 mr-2"
                />
                Còn hàng
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 mr-2"
                />
                Sản phẩm nổi bật
              </label>
            </div>
          </div>

          <div>
            <label className="label">Mô tả ngắn</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="label">Mô tả chi tiết</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input h-32 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="btn-outline"
            >
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

export default ProductForm;
