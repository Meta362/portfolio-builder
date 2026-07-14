// src/core/middlewares/auth.middleware.ts
// បន្ថែម authorize middleware

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedException, ForbiddenException } from '../exceptions/base.exception';
import { User } from '../../models/User.model';
import logger from '../../config/logger';

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
  token?: string;
}

/**
 * Authenticate user - verify JWT token
 */
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    
    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is deleted
    if (user.deletedAt) {
      throw new UnauthorizedException('Account has been deactivated');
    }

    req.userId = decoded.userId;
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    next(new UnauthorizedException('Invalid or expired token'));
  }
};

/**
 * Authorize user - check roles
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      
      if (!user) {
        throw new UnauthorizedException('User not authenticated');
      }

      const hasRole = user.roles?.some((role: string) => allowedRoles.includes(role));
      
      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication
 */
export const optionalAuthenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      
      const user = await User.findById(decoded.userId);
      if (user && !user.deletedAt) {
        req.userId = decoded.userId;
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};