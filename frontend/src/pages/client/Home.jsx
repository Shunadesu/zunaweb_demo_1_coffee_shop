import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCoffee, FiStar, FiTrendingUp } from 'react-icons/fi';
import { useProductStore } from '@/stores/productStore';
import { useEffect } from 'react';
import ProductCard from '@/components/product/ProductCard';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Home = () => {
  const { categories, featuredProducts, bestSellers, fetchCategories, fetchFeaturedProducts } = useProductStore();

  useEffect(() => {
    fetchCategories();
    fetchFeaturedProducts();
  }, [fetchCategories, fetchFeaturedProducts]);

  const features = [
    {
      icon: FiCoffee,
      title: 'Cà phê đặc sản',
      description: 'Hạt cà phê rang mộc 100%',
    },
    {
      icon: FiStar,
      title: 'Chất lượng hàng đầu',
      description: 'Đảm bảo vệ sinh an toàn thực phẩm',
    },
    {
      icon: FiTrendingUp,
      title: 'Giao hàng nhanh',
      description: 'Giao trong 30 phút',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-700 to-secondary-700 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-60 h-60 bg-white rounded-full"></div>
        </div>
        
        <div className="container-custom relative">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-2xl"
          >
            <motion.h1
              variants={item}
              className="font-heading text-4xl md:text-6xl font-bold mb-6"
            >
              Thưởng thức{' '}
              <span className="text-accent-400">cà phê</span>{' '}
              ngay tại nhà
            </motion.h1>
            <motion.p
              variants={item}
              className="text-lg md:text-xl text-primary-100 mb-8"
            >
              Đặt hàng online, giao tận nơi trong 30 phút.
              Cà phê nguyên chất, giá cả hợp lý.
            </motion.p>
            <motion.div variants={item} className="flex flex-wrap gap-4">
              <Link to="/menu" className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3">
                Xem Menu
                <FiArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/register" className="btn border-2 border-white text-white hover:bg-white/10 px-8 py-3">
                Đăng ký ngay
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="text-center p-6 rounded-xl hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Danh mục</h2>
            <Link to="/menu" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
          >
            {categories.slice(0, 6).map((category) => (
              <motion.div key={category._id} variants={item}>
                <Link
                  to={`/menu/${category.slug}`}
                  className="block bg-white rounded-xl p-4 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    {category.image ? (
                      <img src={category.image} alt={category.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <FiCoffee className="w-8 h-8 text-primary-600" />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.productCount} sản phẩm</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Bán chạy nhất</h2>
            <Link to="/menu?sort=popular" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {bestSellers.slice(0, 4).map((product) => (
              <motion.div key={product._id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Nổi bật</h2>
            <Link to="/menu?filter=featured" className="text-primary-600 hover:text-primary-700 font-medium">
              Xem tất cả →
            </Link>
          </div>
          
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {featuredProducts.slice(0, 4).map((product) => (
              <motion.div key={product._id} variants={item}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-secondary-700 text-white">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Tham gia chương trình thành viên
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              Tích điểm mỗi lần mua hàng, đổi quà hấp dẫn. Càng mua nhiều, hưởng nhiều ưu đãi.
            </p>
            <Link
              to="/register"
              className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3"
            >
              Đăng ký miễn phí
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
