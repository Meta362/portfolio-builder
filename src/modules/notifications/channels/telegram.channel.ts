// src/modules/notifications/channels/telegram.channel.ts
import { telegramBotService } from '../../telegram/telegram.bot';
import logger from '../../../config/logger';

export class TelegramChannel {
  /**
   * Send notification via Telegram
   */
  async send(notification: any): Promise<void> {
    try {
      // Map notification type to telegram type
      const typeMap: Record<string, string> = {
        'portfolio': 'portfolio_published',
        'contact': 'contact_received',
        'pdf': 'pdf_generated',
      };

      const telegramType = typeMap[notification.type] || notification.type;

      await telegramBotService.sendNotification(
        notification.userId,
        telegramType,
        {
          title: notification.title,
          message: notification.message,
          ...notification.data,
        }
      );

      logger.info(`Telegram notification sent to ${notification.userId}`);
    } catch (error) {
      logger.error('Error sending Telegram notification:', error);
      throw error;
    }
  }
}