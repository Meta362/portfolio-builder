// src/core/middlewares/error-handler.middleware.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../../config/logger';
import { BaseException } from '../exceptions/base.exception';

export const errorHandler = (
  err: Error | BaseException,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: (req as any).userId
  });

  // Check if it's our custom exception
  if (err instanceof BaseException) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        code: err.code,
        ...(err.metadata && { metadata: err.metadata })
      },
      timestamp: new Date().toISOString(),
      path: req.path
    });
    return;
  }

  // Default error for unknown errors
  const statusCode = (err as any).statusCode || 500;
  const message = statusCode === 500 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        name: err.name
      })
    },
    timestamp: new Date().toISOString(),
    path: req.path
  });
};