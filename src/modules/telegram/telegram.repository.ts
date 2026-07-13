// src/modules/telegram/telegram.repository.ts
import { TelegramUser, ITelegramUser } from './models/telegram.model';
import { NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class TelegramRepository {
  /**
   * Find telegram user by internal user ID
   */
  async findByUserId(userId: string): Promise<ITelegramUser | null> {
    try {
      return await TelegramUser.findOne({ userId, isActive: true });
    } catch (error) {
      logger.error('Error finding telegram user by userId:', error);
      throw error;
    }
  }

  /**
   * Find telegram user by chat ID
   */
  async findByChatId(chatId: string): Promise<ITelegramUser | null> {
    try {
      return await TelegramUser.findOne({ chatId, isActive: true });
    } catch (error) {
      logger.error('Error finding telegram user by chatId:', error);
      throw error;
    }
  }

  /**
   * Link telegram account
   */
  async linkAccount(userId: string, chatId: string): Promise<ITelegramUser> {
    try {
      // Check if already linked
      const existing = await TelegramUser.findOne({ chatId });
      if (existing) {
        // Update if already exists
        existing.userId = userId;
        existing.isLinked = true;
        existing.isActive = true;
        existing.linkedAt = new Date();
        await existing.save();
        return existing;
      }

      // Create new
      const telegramUser = new TelegramUser({
        userId,
        chatId,
        isLinked: true,
        isActive: true,
        linkedAt: new Date(),
      });
      await telegramUser.save();
      return telegramUser;
    } catch (error) {
      logger.error('Error linking telegram account:', error);
      throw error;
    }
  }

  /**
   * Unlink telegram account
   */
  async unlinkAccount(userId: string): Promise<void> {
    try {
      const user = await TelegramUser.findOne({ userId });
      if (user) {
        user.isActive = false;
        user.isLinked = false;
        await user.save();
      }
    } catch (error) {
      logger.error('Error unlinking telegram account:', error);
      throw error;
    }
  }

  /**
   * Update user settings
   */
  async updateSettings(userId: string, settings: any): Promise<ITelegramUser | null> {
    try {
      const user = await TelegramUser.findOne({ userId });
      if (!user) {
        return null;
      }

      Object.keys(settings).forEach(key => {
        if (key === 'notificationTypes' && settings.notificationTypes) {
          Object.keys(settings.notificationTypes).forEach(subKey => {
            if (user.settings.notificationTypes[subKey] !== undefined) {
              user.settings.notificationTypes[subKey] = settings.notificationTypes[subKey];
            }
          });
        } else if (user.settings[key] !== undefined) {
          user.settings[key] = settings[key];
        }
      });

      await user.save();
      return user;
    } catch (error) {
      logger.error('Error updating telegram settings:', error);
      throw error;
    }
  }

  /**
   * Get all active telegram users
   */
  async getActiveUsers(): Promise<ITelegramUser[]> {
    try {
      return await TelegramUser.find({ 
        isActive: true, 
        isLinked: true,
        'settings.notificationsEnabled': true,
      });
    } catch (error) {
      logger.error('Error getting active telegram users:', error);
      throw error;
    }
  }

  /**
   * Update last active time
   */
  async updateLastActive(chatId: string): Promise<void> {
    try {
      await TelegramUser.findOneAndUpdate(
        { chatId },
        { $set: { lastActiveAt: new Date() } }
      );
    } catch (error) {
      logger.error('Error updating last active:', error);
      throw error;
    }
  }
}