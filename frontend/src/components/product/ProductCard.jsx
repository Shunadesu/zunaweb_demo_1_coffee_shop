const ProductCard = ({ product }) => {
  return (
    <div className="card group hover:shadow-xl transition-all duration-300">
      <div className="relative overflow-hidden">
        <img
          src={product.primaryImage || product.images?.[0]?.url || 'https://via.placeholder.com/300x200'}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          {product.category?.name || 'Cà phê'}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary-600">
            {product.basePrice?.toLocaleString()}đ
          </span>
          {product.rating > 0 && (
            <span className="text-sm text-gray-500">
              ★ {product.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
