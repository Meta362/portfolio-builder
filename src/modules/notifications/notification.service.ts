// src/modules/notifications/notification.service.ts
import { NotificationRepository } from './notification.repository';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationChannel, NotificationStatus } from './models/notification.model';
import { EmailChannel } from './channels/email.channel';
import { TelegramChannel } from './channels/telegram.channel';
import { BadRequestException, NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class NotificationService {
  private repository: NotificationRepository;
  private emailChannel: EmailChannel;
  private telegramChannel: TelegramChannel;

  constructor() {
    this.repository = new NotificationRepository();
    this.emailChannel = new EmailChannel();
    this.telegramChannel = new TelegramChannel();
  }

  /**
   * Create and send notification
   */
  async create(createDto: CreateNotificationDto) {
    try {
      // Validate channels
      const channels = createDto.channels || [NotificationChannel.IN_APP];
      
      // Create notification
      const notification = await this.repository.create({
        ...createDto,
        channels,
        // status will be set in repository
      });

      // Process each channel
      const results = await this.processChannels(notification);

      // Update status based on results
      const allSucceeded = results.every(r => r.success);
      const anySucceeded = results.some(r => r.success);

      if (allSucceeded) {
        await this.repository.updateStatus(notification._id.toString(), NotificationStatus.DELIVERED);
      } else if (anySucceeded) {
        await this.repository.updateStatus(notification._id.toString(), NotificationStatus.SENT);
      } else {
        await this.repository.updateStatus(notification._id.toString(), NotificationStatus.FAILED);
      }

      // Return notification
      const updated = await this.repository.findById(notification._id.toString());
      return new NotificationResponseDto(updated);
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Process notification through channels
   */
  private async processChannels(notification: any): Promise<Array<{ channel: string; success: boolean; error?: string }>> {
    const results = [];
    const channels = notification.channels || [NotificationChannel.IN_APP];

    for (const channel of channels) {
      try {
        switch (channel) {
          case NotificationChannel.EMAIL:
            await this.emailChannel.send(notification);
            results.push({ channel: 'email', success: true });
            break;

          case NotificationChannel.TELEGRAM:
            await this.telegramChannel.send(notification);
            results.push({ channel: 'telegram', success: true });
            break;

          case NotificationChannel.IN_APP:
            // In-app is already saved, just mark as delivered
            await this.repository.updateStatus(notification._id.toString(), NotificationStatus.DELIVERED);
            results.push({ channel: 'in_app', success: true });
            break;

          default:
            results.push({ channel, success: false, error: 'Unknown channel' });
        }
      } catch (error) {
        logger.error(`Failed to send notification via ${channel}:`, error);
        results.push({
          channel,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, query: NotificationQueryDto) {
    try {
      const result = await this.repository.getUserNotifications(userId, query);
      return {
        notifications: result.notifications.map(n => new NotificationResponseDto(n)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async getById(id: string, userId: string) {
    try {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
      if (notification.userId !== userId) {
        throw new BadRequestException('You do not have permission to view this notification');
      }
      return new NotificationResponseDto(notification);
    } catch (error) {
      logger.error('Error getting notification:', error);
      throw error;
    }
  }

  /**
   * Mark as read
   */
  async markAsRead(id: string, userId: string) {
    try {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
      if (notification.userId !== userId) {
        throw new BadRequestException('You do not have permission to update this notification');
      }
      
      const updated = await this.repository.markAsRead(id);
      return new NotificationResponseDto(updated);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all as read
   */
  async markAllAsRead(userId: string) {
    try {
      const count = await this.repository.markAllAsRead(userId);
      return { count };
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async delete(id: string, userId: string) {
    try {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundException('Notification not found');
      }
      if (notification.userId !== userId) {
        throw new BadRequestException('You do not have permission to delete this notification');
      }
      
      await this.repository.delete(id);
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all notifications
   */
  async deleteAll(userId: string) {
    try {
      const count = await this.repository.deleteAll(userId);
      return { count };
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification stats
   */
  async getStats(userId: string) {
    try {
      return await this.repository.getStats(userId);
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string) {
    try {
      return await this.repository.getPreference(userId);
    } catch (error) {
      logger.error('Error getting notification preferences:', error);
      throw error;
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(userId: string, updateData: any) {
    try {
      return await this.repository.updatePreference(userId, updateData);
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      throw error;
    }
  }

  /**
   * Send digest
   */
  async sendDigest(frequency: 'daily' | 'weekly') {
    try {
      const userIds = await this.repository.getUsersForDigest(frequency);
      
      for (const userId of userIds) {
        try {
          const notifications = await this.repository.getUserNotifications(userId, {
            page: 1,
            limit: 50,
            isRead: false,
          });

          if (notifications.total > 0) {
            // Send digest email
            await this.emailChannel.sendDigest(userId, notifications.notifications);
            
            // Update last sent time
            await this.repository.updatePreference(userId, {
              'digest.lastSentAt': new Date(),
            });
          }
        } catch (error) {
          logger.error(`Failed to send digest to user ${userId}:`, error);
        }
      }

      logger.info(`Sent ${frequency} digest to ${userIds.length} users`);
    } catch (error) {
      logger.error('Error sending digest:', error);
      throw error;
    }
  }
}