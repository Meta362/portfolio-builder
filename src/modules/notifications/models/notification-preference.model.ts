// src/modules/notifications/models/notification-preference.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationPreference extends Document {
  userId: string;
  channels: {
    inApp: boolean;
    email: boolean;
    telegram: boolean;
  };
  types: {
    system: boolean;
    portfolio: boolean;
    analytics: boolean;
    ai: boolean;
    telegram: boolean;
    email: boolean;
    user: boolean;
    security: boolean;
    subscription: boolean;
    contact: boolean;
    pdf: boolean;
  };
  digest: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'never';
    lastSentAt?: Date;
  };
  quietHours: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPreferenceSchema = new Schema<INotificationPreference>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    channels: {
      inApp: {
        type: Boolean,
        default: true,
      },
      email: {
        type: Boolean,
        default: true,
      },
      telegram: {
        type: Boolean,
        default: true,
      },
    },
    types: {
      system: { type: Boolean, default: true },
      portfolio: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      ai: { type: Boolean, default: true },
      telegram: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      user: { type: Boolean, default: true },
      security: { type: Boolean, default: true },
      subscription: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      pdf: { type: Boolean, default: true },
    },
    digest: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'never'],
        default: 'weekly',
      },
      lastSentAt: {
        type: Date,
      },
    },
    quietHours: {
      enabled: {
        type: Boolean,
        default: false,
      },
      start: {
        type: String,
        default: '22:00',
      },
      end: {
        type: String,
        default: '08:00',
      },
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationPreference = mongoose.model<INotificationPreference>(
  'NotificationPreference',
  NotificationPreferenceSchema
);