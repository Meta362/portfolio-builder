// src/modules/audit/models/audit-log.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum AuditAction {
  // Auth actions
  USER_REGISTERED = 'user.registered',
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_VERIFIED = 'user.verified',
  PASSWORD_RESET = 'password.reset',
  PASSWORD_CHANGED = 'password.changed',
  
  // User actions
  USER_CREATED = 'user.created',
  USER_UPDATED = 'user.updated',
  USER_DELETED = 'user.deleted',
  USER_RESTORED = 'user.restored',
  USER_SUSPENDED = 'user.suspended',
  USER_ROLE_CHANGED = 'user.role.changed',
  
  // Portfolio actions
  PORTFOLIO_CREATED = 'portfolio.created',
  PORTFOLIO_UPDATED = 'portfolio.updated',
  PORTFOLIO_DELETED = 'portfolio.deleted',
  PORTFOLIO_PUBLISHED = 'portfolio.published',
  PORTFOLIO_UNPUBLISHED = 'portfolio.unpublished',
  
  // AI actions
  AI_GENERATED = 'ai.generated',
  AI_SCORED = 'ai.scored',
  AI_TRANSLATED = 'ai.translated',
  
  // PDF actions
  PDF_GENERATED = 'pdf.generated',
  PDF_DOWNLOADED = 'pdf.downloaded',
  
  // Admin actions
  ADMIN_ACTION = 'admin.action',
  SYSTEM_CONFIG = 'system.config',
  SYSTEM_MAINTENANCE = 'system.maintenance',
  
  // Data actions
  DATA_EXPORTED = 'data.exported',
  DATA_DELETED = 'data.deleted',
  DATA_RESTORED = 'data.restored',
}

export enum AuditStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  PARTIAL = 'partial',
}

export interface IAuditLog extends Document {
  userId: string;
  action: AuditAction;
  status: AuditStatus;
  resource: string;
  resourceId?: string;
  ip: string;
  userAgent: string;
  device: string;
  platform: string;
  browser: string;
  location: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  details: Record<string, any>;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(AuditStatus),
      default: AuditStatus.SUCCESS,
    },
    resource: {
      type: String,
      required: true,
    },
    resourceId: {
      type: String,
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    device: {
      type: String,
    },
    platform: {
      type: String,
    },
    browser: {
      type: String,
    },
    location: {
      country: { type: String },
      city: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    changes: [{
      field: { type: String },
      oldValue: { type: Schema.Types.Mixed },
      newValue: { type: Schema.Types.Mixed },
    }],
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
AuditLogSchema.index({ userId: 1, action: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);