// src/modules/telegram/models/telegram.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITelegramUser extends Document {
  userId: string; // Internal user ID
  chatId: string; // Telegram chat ID
  isLinked: boolean;
  isActive: boolean;
  settings: {
    notificationsEnabled: boolean;
    language: 'en' | 'km';
    timezone: string;
    notificationTypes: {
      portfolioPublished: boolean;
      contactReceived: boolean;
      pdfGenerated: boolean;
      weeklyDigest: boolean;
      systemAlert: boolean;
    };
  };
  linkedAt: Date;
  lastActiveAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TelegramUserSchema = new Schema<ITelegramUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    chatId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isLinked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    settings: {
      notificationsEnabled: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        enum: ['en', 'km'],
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'Asia/Phnom_Penh',
      },
      notificationTypes: {
        portfolioPublished: { type: Boolean, default: true },
        contactReceived: { type: Boolean, default: true },
        pdfGenerated: { type: Boolean, default: true },
        weeklyDigest: { type: Boolean, default: true },
        systemAlert: { type: Boolean, default: true },
      },
    },
    linkedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const TelegramUser = mongoose.model<ITelegramUser>('TelegramUser', TelegramUserSchema);