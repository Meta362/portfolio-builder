// src/core/middlewares/audit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { auditService } from '../../modules/audit/audit.service';
import { AuditAction, AuditStatus } from '../../modules/audit/models/audit-log.model';
import logger from '../../config/logger';

export interface AuditOptions {
  action: AuditAction;
  resource: string;
  getResourceId?: (req: Request) => string | undefined;
  getDetails?: (req: Request) => Record<string, any>;
  getChanges?: (req: Request) => Array<{ field: string; oldValue: any; newValue: any }>;
  skipOnError?: boolean;
}

/**
 * Audit middleware - log user actions
 */
export function audit(options: AuditOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end function to capture response
    res.end = function(...args: any[]) {
      // Restore original end
      res.end = originalEnd;
      
      // Call original end
      const result = originalEnd.apply(res, args);
      
      // Log audit after response
      const userId = (req as any).userId;
      
      if (userId) {
        const statusCode = res.statusCode;
        const status = statusCode >= 200 && statusCode < 300 
          ? AuditStatus.SUCCESS 
          : AuditStatus.FAILURE;
        
        const duration = Date.now() - startTime;
        
        // Get resource ID
        const resourceId = options.getResourceId ? options.getResourceId(req) : req.params.id;
        
        // Get details
        const details = options.getDetails ? options.getDetails(req) : {};
        
        // Get changes
        const changes = options.getChanges ? options.getChanges(req) : [];
        
        // Create audit log (don't await to avoid blocking response)
        auditService.createLog({
          userId,
          action: options.action,
          status,
          resource: options.resource,
          resourceId,
          ip: req.ip || req.headers['x-forwarded-for'] as string || '',
          userAgent: req.headers['user-agent'] || '',
          details: {
            ...details,
            method: req.method,
            path: req.path,
            statusCode,
            duration,
            query: req.query,
          },
          changes,
          metadata: {
            requestId: req.headers['x-request-id'],
            timestamp: new Date(),
          },
        }).catch(error => {
          logger.error('Failed to create audit log:', error);
        });
      }
      
      return result;
    };
    
    next();
  };
}

/**
 * Simple audit decorator for functions
 */
export function auditLog(action: AuditAction, resource: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      const userId = args[0]?.userId || args[0]?.user?.id;
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        
        // Log success
        if (userId) {
          await auditService.createLog({
            userId,
            action,
            status: AuditStatus.SUCCESS,
            resource,
            details: {
              method: propertyKey,
              duration: Date.now() - startTime,
            },
          });
        }
        
        return result;
      } catch (error) {
        // Log failure
        if (userId) {
          await auditService.createLog({
            userId,
            action,
            status: AuditStatus.FAILURE,
            resource,
            details: {
              method: propertyKey,
              duration: Date.now() - startTime,
              error: error.message,
            },
          });
        }
        
        throw error;
      }
    };
    
    return descriptor;
  };
}