// src/app.ts
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import configurations
import { connectDatabase, disconnectDatabase } from './config/database';
import { jobScheduler } from './jobs';
import { getRedisClient, closeRedisConnection } from './config/redis';
import logger from './config/logger';
import { verifyEmailConnection } from './config/email';

// Import middlewares
import { errorHandler } from './core/middlewares/error-handler.middleware';
import { rateLimiter } from './core/middlewares/rate-limiter.middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import portfolioRoutes from './modules/portfolios/portfolio.routes';
import aiRoutes from './modules/ai/ai.routes';
import telegramRoutes from './modules/telegram/telegram.routes';
import pdfRoutes from './modules/pdf/pdf.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import userRoutes from './modules/users/users.routes';
import uploadRoutes from './modules/upload/upload.routes';
import auditRoutes from './modules/audit/audit.routes';
import adminRoutes from './modules/admin/admin.routes';

// Import Telegram service for graceful shutdown
import { telegramBotService } from './modules/telegram/telegram.bot';
import { verifyCloudinaryConnection } from './config/cloudinary';

const app = express();

// Security middleware (CORS configured for credentials)
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);
  },
  credentials: true
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.get('/api/v1', (_req, res) => {
  res.json({
    message: 'Portfolio Builder API',
    version: process.env.API_VERSION || 'v1',
    status: 'operational'
  });
});

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/portfolios', portfolioRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/telegram', telegramRoutes);
app.use('/api/v1/pdf', pdfRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/audit', auditRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

/**
 * Graceful shutdown function
 * បិទ services ទាំងអស់ដោយស្អាតមុនពេលបញ្ចប់ process
 */
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, shutting down gracefully...`);
  
  try {
    // 1. Stop all jobs
    try {
      jobScheduler.stopAll();
      logger.info('✅ All jobs stopped');
    } catch (error) {
      logger.error('Error stopping jobs:', error);
    }

    // 2. Stop Telegram bot - កែប្រែនេះ
    try {
      telegramBotService.stopBot();
      logger.info('✅ Telegram bot stopped');
    } catch (error) {
      logger.error('Error stopping Telegram bot:', error);
    }
    
    // 3. Close Redis connection
    try {
      await closeRedisConnection();
      logger.info('✅ Redis connection closed');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
    
    // 4. Close MongoDB connection
    try {
      await disconnectDatabase();
      logger.info('✅ MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection:', error);
    }
    
    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

/**
 * Start server function
 */
const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to database
    await connectDatabase();
    logger.info('✅ MongoDB connected');

    // 2. Connect to Redis (non-blocking - won't crash if fails)
    try {
      const redis = getRedisClient();
      if (redis) {
        logger.info('✅ Redis initialized');
      } else {
        logger.warn('⚠️ Redis is disabled, continuing without cache');
      }
    } catch (error) {
      logger.warn('⚠️ Redis not available, continuing without cache');
    }

    // 3. Verify email connection
    try {
      const emailConnected = await verifyEmailConnection();
      if (emailConnected) {
        logger.info('✅ Email service ready');
      } else {
        logger.warn('⚠️ Email service not configured - email features will not work');
      }
    } catch (error) {
      logger.warn('⚠️ Email service not available - email features will not work');
    }
    
    // 4. Verify Cloudinary connection
    try {
      const cloudinaryConnected = await verifyCloudinaryConnection();
      if (cloudinaryConnected) {
        logger.info('✅ Cloudinary service ready');
      } else {
        logger.warn('⚠️ Cloudinary service not configured - file upload features will not work');
      }
    } catch (error) {
      logger.warn('⚠️ Cloudinary service not available - file upload features will not work');
    }

    // 5. Start job scheduler
    try {
      jobScheduler.startAll();
      logger.info('✅ Job scheduler started');
    } catch (error) {
      logger.warn('⚠️ Job scheduler failed to start:', error);
    }

    // 6. Start listening
    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📡 API available at http://localhost:${PORT}/api/v1`);
      logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Setup graceful shutdown handlers
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', error);
      process.exit(1);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;