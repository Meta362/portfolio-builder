// src/modules/notifications/models/notification.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum NotificationType {
  SYSTEM = 'system',
  PORTFOLIO = 'portfolio',
  ANALYTICS = 'analytics',
  AI = 'ai',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  USER = 'user',
  SECURITY = 'security',
  SUBSCRIPTION = 'subscription',
  CONTACT = 'contact',
  PDF = 'pdf',
}

export enum NotificationPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
  CRITICAL = 5,
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  TELEGRAM = 'telegram',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface INotification extends Document {
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  message: string;
  data?: Record<string, any>;
  templateId?: string;
  status: NotificationStatus;
  isRead: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  sentAt?: Date;
  failedAt?: Date;
  error?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    priority: {
      type: Number,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.MEDIUM,
    },
    channels: {
      type: [String],
      enum: Object.values(NotificationChannel),
      default: [NotificationChannel.IN_APP],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    templateId: {
      type: String,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
    error: {
      type: String,
    },
    expiresAt: {
      type: Date,
      index: { expireAfterSeconds: 0 },
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ status: 1, createdAt: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for age
NotificationSchema.virtual('age').get(function(this: INotification) {
  return Date.now() - this.createdAt.getTime();
});

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);