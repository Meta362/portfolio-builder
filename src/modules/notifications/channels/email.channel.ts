// src/modules/notifications/channels/email.channel.ts
import { emailService } from '../../../core/services/email.service';
import logger from '../../../config/logger';

export class EmailChannel {
  /**
   * Send notification via email
   */
  async send(notification: any): Promise<void> {
    try {
      // Get user email
      const user = await this.getUser(notification.userId);
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      const html = this.formatEmailTemplate(notification);

      await emailService.sendEmail({
        to: user.email,
        subject: notification.title,
        html,
        text: notification.message,
      });

      logger.info(`Email notification sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * Send digest email
   */
  async sendDigest(userId: string, notifications: any[]): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user || !user.email) {
        throw new Error('User email not found');
      }

      const html = this.formatDigestTemplate(user, notifications);

      await emailService.sendEmail({
        to: user.email,
        subject: `📊 Your Notification Digest - ${new Date().toLocaleDateString()}`,
        html,
      });

      logger.info(`Digest email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending digest email:', error);
      throw error;
    }
  }

  private async getUser(userId: string): Promise<any> {
    // Get user from database
    const { User } = require('../../../models/User.model');
    return await User.findById(userId);
  }

  private formatEmailTemplate(notification: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px; }
          .priority-high { border-left: 4px solid #dc3545; padding-left: 15px; }
          .priority-medium { border-left: 4px solid #ffc107; padding-left: 15px; }
          .priority-low { border-left: 4px solid #28a745; padding-left: 15px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📬 ${notification.title}</h1>
          </div>
          <div class="priority-${notification.priority === 1 ? 'low' : notification.priority === 2 ? 'medium' : 'high'}">
            <p style="font-size: 16px; line-height: 1.6;">${notification.message}</p>
          </div>
          ${notification.data ? `<div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 15px;"><pre style="margin: 0; font-size: 12px;">${JSON.stringify(notification.data, null, 2)}</pre></div>` : ''}
          <div class="footer">
            <p>AI Portfolio Builder - Manage your notifications in settings</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private formatDigestTemplate(user: any, notifications: any[]): string {
    const items = notifications.map(n => `
      <div style="padding: 10px; border-bottom: 1px solid #e9ecef;">
        <strong>${n.title}</strong>
        <p style="margin: 5px 0 0; color: #6c757d; font-size: 14px;">${n.message}</p>
        <small style="color: #adb5bd;">${new Date(n.createdAt).toLocaleString()}</small>
      </div>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f8f9fa; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; margin: -30px -30px 20px; }
          .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">📊 Your Notification Digest</h1>
            <p style="margin: 5px 0 0;">Hello ${user.firstName}!</p>
          </div>
          <p>You have <strong>${notifications.length}</strong> unread notifications:</p>
          ${items}
          <div class="footer">
            <p>AI Portfolio Builder - <a href="${process.env.FRONTEND_URL}/notifications">View all notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}