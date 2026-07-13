// src/core/services/email.service.ts
import { transporter } from '../../config/email';
import logger from '../../config/logger';
import {
  getVerificationTemplate,
  getPasswordResetTemplate,
  getWelcomeTemplate,
} from '../../modules/email/templates';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendVerificationOptions {
  to: string;
  name: string;
  token: string;
}

export interface SendPasswordResetOptions {
  to: string;
  name: string;
  token: string;
}

export interface SendWelcomeOptions {
  to: string;
  name: string;
}

export class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@portfolio-builder.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId,
      });
    } catch (error) {
      logger.error('Failed to send email', {
        to: options.to,
        subject: options.subject,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  async sendVerificationEmail(options: SendVerificationOptions): Promise<void> {
    const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/v1/auth/verify-email/${options.token}`;
    const html = getVerificationTemplate({
      name: options.name,
      verificationLink,
    });

    await this.sendEmail({
      to: options.to,
      subject: 'Verify Your Email - AI Portfolio Builder',
      html,
    });
  }

  async sendPasswordResetEmail(options: SendPasswordResetOptions): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${options.token}`;
    const html = getPasswordResetTemplate({
      name: options.name,
      resetLink,
    });

    await this.sendEmail({
      to: options.to,
      subject: 'Reset Your Password - AI Portfolio Builder',
      html,
    });
  }

  async sendWelcomeEmail(options: SendWelcomeOptions): Promise<void> {
    const html = getWelcomeTemplate({
      name: options.name,
    });

    await this.sendEmail({
      to: options.to,
      subject: 'Welcome to AI Portfolio Builder! 🚀',
      html,
    });
  }
}

export const emailService = EmailService.getInstance();