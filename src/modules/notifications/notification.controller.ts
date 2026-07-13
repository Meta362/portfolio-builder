// src/modules/notifications/notification.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { NotificationService } from './notification.service';
import { 
  CreateNotificationDto,
  NotificationQueryDto,
  UpdatePreferenceDto,
  NotificationResponseDto
} from './dto';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  /**
   * Create notification (Admin only)
   * POST /api/v1/notifications
   */
  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const createDto: CreateNotificationDto = req.body;
      const notification = await this.notificationService.create(createDto);
      
      res.status(201).json({
        success: true,
        message: 'Notification created successfully',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user notifications
   * GET /api/v1/notifications
   */
  getUserNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const query: NotificationQueryDto = req.query;
      
      const result = await this.notificationService.getUserNotifications(userId, query);
      
      res.status(200).json({
        success: true,
        data: result.notifications,
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
   * Get notification by ID
   * GET /api/v1/notifications/:id
   */
  getById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      
      const notification = await this.notificationService.getById(id, userId);
      
      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/:id/read
   */
  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      
      const notification = await this.notificationService.markAsRead(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
        data: notification,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all notifications as read
   * POST /api/v1/notifications/read-all
   */
  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const result = await this.notificationService.markAllAsRead(userId);
      
      res.status(200).json({
        success: true,
        message: `${result.count} notifications marked as read`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:id
   */
  delete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      
      await this.notificationService.delete(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete all notifications
   * DELETE /api/v1/notifications/all
   */
  deleteAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const result = await this.notificationService.deleteAll(userId);
      
      res.status(200).json({
        success: true,
        message: `${result.count} notifications deleted`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notification stats
   * GET /api/v1/notifications/stats
   */
  getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const stats = await this.notificationService.getStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notification preferences
   * GET /api/v1/notifications/preferences
   */
  getPreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const preferences = await this.notificationService.getPreferences(userId);
      
      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update notification preferences
   * PUT /api/v1/notifications/preferences
   */
  updatePreferences = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const updateDto: UpdatePreferenceDto = req.body;
      
      const preferences = await this.notificationService.updatePreferences(userId, updateDto);
      
      res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: preferences,
      });
    } catch (error) {
      next(error);
    }
  };
}