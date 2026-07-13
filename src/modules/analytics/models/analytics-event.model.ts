// src/modules/analytics/models/analytics-event.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum AnalyticsEventType {
  // User events
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_VERIFIED = 'user.verified',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  
  // Portfolio events
  PORTFOLIO_CREATED = 'portfolio.created',
  PORTFOLIO_UPDATED = 'portfolio.updated',
  PORTFOLIO_DELETED = 'portfolio.deleted',
  PORTFOLIO_PUBLISHED = 'portfolio.published',
  PORTFOLIO_UNPUBLISHED = 'portfolio.unpublished',
  PORTFOLIO_VIEWED = 'portfolio.viewed',
  PORTFOLIO_UNIQUE_VIEWED = 'portfolio.unique_viewed',
  
  // AI events
  AI_REQUEST = 'ai.request',
  AI_COMPLETED = 'ai.completed',
  AI_FAILED = 'ai.failed',
  
  // PDF events
  PDF_GENERATED = 'pdf.generated',
  PDF_DOWNLOADED = 'pdf.downloaded',
  
  // Contact events
  CONTACT_RECEIVED = 'contact.received',
  
  // Notification events
  NOTIFICATION_SENT = 'notification.sent',
  NOTIFICATION_READ = 'notification.read',
  
  // Social events
  SHARE_LINKEDIN = 'share.linkedin',
  SHARE_TWITTER = 'share.twitter',
  SHARE_FACEBOOK = 'share.facebook',
  
  // Payment events (future)
  PAYMENT_INITIATED = 'payment.initiated',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
}

export enum AnalyticsSource {
  WEB = 'web',
  MOBILE = 'mobile',
  TELEGRAM = 'telegram',
  API = 'api',
}

export interface IAnalyticsEvent extends Document {
  userId: string;
  sessionId: string;
  eventType: AnalyticsEventType;
  source: AnalyticsSource;
  timestamp: Date;
  metadata: {
    ip?: string;
    userAgent?: string;
    device?: string;
    platform?: string;
    browser?: string;
    referrer?: string;
    url?: string;
    path?: string;
    query?: string;
  };
  properties: Record<string, any>;
  value?: number;
  category?: string;
  label?: string;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      enum: Object.values(AnalyticsEventType),
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: Object.values(AnalyticsSource),
      default: AnalyticsSource.WEB,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      ip: { type: String },
      userAgent: { type: String },
      device: { type: String },
      platform: { type: String },
      browser: { type: String },
      referrer: { type: String },
      url: { type: String },
      path: { type: String },
      query: { type: String },
    },
    properties: {
      type: Schema.Types.Mixed,
      default: {},
    },
    value: {
      type: Number,
    },
    category: {
      type: String,
    },
    label: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
AnalyticsEventSchema.index({ userId: 1, eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ sessionId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);