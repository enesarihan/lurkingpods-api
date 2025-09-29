import { Request, Response, NextFunction } from 'express';

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:8080',
      'http://localhost:8081',
      'https://lurkingpods.com',
      'https://www.lurkingpods.com',
      'https://api.lurkingpods.com',
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-User-ID',
    'X-API-Key',
  ],
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Set security headers
  res.set({
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // Enable XSS filtering
    'X-XSS-Protection': '1; mode=block',
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Strict Transport Security (HTTPS only)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.supabase.co https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
    ].join(', '),
    
    // Cache Control for API responses
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  
  next();
};

// API key validation middleware
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  const validApiKey = process.env.API_KEY;
  
  // Skip API key validation for certain routes
  const skipRoutes = ['/health', '/auth/login', '/auth/register', '/admin/debug'];
  const shouldSkip = skipRoutes.some(route => req.path.startsWith(route));
  if (shouldSkip) {
    return next();
  }
  
  if (!apiKey) {
    res.status(401).json({ error: 'API key required' });
    return;
  }
  
  if (!validApiKey || apiKey !== validApiKey) {
    res.status(401).json({ error: 'Invalid API key' });
    return;
  }
  
  next();
};

// Request size limiter
export const requestSizeLimiter = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (contentLength > maxSize) {
    res.status(413).json({ error: 'Request entity too large' });
    return;
  }
  
  next();
};

// IP whitelist middleware (for admin routes)
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    if (!allowedIPs.includes(clientIP)) {
      res.status(403).json({ error: 'Access denied from this IP' });
      return;
    }
    
    next();
  };
};

// Request sanitization middleware
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction): void => {
  // Remove potentially dangerous characters from query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = (req.query[key] as string).replace(/[<>]/g, '');
      }
    });
  }
  
  // Sanitize request body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }
  
  next();
};

// Helper function to sanitize objects recursively
function sanitizeObject(obj: any): void {
  if (typeof obj !== 'object' || obj === null) return;
  
  Object.keys(obj).forEach(key => {
    if (typeof obj[key] === 'string') {
      // Remove potentially dangerous characters
      obj[key] = obj[key].replace(/[<>]/g, '');
    } else if (typeof obj[key] === 'object') {
      sanitizeObject(obj[key]);
    }
  });
}
