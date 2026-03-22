import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiChevronDown } from 'react-icons/fi';
import { useDebounce } from '../../hooks/useDebounce';
import { publicApi } from '../../api/publicApi';
import { ProductGridSkeleton } from '../ui/Skeleton';

const ProductSearch = ({
  onProductClick,
  placeholder = 'Tìm kiếm sản phẩm...',
  showFilters = true,
  initialFilters = {},
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    minPrice: 0,
    maxPrice: 200000,
    rating: null,
    sortBy: 'popular',
    ...initialFilters,
  });

  const debouncedQuery = useDebounce(query, 300);

  // Fetch products based on search and filters
  const { data, isLoading, error } = useQuery({
    queryKey: ['products', 'search', debouncedQuery, filters],
    queryFn: () => publicApi.searchProducts({
      q: debouncedQuery,
      ...filters,
    }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const products = data?.data?.products || [];

  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      category: [],
      minPrice: 0,
      maxPrice: 200000,
      rating: null,
      sortBy: 'popular',
    });
    setQuery('');
  }, []);

  const removeCategory = useCallback((catId) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.filter(id => id !== catId),
    }));
  }, []);

  const activeFiltersCount = [
    filters.category.length > 0,
    filters.minPrice > 0,
    filters.maxPrice < 200000,
    filters.rating !== null,
  ].filter(Boolean).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <FiX className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {showFilters && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`
              relative px-4 py-3 border rounded-lg transition-colors
              ${showFilters 
                ? 'bg-primary-50 border-primary-500 text-primary-600' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}
            `}
          >
            <FiFilter className="w-5 h-5" />
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sắp xếp theo
                </label>
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full pl-3 pr-10 py-2 border border-gray-200 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="popular">Phổ biến nhất</option>
                    <option value="newest">Mới nhất</option>
                    <option value="price_asc">Giá: Thấp đến cao</option>
                    <option value="price_desc">Giá: Cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoảng giá
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', Number(e.target.value))}
                    placeholder="Từ"
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                    placeholder="Đến"
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={200000}
                  step={10000}
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', Number(e.target.value))}
                  className="w-full mt-2 accent-primary-600"
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đánh giá
                </label>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleFilterChange('rating', filters.rating === rating ? null : rating)}
                      className={`
                        px-3 py-1 rounded-full text-sm border transition-colors
                        ${filters.rating === rating 
                          ? 'bg-primary-600 text-white border-primary-600' 
                          : 'border-gray-200 hover:border-primary-300'}
                      `}
                    >
                      {rating}+ ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Tags */}
      <AnimatePresence>
        {filters.category.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.category.map((catId) => (
              <motion.span
                key={catId}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {catId}
                <button onClick={() => removeCategory(catId)} className="hover:text-primary-900">
                  <FiX className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <div className="mt-4">
        {isLoading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <div className="text-center py-8 text-gray-500">
            Đã xảy ra lỗi khi tải sản phẩm
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy sản phẩm nào</p>
            <button
              onClick={clearFilters}
              className="mt-2 text-primary-600 hover:text-primary-700"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Tìm thấy {products.length} sản phẩm
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;
