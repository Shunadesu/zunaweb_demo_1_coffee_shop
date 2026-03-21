import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show nothing while loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
