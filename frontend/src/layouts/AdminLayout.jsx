import { Outlet, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiHome,
  FiShoppingBag,
  FiPackage,
  FiGrid,
  FiUsers,
  FiGift,
  FiFileText,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiBell,
} from 'react-icons/fi';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';

const AdminLayout = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, unreadCount } = useUIStore();
  const [activeItem, setActiveItem] = useState('');

  const menuItems = [
    { icon: FiHome, label: 'Dashboard', path: '/admin' },
    { icon: FiShoppingBag, label: 'Đơn hàng', path: '/admin/orders' },
    { icon: FiPackage, label: 'Sản phẩm', path: '/admin/products' },
    { icon: FiGrid, label: 'Danh mục', path: '/admin/categories' },
    { icon: FiUsers, label: 'Khách hàng', path: '/admin/users' },
    { icon: FiGift, label: 'Coupon', path: '/admin/coupons' },
    { icon: FiFileText, label: 'Blog', path: '/admin/blog' },
    { icon: FiSettings, label: 'Cài đặt', path: '/admin/settings' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800">
          {sidebarOpen ? (
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">C</span>
              </div>
              <span className="font-heading font-semibold">Admin</span>
            </Link>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-bold">C</span>
            </div>
          )}
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-lg transition-all ${
                    isActive(item.path)
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`${sidebarOpen ? 'mr-3' : 'mx-auto'} w-5 h-5`} />
                  {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-gray-800">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mb-4"
          >
            {sidebarOpen ? <FiChevronLeft className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
          </button>

          {/* User */}
          <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            {sidebarOpen && (
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{user?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {menuItems.find(item => isActive(item.path))?.label || 'Admin'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <FiBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* View Website */}
            <Link
              to="/"
              target="_blank"
              className="btn-outline text-sm"
            >
              Xem website
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Đăng xuất"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
