import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiCoffee, FiShoppingCart, FiClipboardList, FiUser } from 'react-icons/fi';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

const BottomNav = () => {
  const location = useLocation();
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { 
      path: '/', 
      icon: FiHome, 
      label: 'Trang chủ',
      show: true
    },
    { 
      path: '/menu', 
      icon: FiCoffee, 
      label: 'Menu',
      show: true
    },
    { 
      path: '/cart', 
      icon: FiShoppingCart, 
      label: 'Giỏ hàng', 
      badge: cartCount,
      show: isAuthenticated
    },
    { 
      path: '/orders', 
      icon: FiClipboardList, 
      label: 'Đơn hàng',
      show: isAuthenticated
    },
    { 
      path: '/profile', 
      icon: FiUser, 
      label: 'Tài khoản',
      show: true
    },
  ];

  const visibleItems = navItems.filter(item => item.show);

  return (
    <>
      {/* Desktop Spacer */}
      <div className="hidden md:block h-16" />
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-inset-bottom">
        <div className="flex justify-around items-center h-16 px-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[64px] py-2 px-3
                  transition-colors duration-200
                  ${isActive 
                    ? 'text-primary-600' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" />
                  {item.badge > 0 && (
                    <AnimatePresence>
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="
                          absolute -top-1.5 -right-1.5
                          min-w-[18px] h-[18px]
                          flex items-center justify-center
                          bg-red-500 text-white
                          text-xs font-bold
                          rounded-full
                          px-1
                        "
                      >
                        {item.badge > 99 ? '99+' : item.badge}
                      </motion.span>
                    </AnimatePresence>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">
                  {item.label}
                </span>
                
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -top-0.5 w-8 h-1 bg-primary-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
