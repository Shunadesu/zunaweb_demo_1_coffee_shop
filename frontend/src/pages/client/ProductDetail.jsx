import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiShoppingBag, FiStar, FiCheck, FiChevronRight, FiEdit2 } from 'react-icons/fi';
import { useProductStore } from '@/stores/productStore';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import SEO, { ProductSEO, BreadcrumbSchema } from '@/components/SEO';
import ReviewSection from '@/components/product/ReviewSection';
import ReviewForm from '@/components/product/ReviewForm';
import { DetailPageSkeleton } from '@/components/ui/Skeleton';
import Breadcrumb from '@/components/ui/Breadcrumb';
import WishlistButton from '@/components/product/WishlistButton';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentProduct, fetchProduct, isLoading } = useProductStore();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchProduct(slug);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [slug, fetchProduct]);

  useEffect(() => {
    if (currentProduct?.sizes?.length > 0) {
      setSelectedSize(currentProduct.sizes[0].name);
    }
  }, [currentProduct]);

  const handleAddToCart = () => {
    if (!currentProduct) return;
    
    addItem(
      currentProduct,
      selectedSize,
      selectedToppings,
      quantity,
      notes
    );
    
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const toggleTopping = (topping) => {
    if (selectedToppings.includes(topping)) {
      setSelectedToppings(selectedToppings.filter(t => t !== topping));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const calculatePrice = () => {
    if (!currentProduct) return 0;
    
    let price = currentProduct.basePrice;
    
    if (selectedSize && currentProduct.sizes?.length > 0) {
      const sizeObj = currentProduct.sizes.find(s => s.name === selectedSize);
      if (sizeObj) price += sizeObj.priceModifier;
    }
    
    selectedToppings.forEach(toppingName => {
      const topping = currentProduct.toppings?.find(t => t.name === toppingName);
      if (topping) price += topping.price;
    });
    
    return price * quantity;
  };

  // Show skeleton while loading
  if (isLoading || !currentProduct) {
    return (
      <>
        <SEO title="Đang tải..." noindex />
        <DetailPageSkeleton />
      </>
    );
  }

  const productUrl = `/product/${currentProduct.slug}`;

  return (
    <>
      {/* SEO */}
      <ProductSEO product={currentProduct} url={productUrl} />
      <BreadcrumbSchema 
        items={[
          { name: 'Trang chủ', url: '/' },
          { name: 'Menu', url: '/menu' },
          { name: currentProduct.category?.name || 'Sản phẩm', url: `/menu/${currentProduct.category?.slug}` },
          { name: currentProduct.name }
        ]} 
      />

      <div className="py-8">
        <div className="container-custom">
          {/* Breadcrumb */}
          <Breadcrumb 
            items={[
              { label: 'Trang chủ', href: '/' },
              { label: 'Menu', href: '/menu' },
              { label: currentProduct.category?.name || 'Sản phẩm' },
            ]} 
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6"
          >
            {/* Image */}
            <div className="relative">
              <img
                src={currentProduct.primaryImage || 'https://via.placeholder.com/500'}
                alt={currentProduct.name}
                className="w-full rounded-2xl shadow-lg"
              />
              <WishlistButton 
                productId={currentProduct._id} 
                className="absolute top-4 right-4"
              />
            </div>

            {/* Info */}
            <div>
              <h1 className="font-heading text-3xl font-bold text-gray-900 mb-2">
                {currentProduct.name}
              </h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(currentProduct.rating || 0)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">
                  {currentProduct.rating?.toFixed(1) || '0'} ({currentProduct.reviewCount || 0} đánh giá)
                </span>
                <button 
                  onClick={() => document.getElementById('reviews').scrollIntoView({ behavior: 'smooth' })}
                  className="ml-4 text-primary-600 hover:underline text-sm flex items-center"
                >
                  Xem đánh giá <FiChevronRight className="ml-1" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                {currentProduct.description || currentProduct.shortDescription}
              </p>

              <div className="text-3xl font-bold text-primary-600 mb-6">
                {currentProduct.basePrice.toLocaleString()}đ
              </div>

              {/* Sizes */}
              {currentProduct.sizes?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Kích thước</h3>
                  <div className="flex flex-wrap gap-3">
                    {currentProduct.sizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() => setSelectedSize(size.name)}
                        className={`px-6 py-3 rounded-lg border-2 transition-all ${
                          selectedSize === size.name
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-semibold">{size.name}</div>
                        <div className="text-sm text-gray-500">
                          {size.priceModifier > 0 ? '+' : ''}{size.priceModifier.toLocaleString()}đ
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Toppings */}
              {currentProduct.toppings?.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Topping</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.toppings
                      .filter(t => t.isAvailable)
                      .map((topping) => (
                        <button
                          key={topping.name}
                          onClick={() => toggleTopping(topping.name)}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            selectedToppings.includes(topping.name)
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          {topping.name}
                          {topping.price > 0 && (
                            <span className="text-sm text-gray-500 ml-1">
                              +{topping.price.toLocaleString()}đ
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Ghi chú</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Ít đường, thêm đá..."
                  className="input h-24 resize-none"
                />
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center flex-wrap gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <FiMinus className="w-5 h-5" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100 transition-colors"
                  >
                    <FiPlus className="w-5 h-5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 min-w-[200px] btn py-3 text-lg transition-all ${
                    addedToCart
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'btn-primary'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <FiCheck className="mr-2 w-5 h-5" />
                      Đã thêm vào giỏ
                    </>
                  ) : (
                    <>
                      <FiShoppingBag className="mr-2 w-5 h-5" />
                      Thêm vào giỏ - {calculatePrice().toLocaleString()}đ
                    </>
                  )}
                </button>
              </div>

              {/* Quick Info */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">📍 Giao hàng trong 30-45 phút</p>
                <p className="flex items-center gap-2">☕ Đảm bảo chất lượng cà phê</p>
                <p className="flex items-center gap-2">🔄 Đổi trả trong 24 giờ nếu có lỗi</p>
              </div>
            </div>
          </motion.div>

          {/* Reviews Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-16"
            id="reviews"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold text-gray-900">
                Đánh giá sản phẩm
              </h2>
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/login?redirect=' + encodeURIComponent(`/product/${slug}`));
                    return;
                  }
                  setShowReviewForm(true);
                }}
                className="btn btn-outline-primary flex items-center gap-2"
              >
                <FiEdit2 className="w-4 h-4" />
                Viết đánh giá
              </button>
            </div>
            <ReviewSection 
              productId={currentProduct._id} 
              productName={currentProduct.name} 
            />
          </motion.div>
        </div>
      </div>

      {/* Review Form Modal */}
      <AnimatePresence>
        {showReviewForm && (
          <ReviewForm
            productId={currentProduct._id}
            productName={currentProduct.name}
            onSuccess={() => setShowReviewForm(false)}
            onCancel={() => setShowReviewForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ProductDetail;
