import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { HelmetProvider } from 'react-helmet-async';

// Layouts
import ClientLayout from '@/layouts/ClientLayout';
import AdminLayout from '@/layouts/AdminLayout';
import AuthLayout from '@/layouts/AuthLayout';

// Client Pages
import Home from '@/pages/client/Home';
import Menu from '@/pages/client/Menu';
import ProductDetail from '@/pages/client/ProductDetail';
import Cart from '@/pages/client/Cart';
import Checkout from '@/pages/client/Checkout';
import OrderSuccess from '@/pages/client/OrderSuccess';
import OrderTracking from '@/pages/client/OrderTracking';
import Login from '@/pages/client/Login';
import Register from '@/pages/client/Register';
import Profile from '@/pages/client/Profile';
import OrderHistory from '@/pages/client/OrderHistory';
import Membership from '@/pages/client/Membership';
import Coupons from '@/pages/client/Coupons';
import BlogList from '@/pages/client/BlogList';
import BlogDetail from '@/pages/client/BlogDetail';
import Wishlist from '@/pages/client/Wishlist';

// Admin Pages
import Dashboard from '@/pages/admin/Dashboard';
import AdminOrders from '@/pages/admin/orders/OrderList';
import AdminOrderDetail from '@/pages/admin/orders/OrderDetail';
import AdminProducts from '@/pages/admin/products/ProductList';
import AdminProductForm from '@/pages/admin/products/ProductForm';
import AdminCategories from '@/pages/admin/categories/CategoryList';
import AdminCategoryForm from '@/pages/admin/categories/CategoryForm';
import AdminUsers from '@/pages/admin/users/UserList';
import AdminUserDetail from '@/pages/admin/users/UserDetail';
import AdminCoupons from '@/pages/admin/coupons/CouponList';
import AdminCouponForm from '@/pages/admin/coupons/CouponForm';
import AdminBlog from '@/pages/admin/blog/BlogList';
import AdminBlogForm from '@/pages/admin/blog/BlogForm';
import AdminSettings from '@/pages/admin/Settings';
import AdminReviews from '@/pages/admin/reviews/ReviewList';

// Protected Routes
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';

// Hooks
import { useAuthStore } from '@/stores/authStore';

// Toast Notifications
import Toast from '@/components/ui/Toast';
import { useUIStore } from '@/stores/uiStore';

function App() {
  const { isAuthenticated, user, fetchProfile } = useAuthStore();
  const { toasts } = useUIStore();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchProfile();
    }
  }, [fetchProfile]);

  return (
    <HelmetProvider>
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Public Client Routes */}
          <Route element={<ClientLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/menu/:categorySlug" element={<Menu />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            
            {/* Protected Client Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/wishlist" element={<Wishlist />} />
            </Route>
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route element={<AdminRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="orders/:id" element={<AdminOrderDetail />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="products/new" element={<AdminProductForm />} />
              <Route path="products/:id/edit" element={<AdminProductForm />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="categories/new" element={<AdminCategoryForm />} />
              <Route path="categories/:id/edit" element={<AdminCategoryForm />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:id" element={<AdminUserDetail />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="coupons/new" element={<AdminCouponForm />} />
              <Route path="coupons/:id/edit" element={<AdminCouponForm />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="blog/new" element={<AdminBlogForm />} />
              <Route path="blog/:id/edit" element={<AdminBlogForm />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
