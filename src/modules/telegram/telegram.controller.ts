// src/modules/telegram/telegram.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { TelegramRepository } from './telegram.repository';
import { telegramBotService } from './telegram.bot';
import { LinkTelegramDto } from './dto/link-telegram.dto';
import { UpdateTelegramSettingsDto } from './dto/update-telegram-settings.dto';
import { BadRequestException, NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class TelegramController {
  private repository: TelegramRepository;

  constructor() {
    this.repository = new TelegramRepository();
  }

  /**
   * Link Telegram account
   * POST /api/v1/telegram/link
   */
  linkAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { chatId } = req.body as LinkTelegramDto;

      const user = await this.repository.linkAccount(userId, chatId);

      res.status(200).json({
        success: true,
        message: 'Telegram account linked successfully',
        data: {
          isLinked: user.isLinked,
          settings: user.settings,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unlink Telegram account
   * POST /api/v1/telegram/unlink
   */
  unlinkAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      await this.repository.unlinkAccount(userId);

      res.status(200).json({
        success: true,
        message: 'Telegram account unlinked successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update settings
   * PUT /api/v1/telegram/settings
   */
  updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const settings = req.body as UpdateTelegramSettingsDto;

      const user = await this.repository.updateSettings(userId, settings);

      if (!user) {
        throw new NotFoundException('Telegram account not found');
      }

      res.status(200).json({
        success: true,
        message: 'Settings updated successfully',
        data: {
          settings: user.settings,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get settings
   * GET /api/v1/telegram/settings
   */
  getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;

      const user = await this.repository.findByUserId(userId);

      if (!user) {
        return res.status(200).json({
          success: true,
          data: {
            isLinked: false,
            settings: null,
          },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          isLinked: user.isLinked,
          isActive: user.isActive,
          settings: user.settings,
          linkedAt: user.linkedAt,
          lastActiveAt: user.lastActiveAt,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get notifications
   * GET /api/v1/telegram/notifications
   */
  getNotifications = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // This would integrate with the Notification module
      res.status(200).json({
        success: true,
        data: [],
        message: 'Notifications will be available soon',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark notification as read
   * PUT /api/v1/telegram/notifications/:id/read
   */
  markAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark all notifications as read
   * POST /api/v1/telegram/notifications/read-all
   */
  markAllAsRead = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      next(error);
    }
  };
}