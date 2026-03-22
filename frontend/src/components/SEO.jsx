import { Helmet } from 'react-helmet-async';

const SEO = ({
  title,
  description = 'Coffee Shop - Đặt hàng cà phê trực tuyến',
  image = '/og-image.jpg',
  url = '',
  type = 'website',
  article = null,
  noindex = false,
}) => {
  const fullTitle = title ? `${title} | Coffee Shop` : 'Coffee Shop - Đặt hàng cà phê trực tuyến';
  const canonicalUrl = url ? `${import.meta.env.VITE_APP_URL || ''}${url}` : import.meta.env.VITE_APP_URL;

  return (
    <Helmet>
      {/* Basic */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="Coffee Shop" />
      <meta property="og:locale" content="vi_VN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Article specific (for blog posts) */}
      {article && (
        <>
          <meta property="article:published_time" content={article.publishedTime} />
          <meta property="article:author" content={article.author} />
          {article.tags && article.tags.map((tag, i) => (
            <meta key={i} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    </Helmet>
  );
};

// SEO Component for Products (with Schema.org)
export const ProductSEO = ({ product, url }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.primaryImage || product.images?.[0]?.url,
    offers: {
      '@type': 'Offer',
      price: product.basePrice || product.price,
      priceCurrency: 'VND',
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 0,
      },
    }),
  };

  return (
    <Helmet>
      <title>{product.name} | Coffee Shop</title>
      <meta name="description" content={product.description?.slice(0, 160) || `Mua ${product.name} tại Coffee Shop`} />
      <link rel="canonical" href={`${import.meta.env.VITE_APP_URL || ''}${url}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={product.name} />
      <meta property="og:description" content={product.description?.slice(0, 160)} />
      <meta property="og:image" content={product.primaryImage || product.images?.[0]?.url} />
      <meta property="og:url" content={`${import.meta.env.VITE_APP_URL || ''}${url}`} />
      <meta property="product:price:amount" content={product.basePrice || product.price} />
      <meta property="product:price:currency" content="VND" />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// SEO Component for Blog Posts
export const BlogSEO = ({ post, url }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.content?.slice(0, 160),
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'Coffee Shop',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Coffee Shop',
      logo: {
        '@type': 'ImageObject',
        url: '/logo.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
  };

  return (
    <Helmet>
      <title>{post.title} | Coffee Shop Blog</title>
      <meta name="description" content={post.excerpt || post.content?.slice(0, 160)} />
      <link rel="canonical" href={`${import.meta.env.VITE_APP_URL || ''}${url}`} />
      
      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.excerpt || post.content?.slice(0, 160)} />
      <meta property="og:image" content={post.featuredImage} />
      <meta property="og:url" content={`${import.meta.env.VITE_APP_URL || ''}${url}`} />
      <meta property="article:published_time" content={post.publishedAt} />
      <meta property="article:author" content={post.author?.name || 'Coffee Shop'} />
      
      {/* JSON-LD Schema */}
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Breadcrumb Schema for SEO
export const BreadcrumbSchema = ({ items }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && {
        item: `${import.meta.env.VITE_APP_URL || ''}${item.url}`,
      }),
    })),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SEO;
