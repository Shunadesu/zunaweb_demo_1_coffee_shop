import { forwardRef } from 'react';

const Skeleton = forwardRef(({
  variant = 'text',
  width,
  height,
  className = '',
  count = 1,
  ...props
}, ref) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'rounded-full',
    thumbnail: 'w-full h-48 rounded-lg',
    card: 'w-full h-64 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
    badge: 'h-6 w-16 rounded-full',
  };

  const sizeClasses = variants[variant] || variants.text;

  if (count === 1) {
    return (
      <div
        ref={ref}
        className={`${baseClasses} ${sizeClasses} ${className}`}
        style={{ width, height }}
        {...props}
      />
    );
  }

  return (
    <div ref={ref} className={`space-y-2 ${className}`} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${baseClasses} ${sizeClasses}`}
          style={{ width, height }}
        />
      ))}
    </div>
  );
});

Skeleton.displayName = 'Skeleton';

export default Skeleton;

// Preset Skeleton Components
export const ProductCardSkeleton = ({ className = '' }) => (
  <div className={`card overflow-hidden ${className}`}>
    <Skeleton variant="thumbnail" />
    <div className="p-4 space-y-3">
      <Skeleton variant="title" />
      <Skeleton variant="text" width="60%" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton width={80} height={24} className="rounded" />
        <Skeleton width={50} height={16} className="rounded" />
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
);

export const BlogCardSkeleton = ({ className = '' }) => (
  <div className={`card overflow-hidden ${className}`}>
    <Skeleton variant="thumbnail" className="h-48" />
    <div className="p-4 space-y-3">
      <div className="flex gap-2">
        <Skeleton width={60} height={20} className="rounded-full" />
        <Skeleton width={80} height={20} className="rounded-full" />
      </div>
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" width="80%" />
      <div className="flex items-center gap-3 pt-2">
        <Skeleton variant="avatar" width={32} height={32} className="rounded-full" />
        <Skeleton width={100} height={14} className="rounded" />
      </div>
    </div>
  </div>
);

export const BlogGridSkeleton = ({ count = 6, className = '' }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <BlogCardSkeleton key={i} />
    ))}
  </div>
);

export const OrderCardSkeleton = ({ className = '' }) => (
  <div className={`card p-4 ${className}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="space-y-2">
        <Skeleton width={120} height={20} className="rounded" />
        <Skeleton width={80} height={14} className="rounded" />
      </div>
      <Skeleton width={80} height={28} className="rounded-full" />
    </div>
    <div className="space-y-2 mb-4">
      {[1, 2].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton width={48} height={48} className="rounded-lg" />
          <div className="flex-1 space-y-1">
            <Skeleton width="70%" height={14} className="rounded" />
            <Skeleton width="40%" height={12} className="rounded" />
          </div>
        </div>
      ))}
    </div>
    <div className="border-t pt-4 flex justify-between items-center">
      <Skeleton width={100} height={16} className="rounded" />
      <Skeleton width={80} height={24} className="rounded" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton
          variant="text"
          width={i === 0 ? '80%' : i === columns - 1 ? '60%' : '70%'}
          height={16}
        />
      </td>
    ))}
  </tr>
);

export const ProfileSkeleton = ({ className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <div className="flex items-center gap-4 mb-6">
      <Skeleton variant="avatar" width={80} height={80} />
      <div className="space-y-2">
        <Skeleton width={150} height={24} className="rounded" />
        <Skeleton width={100} height={16} className="rounded" />
      </div>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton width={80} height={12} className="rounded" />
            <Skeleton width="100%" height={40} className="rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const DashboardStatsSkeleton = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton width={100} height={14} className="rounded" />
            <Skeleton width={80} height={32} className="rounded" />
            <Skeleton width={120} height={12} className="rounded" />
          </div>
          <Skeleton width={48} height={48} className="rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

export const ChartSkeleton = ({ className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <div className="flex justify-between items-center mb-6">
      <Skeleton width={150} height={20} className="rounded" />
      <Skeleton width={120} height={32} className="rounded-lg" />
    </div>
    <Skeleton width="100%" height={300} className="rounded-lg" />
  </div>
);

export const DetailPageSkeleton = ({ className = '' }) => (
  <div className={`container py-8 ${className}`}>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton variant="thumbnail" className="h-96 rounded-xl" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((_, i) => (
            <Skeleton key={i} height={80} className="rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton variant="title" />
        <div className="flex gap-2">
          <Skeleton width={60} height={24} className="rounded-full" />
          <Skeleton width={80} height={24} className="rounded-full" />
        </div>
        <Skeleton height={32} className="rounded" />
        <Skeleton count={4} height={16} className="rounded" />
        <div className="space-y-2 pt-4">
          <Skeleton height={44} className="rounded-lg" />
          <Skeleton height={44} className="rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);
