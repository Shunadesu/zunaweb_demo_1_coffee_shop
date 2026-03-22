import { useEffect, useRef } from 'react';

// Google Analytics 4 tracking
export const trackPageView = (url, title) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX', {
      page_path: url,
      page_title: title,
    });
  }
};

export const trackEvent = (action, category, label, value = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Specific tracking functions
export const trackAddToCart = (product, quantity = 1) => {
  trackEvent('add_to_cart', 'Ecommerce', product.name, product.price * quantity);
};

export const trackRemoveFromCart = (product) => {
  trackEvent('remove_from_cart', 'Ecommerce', product.name, product.price);
};

export const trackViewProduct = (product) => {
  trackEvent('view_item', 'Ecommerce', product.name);
};

export const trackCheckout = (cart, step = 1) => {
  trackEvent('begin_checkout', 'Ecommerce', `Step ${step}`);
};

export const trackPurchase = (order) => {
  trackEvent('purchase', 'Ecommerce', order.orderNumber, order.total);
};

export const trackSearch = (searchTerm) => {
  trackEvent('search', 'Site Search', searchTerm);
};

export const trackSignUp = (method = 'email') => {
  trackEvent('sign_up', 'User', method);
};

export const trackLogin = (method = 'email') => {
  trackEvent('login', 'User', method);
};

export const trackShare = (contentType, productId) => {
  trackEvent('share', 'Social', `${contentType}_${productId}`);
};

export const trackError = (errorType, errorMessage) => {
  trackEvent('error', 'Error', errorType);
  console.error(`[Analytics] Error tracked: ${errorType} - ${errorMessage}`);
};

// Hook for page views
export const usePageView = () => {
  useEffect(() => {
    const pathname = window.location.pathname;
    const title = document.title;
    trackPageView(pathname, title);
  }, []);
};

// Hook for tracking errors
export const useErrorTracking = () => {
  useEffect(() => {
    const handleError = (event) => {
      trackError('javascript_error', event.error?.message || 'Unknown error');
    };

    const handleUnhandledRejection = (event) => {
      trackError('unhandled_promise', event.reason?.message || 'Unknown rejection');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);
};

// Analytics Provider
export const AnalyticsProvider = ({ children }) => {
  // Initialize GA
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX'}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', import.meta.env.VITE_GA_ID || 'G-XXXXXXXXXX');

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Track page views
  usePageView();

  // Track errors
  useErrorTracking();

  return children;
};

// User identification
export const identifyUser = (userId, userProperties = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('identify', userId, userProperties);
  }
};

export const trackUserProperties = (properties) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

export default {
  trackPageView,
  trackEvent,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewProduct,
  trackCheckout,
  trackPurchase,
  trackSearch,
  trackSignUp,
  trackLogin,
  trackShare,
  trackError,
  usePageView,
  useErrorTracking,
  AnalyticsProvider,
  identifyUser,
  trackUserProperties,
};
