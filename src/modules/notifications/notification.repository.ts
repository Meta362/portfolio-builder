// src/modules/notifications/notification.repository.ts
import { Notification, INotification, NotificationStatus, NotificationChannel } from './models/notification.model';
import { NotificationPreference } from './models/notification-preference.model';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationQueryDto } from './dto/notification-query.dto';
import logger from '../../config/logger';

export class NotificationRepository {
  /**
   * Create notification
   */
  async create(data: CreateNotificationDto): Promise<INotification> {
    try {
      const notification = new Notification({
        ...data,
        status: NotificationStatus.PENDING,
      });
      await notification.save();
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId: string, query: NotificationQueryDto) {
    try {
      const { type, isRead, priority, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      
      const filter: any = { userId };
      if (type) filter.type = type;
      if (isRead !== undefined) filter.isRead = isRead;
      if (priority) filter.priority = priority;

      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [notifications, total] = await Promise.all([
        Notification.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Notification.countDocuments(filter),
      ]);

      return {
        notifications,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification by ID
   */
  async findById(id: string): Promise<INotification | null> {
    try {
      return await Notification.findById(id);
    } catch (error) {
      logger.error('Error finding notification by ID:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<INotification | null> {
    try {
      return await Notification.findByIdAndUpdate(
        id,
        {
          $set: {
            isRead: true,
            readAt: new Date(),
            status: NotificationStatus.READ,
          },
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await Notification.updateMany(
        { userId, isRead: false },
        {
          $set: {
            isRead: true,
            readAt: new Date(),
            status: NotificationStatus.READ,
          },
        }
      );
      return result.modifiedCount;
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<void> {
    try {
      await Notification.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Delete all user notifications
   */
  async deleteAll(userId: string): Promise<number> {
    try {
      const result = await Notification.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting all notifications:', error);
      throw error;
    }
  }

  /**
   * Update notification status
   */
  async updateStatus(id: string, status: NotificationStatus): Promise<INotification | null> {
    try {
      const updateData: any = { status };
      if (status === NotificationStatus.SENT) {
        updateData.sentAt = new Date();
      } else if (status === NotificationStatus.DELIVERED) {
        updateData.deliveredAt = new Date();
      } else if (status === NotificationStatus.FAILED) {
        updateData.failedAt = new Date();
      }
      
      return await Notification.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating notification status:', error);
      throw error;
    }
  }

  /**
   * Get pending notifications
   */
  async getPendingNotifications(limit: number = 100): Promise<INotification[]> {
    try {
      return await Notification.find({
        status: NotificationStatus.PENDING,
        expiresAt: { $gt: new Date() },
      })
        .sort({ priority: -1, createdAt: 1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error getting pending notifications:', error);
      throw error;
    }
  }

  /**
   * Get notification stats
   */
  async getStats(userId: string) {
    try {
      const [total, unread, highPriority, sentToday] = await Promise.all([
        Notification.countDocuments({ userId }),
        Notification.countDocuments({ userId, isRead: false }),
        Notification.countDocuments({ userId, priority: { $gte: 3 } }),
        Notification.countDocuments({
          userId,
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        }),
      ]);

      return {
        total,
        unread,
        highPriority,
        sentToday,
      };
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Get user notification preference
   */
  async getPreference(userId: string) {
    try {
      let preference = await NotificationPreference.findOne({ userId });
      if (!preference) {
        preference = new NotificationPreference({ userId });
        await preference.save();
      }
      return preference;
    } catch (error) {
      logger.error('Error getting notification preference:', error);
      throw error;
    }
  }

  /**
   * Update user notification preference
   */
  async updatePreference(userId: string, updateData: any) {
    try {
      const preference = await NotificationPreference.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true }
      );
      return preference;
    } catch (error) {
      logger.error('Error updating notification preference:', error);
      throw error;
    }
  }

  /**
   * Get users for digest
   */
  async getUsersForDigest(frequency: 'daily' | 'weekly') {
  try {
    const now = new Date();
    const filter: any = {
      'digest.enabled': true,
      'digest.frequency': frequency,
    };

    // Only get users who haven't received digest recently
    const dateLimit = new Date();
    if (frequency === 'daily') {
      dateLimit.setDate(dateLimit.getDate() - 1);
    } else {
      dateLimit.setDate(dateLimit.getDate() - 7);
    }
    
    filter['digest.lastSentAt'] = { $lt: dateLimit };

    const preferences = await NotificationPreference.find(filter);
    return preferences.map(p => p.userId);
  } catch (error) {
    logger.error('Error getting users for digest:', error);
    throw error;
  }
}
}