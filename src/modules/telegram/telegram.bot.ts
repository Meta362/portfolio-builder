// src/modules/telegram/telegram.bot.ts
import TelegramBot from 'node-telegram-bot-api';
import { TelegramRepository } from './telegram.repository';
import { TelegramFormatter } from './telegram.formatter';
import { eventEmitter, EVENTS } from '../shared/events/event-emitter';
import logger from '../../config/logger';

export class TelegramBotService {
  private bot: TelegramBot | null = null;
  private repository: TelegramRepository;
  private isRunning: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor() {
    this.repository = new TelegramRepository();
    this.initializeBot();
    this.setupEventListeners();
  }

  /**
   * Initialize Telegram bot
   */
  private initializeBot(): void {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!token) {
      logger.warn('⚠️ TELEGRAM_BOT_TOKEN not found. Telegram bot disabled.');
      return;
    }

    try {
      this.bot = new TelegramBot(token, {
        polling: true,
      });

      this.setupCommands();
      this.setupPolling();
      
      this.isRunning = true;
      logger.info('✅ Telegram bot initialized successfully');
    } catch (error) {
      logger.error('❌ Failed to initialize Telegram bot:', error);
    }
  }

  /**
   * Setup bot commands
   */
  private setupCommands(): void {
    if (!this.bot) return;

    // /start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await this.handleStart(chatId);
    });

    // /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await this.handleHelp(chatId);
    });

    // /status command
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await this.handleStatus(chatId);
    });

    // /settings command
    this.bot.onText(/\/settings/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await this.handleSettings(chatId);
    });

    // /unlink command
    this.bot.onText(/\/unlink/, async (msg) => {
      const chatId = msg.chat.id.toString();
      await this.handleUnlink(chatId);
    });

    // /notifications on/off
    this.bot.onText(/\/notifications\s+(on|off)/, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const action = match?.[1] || 'on';
      await this.handleNotifications(chatId, action === 'on');
    });

    // /language en/km
    this.bot.onText(/\/language\s+(en|km)/, async (msg, match) => {
      const chatId = msg.chat.id.toString();
      const lang = match?.[1] || 'en';
      await this.handleLanguage(chatId, lang as 'en' | 'km');
    });

    // Handle unknown commands
    this.bot.on('message', async (msg) => {
      const chatId = msg.chat.id.toString();
      const text = msg.text || '';
      
      // Skip if it's a command (starts with /)
      if (text.startsWith('/')) {
        // Check if it's a known command
        const knownCommands = ['/start', '/help', '/status', '/settings', '/unlink', '/notifications', '/language'];
        if (!knownCommands.some(cmd => text.startsWith(cmd))) {
          await this.handleUnknownCommand(chatId);
        }
      }
    });
  }

  /**
   * Setup polling with error handling
   */
  private setupPolling(): void {
    if (!this.bot) return;

    this.bot.on('polling_error', (error: any) => {
      logger.error('Telegram polling error:', error);
      
      // Check for specific error codes
      if (error.code === 'EFATAL' || error.code === 'ECONNRESET' || error.message?.includes('EFATAL')) {
        this.handleReconnect();
      }
    });

    this.bot.on('error', (error: any) => {
      logger.error('Telegram bot error:', error);
      
      if (error.code === 'EFATAL' || error.code === 'ECONNRESET') {
        this.handleReconnect();
      }
    });
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnect attempts reached. Stopping bot.');
      this.stopBot();
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    logger.info(`Reconnecting in ${delay/1000}s... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.initializeBot();
    }, delay);
  }

  /**
   * Handle /start command
   */
  private async handleStart(chatId: string): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      
      if (user) {
        await this.bot?.sendMessage(chatId, `
Welcome back! 👋

You already have an account linked.
Use /help to see available commands.
        `);
      } else {
        await this.bot?.sendMessage(chatId, `
Welcome to AI Portfolio Builder! 🚀

To link your account, please use the link command in the web app.

Once linked, you'll receive notifications about:
• Portfolio publications
• Contact messages
• PDF generations
• Weekly digests

Use /help to see all commands.
        `);
      }
    } catch (error) {
      logger.error('Error handling start:', error);
    }
  }

  /**
   * Handle /help command
   */
  private async handleHelp(chatId: string): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      const language = user?.settings.language || 'en';
      
      const message = TelegramFormatter.getHelpMessage(language);
      await this.bot?.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error handling help:', error);
    }
  }

  /**
   * Handle /status command
   */
  private async handleStatus(chatId: string): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      
      if (!user || !user.isLinked) {
        await this.bot?.sendMessage(chatId, `
❌ Your account is not linked.

Please link your account using the web app.
        `);
        return;
      }

      const message = TelegramFormatter.getStatusMessage(user, user.settings.language);
      await this.bot?.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error handling status:', error);
    }
  }

  /**
   * Handle /settings command
   */
  private async handleSettings(chatId: string): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      
      if (!user || !user.isLinked) {
        await this.bot?.sendMessage(chatId, '❌ Please link your account first.');
        return;
      }

      const message = TelegramFormatter.getSettingsMessage(user.settings.language);
      await this.bot?.sendMessage(chatId, message, { parse_mode: 'HTML' });
    } catch (error) {
      logger.error('Error handling settings:', error);
    }
  }

  /**
   * Handle /unlink command
   */
  private async handleUnlink(chatId: string): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      
      if (!user || !user.isLinked) {
        await this.bot?.sendMessage(chatId, '❌ Your account is not linked.');
        return;
      }

      await this.repository.unlinkAccount(user.userId);
      
      await this.bot?.sendMessage(chatId, `
✅ Account unlinked successfully.

You will no longer receive notifications.
To link again, use the web app.
      `);
    } catch (error) {
      logger.error('Error handling unlink:', error);
    }
  }

  /**
   * Handle /notifications command
   */
  private async handleNotifications(chatId: string, enabled: boolean): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      
      if (!user || !user.isLinked) {
        await this.bot?.sendMessage(chatId, '❌ Please link your account first.');
        return;
      }

      await this.repository.updateSettings(user.userId, {
        notificationsEnabled: enabled,
      });

      await this.bot?.sendMessage(chatId, `
✅ Notifications ${enabled ? 'enabled' : 'disabled'} successfully.
      `);
    } catch (error) {
      logger.error('Error handling notifications:', error);
    }
  }

  /**
   * Handle /language command
   */
  private async handleLanguage(chatId: string, language: 'en' | 'km'): Promise<void> {
    try {
      const user = await this.repository.findByChatId(chatId);
      
      if (!user || !user.isLinked) {
        await this.bot?.sendMessage(chatId, '❌ Please link your account first.');
        return;
      }

      await this.repository.updateSettings(user.userId, {
        language,
      });

      const message = language === 'km' 
        ? '✅ បានប្តូរទៅភាសាខ្មែរដោយជោគជ័យ។'
        : '✅ Language changed to English successfully.';
      
      await this.bot?.sendMessage(chatId, message);
    } catch (error) {
      logger.error('Error handling language:', error);
    }
  }

  /**
   * Handle unknown command
   */
  private async handleUnknownCommand(chatId: string): Promise<void> {
    await this.bot?.sendMessage(chatId, `
❌ Unknown command.

Use /help to see all available commands.
    `);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Portfolio published
    eventEmitter.on(EVENTS.PORTFOLIO_PUBLISHED, async (data) => {
      await this.sendNotification(data.userId, 'portfolio_published', {
        title: data.title,
        url: `${process.env.FRONTEND_URL}/portfolio/${data.username}`,
      });
    });

    // Contact received
    eventEmitter.on(EVENTS.CONTACT_RECEIVED, async (data) => {
      await this.sendNotification(data.userId, 'contact_received', {
        name: data.name,
        email: data.email,
        message: data.message,
      });
    });

    // PDF generated
    eventEmitter.on(EVENTS.PDF_GENERATED, async (data) => {
      await this.sendNotification(data.userId, 'pdf_generated', {
        portfolioTitle: data.portfolioTitle,
        downloadUrl: data.downloadUrl,
        fileSize: data.fileSize,
      });
    });
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId: string, type: string, data: any): Promise<void> {
    try {
      const user = await this.repository.findByUserId(userId);
      
      if (!user || !user.isLinked || !user.isActive) {
        return;
      }

      // Check if notification type is enabled
      const notificationTypes = user.settings.notificationTypes;
      const typeMap: Record<string, keyof typeof notificationTypes> = {
        'portfolio_published': 'portfolioPublished',
        'contact_received': 'contactReceived',
        'pdf_generated': 'pdfGenerated',
        'weekly_digest': 'weeklyDigest',
        'system_alert': 'systemAlert',
      };

      const settingKey = typeMap[type];
      if (settingKey && !notificationTypes[settingKey]) {
        return;
      }

      const message = TelegramFormatter.formatNotification(
        type,
        data,
        user.settings.language
      );

      await this.bot?.sendMessage(user.chatId, message, { parse_mode: 'HTML' });
      logger.info(`Telegram notification sent to ${userId} (${type})`);
    } catch (error) {
      logger.error('Error sending Telegram notification:', error);
    }
  }

  /**
   * Send weekly digest to all users
   */
  async sendWeeklyDigest(userId: string, data: any): Promise<void> {
    await this.sendNotification(userId, 'weekly_digest', data);
  }

  /**
   * Stop bot
   */
  stopBot(): void {
    if (this.bot) {
      try {
        this.bot.stopPolling();
        this.isRunning = false;
        logger.info('Telegram bot stopped');
      } catch (error) {
        logger.error('Error stopping Telegram bot:', error);
      }
    }
  }
}

// Export singleton instance
export const telegramBotService = new TelegramBotService();

// Export function for backward compatibility
export const getTelegramService = () => {
  return telegramBotService;
};