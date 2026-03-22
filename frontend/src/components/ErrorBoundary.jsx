import { Component } from 'react';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log error to monitoring service (e.g., Sentry)
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, onReset } = this.props;
      const { error, errorInfo } = this.state;

      // Custom fallback provided
      if (fallback) {
        return fallback({
          error,
          errorInfo,
          resetError: onReset || this.handleReset,
        });
      }

      // Default fallback UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center"
          >
            {/* Error Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center"
            >
              <FiAlertTriangle className="w-10 h-10 text-red-500" />
            </motion.div>

            {/* Error Title */}
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Đã xảy ra lỗi
            </h2>

            {/* Error Message */}
            <p className="text-gray-600 mb-6">
              {import.meta.env.DEV && error?.message
                ? error.message
                : 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.'}
            </p>

            {/* Stack Trace (Dev only) */}
            {import.meta.env.DEV && errorInfo && (
              <details className="text-left mb-6 p-4 bg-gray-50 rounded-lg text-xs overflow-auto max-h-40">
                <summary className="font-medium text-gray-700 cursor-pointer">
                  Chi tiết lỗi
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-red-600">
                  {error?.componentStack || errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                <FiRefreshCw className="w-4 h-4" />
                Thử lại
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper with hooks
export const withErrorBoundary = (Component, fallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Async Error Handler Hook
export const useErrorHandler = () => {
  const [error, setError] = useState(null);

  const handleError = (err) => {
    setError(err);
    
    // Log to monitoring
    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(err);
    }
    
    console.error('Error:', err);
  };

  const clearError = () => setError(null);

  return { error, handleError, clearError };
};

export default ErrorBoundary;
