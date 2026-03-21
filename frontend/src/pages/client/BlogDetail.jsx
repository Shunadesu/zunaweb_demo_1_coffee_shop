import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiUser, FiShare2, FiHeart } from 'react-icons/fi';
import { publicApi } from '@/api/publicApi';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  const fetchBlog = async () => {
    setIsLoading(true);
    try {
      const response = await publicApi.getBlogBySlug(slug);
      setBlog(response.data);
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Không tìm thấy bài viết</h1>
        <Link to="/blog" className="btn-primary">
          Quay lại blog
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container-custom max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/blog" className="text-primary-600 hover:underline mb-4 inline-block">
            ← Quay lại blog
          </Link>

          <span className="badge-primary mb-4">{getCategoryLabel(blog.category)}</span>

          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-6">{blog.title}</h1>

          <div className="flex items-center text-gray-500 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-primary-600 font-semibold">
                  {blog.author?.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">{blog.author?.name}</p>
                <p className="text-sm">
                  {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('vi-VN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center space-x-4">
              <button className="flex items-center text-gray-500 hover:text-primary-600">
                <FiHeart className="mr-1" />
                {blog.likeCount || 0}
              </button>
              <button className="flex items-center text-gray-500 hover:text-primary-600">
                <FiShare2 className="mr-1" />
                Chia sẻ
              </button>
            </div>
          </div>

          {blog.featuredImage?.url && (
            <img
              src={blog.featuredImage.url}
              alt={blog.featuredImage.alt || blog.title}
              className="w-full rounded-xl mb-8"
            />
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
              {blog.tags.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl flex items-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl font-bold text-primary-600">
                {blog.author?.name?.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-lg">{blog.author?.name}</p>
              <p className="text-gray-500">Tác giả</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogDetail;
