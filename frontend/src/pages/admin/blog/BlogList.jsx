// Blog List Page
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { adminBlogApi } from '@/api/admin/blogApi';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', category: '' });

  useEffect(() => {
    fetchBlogs();
  }, [filters]);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await adminBlogApi.getAll(filters);
      setBlogs(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
  };

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      await adminBlogApi.toggleFeatured(id, !isFeatured);
      fetchBlogs();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Bạn có chắc muốn xóa bài viết này?')) {
      try {
        await adminBlogApi.delete(id);
        fetchBlogs();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PUBLISHED: 'bg-green-100 text-green-800',
      SCHEDULED: 'bg-blue-100 text-blue-800',
      ARCHIVED: 'bg-red-100 text-red-800',
    };
    return badges[status] || badges.DRAFT;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      NEWS: 'Tin tức',
      PROMOTION: 'Khuyến mãi',
      REVIEW: 'Đánh giá',
      GUIDE: 'Hướng dẫn',
      STORY: 'Câu chuyện',
      RECIPE: 'Công thức',
    };
    return labels[category] || category;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog</h2>
          <p className="text-gray-500">Quản lý bài viết</p>
        </div>
        <Link to="/admin/blog/new" className="btn-primary">
          <FiPlus className="mr-2" />
          Viết bài mới
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
                placeholder="Tìm tiêu đề..."
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
            <option value="">Tất cả trạng thái</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã đăng</option>
            <option value="SCHEDULED">Hẹn giờ</option>
          </select>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bài viết
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Danh mục
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {blogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={blog.featuredImage?.url || 'https://via.placeholder.com/60'}
                        alt={blog.title}
                        className="w-12 h-12 rounded-lg object-cover mr-4"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{blog.title}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge-primary">{getCategoryLabel(blog.category)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(blog.status)}`}>
                      {blog.status === 'PUBLISHED' ? 'Đã đăng' : blog.status === 'DRAFT' ? 'Nháp' : 'Hẹn giờ'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {blog.viewCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleFeatured(blog._id, blog.isFeatured)}
                        className={`p-2 ${blog.isFeatured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                      >
                        <FiStar className={`w-4 h-4 ${blog.isFeatured ? 'fill-current' : ''}`} />
                      </button>
                      <Link
                        to={`/admin/blog/${blog._id}/edit`}
                        className="p-2 text-gray-400 hover:text-primary-600"
                      >
                        <FiEdit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(blog._id)}
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

        {blogs.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có bài viết nào</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
