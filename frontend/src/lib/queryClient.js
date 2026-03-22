import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

// Create a client
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Time before unused query data is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Time before query data is removed from cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      
      // Automatically refetch on window focus
      refetchOnWindowFocus: true,
      
      // Retry failed requests
      retry: 2,
      
      // Delay between retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on mount if data exists
      keepPreviousData: true,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

// Provider component
export const QueryProvider = ({ children }) => {
  const [queryClient] = useState(() => createQueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

// Query keys factory for consistent query key management
export const queryKeys = {
  // Products
  products: {
    all: ['products'],
    list: (filters) => ['products', 'list', filters],
    detail: (id) => ['products', 'detail', id],
    related: (id) => ['products', 'related', id],
  },
  
  // Categories
  categories: {
    all: ['categories'],
    tree: ['categories', 'tree'],
  },
  
  // Orders
  orders: {
    all: ['orders'],
    list: (filters) => ['orders', 'list', filters],
    detail: (id) => ['orders', 'detail', id],
    myOrders: ['orders', 'my'],
    tracking: (orderNumber) => ['orders', 'tracking', orderNumber],
  },
  
  // User
  user: {
    profile: ['user', 'profile'],
    wishlist: ['user', 'wishlist'],
    membership: ['user', 'membership'],
    coupons: ['user', 'coupons'],
    recentlyViewed: ['user', 'recentlyViewed'],
  },
  
  // Cart
  cart: {
    all: ['cart'],
  },
  
  // Blog
  blog: {
    all: ['blog'],
    list: (filters) => ['blog', 'list', filters],
    detail: (slug) => ['blog', 'detail', slug],
    related: (slug) => ['blog', 'related', slug],
  },
  
  // Admin
  admin: {
    dashboard: ['admin', 'dashboard'],
    stats: (type) => ['admin', 'stats', type],
    users: {
      all: ['admin', 'users'],
      list: (filters) => ['admin', 'users', 'list', filters],
      detail: (id) => ['admin', 'users', 'detail', id],
    },
    orders: {
      all: ['admin', 'orders'],
      list: (filters) => ['admin', 'orders', 'list', filters],
      detail: (id) => ['admin', 'orders', 'detail', id],
    },
    products: {
      all: ['admin', 'products'],
      list: (filters) => ['admin', 'products', 'list', filters],
      detail: (id) => ['admin', 'products', 'detail', id],
    },
    categories: ['admin', 'categories'],
    coupons: ['admin', 'coupons'],
    reviews: ['admin', 'reviews'],
  },
  
  // Public
  public: {
    search: (query) => ['public', 'search', query],
  },
};

export default QueryProvider;
