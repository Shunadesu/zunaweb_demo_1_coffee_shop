import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Breadcrumb = ({ items = [], className = '' }) => {
  const location = useLocation();
  
  // Auto-generate from pathname if no items provided
  const pathItems = items.length === 0
    ? location.pathname
        .split('/')
        .filter(Boolean)
        .map((segment, index, arr) => ({
          name: formatSegment(segment),
          url: '/' + arr.slice(0, index + 1).join('/'),
        }))
    : items;

  const allItems = [
    { name: 'Trang chủ', url: '/' },
    ...pathItems,
  ];

  return (
    <nav aria-label="Breadcrumb" className={`${className}`}>
      <ol className="flex items-center flex-wrap gap-1 text-sm">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;
          const isFirst = index === 0;

          return (
            <li key={index} className="flex items-center">
              {!isFirst && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="mx-1 text-gray-400"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.span>
              )}

              {isLast ? (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-gray-600 font-medium truncate max-w-[200px]"
                  aria-current="page"
                >
                  {item.icon && <item.icon className="inline w-4 h-4 mr-1" />}
                  {item.name}
                </motion.span>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.url}
                    className="text-gray-500 hover:text-primary-600 transition-colors flex items-center"
                  >
                    {isFirst && <FiHome className="w-4 h-4 mr-1" />}
                    {item.name}
                  </Link>
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// Helper function to format URL segments
const formatSegment = (segment) => {
  // Handle IDs (ObjectId format)
  if (/^[0-9a-fA-F]{24}$/.test(segment)) {
    return 'Chi tiết';
  }
  
  // Handle numeric IDs
  if (/^\d+$/.test(segment)) {
    return 'Chi tiết';
  }

  // Convert slug/hyphenated to readable text
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Admin Breadcrumb
export const AdminBreadcrumb = ({ items = [] }) => {
  return (
    <Breadcrumb
      items={[
        { name: 'Admin', url: '/admin' },
        ...items,
      ]}
      className={className}
    />
  );
};

// With custom separator
export const BreadcrumbWithCustomSeparator = ({ 
  items = [], 
  separator = <FiChevronRight className="w-4 h-4 text-gray-400" />,
  className = '' 
}) => {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="mx-2">{separator}</span>}
              
              {isLast ? (
                <span className="text-gray-600 font-medium">
                  {item.name}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="text-gray-500 hover:text-primary-600 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
