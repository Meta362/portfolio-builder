// src/core/middlewares/rate-limiter.middleware.ts
import rateLimit from 'express-rate-limit';
import { Request } from 'express';

// Helper function to get IP address properly
const getIpAddress = (req: Request): string => {
  // Get IP from various sources
  const ip = req.headers['x-forwarded-for'] || 
              req.headers['x-real-ip'] || 
              req.ip || 
              req.socket.remoteAddress ||
              'anonymous';
  
  // Handle array of IPs (x-forwarded-for can be comma-separated)
  if (Array.isArray(ip)) {
    return ip[0] || 'anonymous';
  }
  
  // Return first IP if comma-separated
  return ip.split(',')[0].trim() || 'anonymous';
};

// General rate limiter for all routes
export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later.',
      code: 'RATE_LIMIT_EXCEEDED'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  keyGenerator: (req: Request) => {
    // Use user ID if authenticated, otherwise use IP
    const userId = (req as any).userId;
    if (userId) {
      return `user:${userId}`;
    }
    // Proper IP handling without IPv6 warning
    return `ip:${getIpAddress(req)}`;
  }
});

// Stricter rate limiter for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId;
    if (userId) {
      return `auth:user:${userId}`;
    }
    return `auth:ip:${getIpAddress(req)}`;
  }
});

// Stricter rate limiter for AI endpoints
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 AI requests per hour for free tier
  message: {
    success: false,
    error: {
      message: 'AI request limit exceeded for free tier. Please upgrade to Pro.',
      code: 'AI_RATE_LIMIT_EXCEEDED'
    },
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const userId = (req as any).userId;
    if (userId) {
      return `ai:user:${userId}`;
    }
    return `ai:ip:${getIpAddress(req)}`;
  }
});