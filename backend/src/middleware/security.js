const helmet = require('helmet');

// ==================== HELMET CONFIGURATION ====================

// Configure Helmet with custom settings
const helmetMiddleware = helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // For development only
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdn.jsdelivr.net",
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:",
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://images.unsplash.com",
        "https://via.placeholder.com",
      ],
      mediaSrc: ["'self'", "blob:"],
      connectSrc: [
        "'self'",
        "https://api.coffeeshop.com",
        "https://api.example.com",
      ],
      frameSrc: ["'self'", "https://www.youtube.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // Cross-Origin Resource Sharing
  crossOriginEmbedderPolicy: false,
  
  // X-Frame-Options
  frameguard: {
    action: 'sameorigin',
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Strict-Transport-Security
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },
  
  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions-Policy
  permissionsPolicy: {
    features: {
      fullscreen: ['self'],
      payment: ['self'],
      microphone: ['none'],
      camera: ['none'],
    },
  },
});

// ==================== CORS CONFIGURATION ====================

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    const whitelist = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.FRONTEND_URL_PROD || 'https://coffeeshop.com',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // React dev server
    ];
    
    // Add any additional origins from env
    if (process.env.CORS_ORIGINS) {
      whitelist.push(...process.env.CORS_ORIGINS.split(','));
    }
    
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  credentials: true,
  
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-Api-Key',
    'X-Client-Version',
  ],
  
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'X-Total-Count',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200,
};

// ==================== SECURITY HEADERS ====================

const securityHeaders = (req, res, next) => {
  // Additional security headers
  res.set({
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    
    // Remove server identification
    'Server': 'CoffeeShop-API',
    
    // Custom header to indicate API version
    'X-API-Version': '1.0.0',
  });
  
  next();
};

// ==================== INPUT SANITIZATION ====================

const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    if (!obj) return obj;
    
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS vectors
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '')
          .trim();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    }
  };
  
  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);
  
  next();
};

// ==================== REQUEST SIZE LIMIT ====================

const requestSizeLimiter = {
  // Limit JSON payload
  jsonLimit: '10kb',
  
  // Limit URL encoded payload
  urlencodedLimit: '10kb',
  
  // Limit multipart data (file uploads)
  multipartLimit: '10mb',
};

// ==================== TRUST PROXY (for rate limiting behind reverse proxy) ====================

const trustProxy = (req, res, next) => {
  // Trust first proxy (Heroku, Render, etc.)
  req.setTrustedProxy(['127.0.0.1', '::1']);
  next();
};

module.exports = {
  helmetMiddleware,
  corsOptions,
  securityHeaders,
  sanitizeInput,
  requestSizeLimiter,
  trustProxy,
};
