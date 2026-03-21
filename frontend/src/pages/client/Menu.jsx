import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { FiGrid, FiList, FiSearch, FiFilter, FiStar } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useProductStore } from '@/stores/productStore';

const Menu = () => {
  const { categorySlug } = useParams();
  const {
    products,
    categories,
    isLoading,
    filters,
    pagination,
    fetchProducts,
    fetchCategories,
    setFilters,
    setPage,
  } = useProductStore();

  const [viewMode, setViewMode] = useState('grid');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    if (categorySlug) {
      const category = categories.find(c => c.slug === categorySlug);
      if (category) {
        setFilters({ category: category._id });
      }
    }
  }, [categorySlug, categories, setFilters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ search: searchValue });
  };

  return (
    <div className="py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title mb-2">Menu</h1>
          <p className="text-gray-600">
            Khám phá các loại thức uống đa dạng của chúng tôi
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            {/* Categories */}
            <div className="bg-white rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Danh mục</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setFilters({ category: '' })}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !filters.category
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    Tất cả
                  </button>
                </li>
                {categories.map((category) => (
                  <li key={category._id}>
                    <button
                      onClick={() => setFilters({ category: category._id })}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        filters.category === category._id
                          ? 'bg-primary-100 text-primary-700 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort */}
            <div className="bg-white rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Sắp xếp</h3>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ sort: e.target.value })}
                className="input"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="name">Tên A-Z</option>
                <option value="price_asc">Giá thấp → cao</option>
                <option value="price_desc">Giá cao → thấp</option>
                <option value="popular">Bán chạy</option>
                <option value="rating">Đánh giá cao</option>
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search & View Mode */}
            <div className="bg-white rounded-xl p-4 mb-6 flex items-center justify-between">
              <form onSubmit={handleSearch} className="flex-1 max-w-md">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </form>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-100 text-primary-600'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <FiList className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Products Grid/List */}
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
              </div>
            ) : (
              <>
                <motion.div
                  variants={viewMode === 'grid' 
                    ? { show: { transition: { staggerChildren: 0.05 } } 
                    : {}}
                  initial="hidden"
                  animate="show"
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                      : 'space-y-4'
                  }
                >
                  {products.map((product) => (
                    <motion.div
                      key={product._id}
                      variants={viewMode === 'grid' ? {
                        hidden: { opacity: 0, y: 20 },
                        show: { opacity: 1, y: 0 }
                      } : {}}
                    >
                      <Link
                        to={`/product/${product.slug}`}
                        className={`bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all ${
                          viewMode === 'list' ? 'flex' : ''
                        }`}
                      >
                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                          <img
                            src={product.primaryImage || 'https://via.placeholder.com/300'}
                            alt={product.name}
                            className={`object-cover ${
                              viewMode === 'list' 
                                ? 'w-full h-full' 
                                : 'w-full h-48'
                            }`}
                          />
                          {product.isFeatured && (
                            <span className="absolute top-2 left-2 badge-primary">
                              Nổi bật
                            </span>
                          )}
                          {product.isBestSeller && (
                            <span className="absolute top-2 left-2 badge-warning">
                              Bán chạy
                            </span>
                          )}
                        </div>
                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex items-center' : ''}`}>
                          <div className={viewMode === 'list' ? 'flex-1' : ''}>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {product.category?.name}
                            </p>
                            {product.rating > 0 && (
                              <div className="flex items-center mb-2">
                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {product.rating.toFixed(1)}
                                </span>
                                <span className="text-sm text-gray-400 ml-1">
                                  ({product.reviewCount})
                                </span>
                              </div>
                            )}
                          </div>
                          <div className={viewMode === 'list' ? '' : 'mt-3'}>
                            <span className="text-lg font-bold text-primary-600">
                              {product.basePrice.toLocaleString()}đ
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                      >
                        Trước
                      </button>
                      {[...Array(pagination.totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`px-4 py-2 rounded-lg ${
                            pagination.page === i + 1
                              ? 'bg-primary-600 text-white'
                              : 'border hover:bg-gray-50'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="px-4 py-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
