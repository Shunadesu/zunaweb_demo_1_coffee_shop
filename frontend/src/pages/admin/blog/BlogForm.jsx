// Blog Form Page
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { adminBlogApi } from '@/api/admin/blogApi';

const BlogForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'NEWS',
    content: '',
    excerpt: '',
    featuredImage: { url: '', alt: '' },
    tags: [],
    status: 'DRAFT',
    isFeatured: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = {
        ...formData,
        tags: formData.tags.filter(t => t.trim()),
      };

      if (isEditing) {
        await adminBlogApi.update(id, data);
      } else {
        await adminBlogApi.create(data);
      }
      navigate('/admin/blog');
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra');
    }
    setIsLoading(false);
  };

  return (
    <div>
      <button
        onClick={() => navigate('/admin/blog')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Quay lại danh sách
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-sm"
      >
        <h2 className="text-xl font-bold mb-6">
          {isEditing ? 'Sửa bài viết' : 'Viết bài mới'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Tiêu đề *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">Danh mục *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="NEWS">Tin tức</option>
                <option value="PROMOTION">Khuyến mãi</option>
                <option value="REVIEW">Đánh giá</option>
                <option value="GUIDE">Hướng dẫn</option>
                <option value="STORY">Câu chuyện</option>
                <option value="RECIPE">Công thức</option>
              </select>
            </div>
            <div>
              <label className="label">Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                <option value="DRAFT">Nháp</option>
                <option value="PUBLISHED">Đăng ngay</option>
                <option value="SCHEDULED">Hẹn giờ đăng</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Mô tả ngắn</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="input h-24 resize-none"
            />
          </div>

          <div>
            <label className="label">Nội dung *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="input h-64 resize-none font-mono text-sm"
              required
            />
          </div>

          <div>
            <label className="label">Tags (phân cách bằng dấu phẩy)</label>
            <input
              type="text"
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                tags: e.target.value.split(',').map(t => t.trim()) 
              })}
              className="input"
              placeholder="cà phê, rang xay, hướng dẫn"
            />
          </div>

          <div>
            <label className="label">Hình ảnh đại diện (URL)</label>
            <input
              type="url"
              value={formData.featuredImage.url}
              onChange={(e) => setFormData({ 
                ...formData, 
                featuredImage: { ...formData.featuredImage, url: e.target.value } 
              })}
              className="input"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 mr-2"
              />
              Bài viết nổi bật
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button type="button" onClick={() => navigate('/admin/blog')} className="btn-outline">
              Hủy
            </button>
            <button type="submit" className="btn-primary" disabled={isLoading}>
              <FiSave className="mr-2" />
              {isLoading ? 'Đang lưu...' : 'Lưu bài viết'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default BlogForm;
