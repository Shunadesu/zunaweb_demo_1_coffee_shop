import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { publicApi } from '@/api/publicApi';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await publicApi.getBlogs();
      setBlogs(response.data);
    } catch (error) {
      console.error(error);
    }
    setIsLoading(false);
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
    <div className="py-8">
      <div className="container-custom">
        <h1 className="section-title mb-8">Blog</h1>

        {/* Featured Post */}
        {blogs.find(b => b.isFeatured) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <Link to={`/blog/${blogs[0].slug}`} className="block bg-white rounded-2xl overflow-hidden shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <img
                  src={blogs[0].featuredImage?.url || 'https://via.placeholder.com/600x400'}
                  alt={blogs[0].title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="p-8 flex flex-col justify-center">
                  <span className="badge-primary mb-4 w-fit">
                    {getCategoryLabel(blogs[0].category)}
                  </span>
                  <h2 className="text-2xl font-bold mb-4">{blogs[0].title}</h2>
                  <p className="text-gray-600 mb-6">{blogs[0].excerpt}</p>
                  <div className="flex items-center text-gray-500 text-sm">
                    <FiUser className="mr-2" />
                    {blogs[0].author?.name}
                    <FiCalendar className="ml-4 mr-2" />
                    {new Date(blogs[0].publishedAt || blogs[0].createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}

        {/* Blog Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.filter(b => !b.isFeatured).map((blog, index) => (
              <motion.div
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={`/blog/${blog.slug}`} className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <img
                    src={blog.featuredImage?.url || 'https://via.placeholder.com/400x250'}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <span className="badge-primary mb-2">
                      {getCategoryLabel(blog.category)}
                    </span>
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center text-gray-400 text-sm">
                      <span>{blog.author?.name}</span>
                      <span className="mx-2">•</span>
                      <span>
                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
