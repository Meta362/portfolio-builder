// src/modules/audit/audit.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { auditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuditAction, AuditStatus } from './models/audit-log.model';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AuditController {
  /**
   * Get audit logs (Admin only)
   * GET /api/v1/audit/logs
   */
  getLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: AuditQueryDto = req.query;
      const result = await auditService.getLogs(req.userId!, query);
      
      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user audit logs
   * GET /api/v1/audit/user/:userId
   */
  getUserLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.params.userId;
      const query: AuditQueryDto = req.query;
      
      // Only admin can view other users' logs
      if (targetUserId !== req.userId && !req.user?.roles?.includes('admin')) {
        throw new BadRequestException('You do not have permission to view these logs');
      }
      
      const result = await auditService.getUserLogs(targetUserId, query);
      
      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get resource audit logs
   * GET /api/v1/audit/resource/:resource/:resourceId
   */
  getResourceLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { resource, resourceId } = req.params;
      const query: AuditQueryDto = req.query;
      
      const result = await auditService.getResourceLogs(resource, resourceId, query);
      
      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get audit stats (Admin only)
   * GET /api/v1/audit/stats
   */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query;
      
      const stats = await auditService.getStats(
        req.userId!,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Export user data (GDPR)
   * GET /api/v1/audit/export
   */
  exportUserData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const data = await auditService.exportUserData(userId);
      
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user data (GDPR - Right to be forgotten)
   * DELETE /api/v1/audit/user/:userId
   */
  deleteUserData = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      
      // Only admin can delete user data
      if (!req.user?.roles?.includes('admin')) {
        throw new BadRequestException('Only admin can delete user data');
      }
      
      const result = await auditService.deleteUserData(userId);
      
      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} audit logs for user ${userId}`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}