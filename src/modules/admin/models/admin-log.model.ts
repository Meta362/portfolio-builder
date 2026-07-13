// src/modules/admin/models/admin-log.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum AdminAction {
  USER_VIEWED = 'user.viewed',
  USER_SUSPENDED = 'user.suspended',
  USER_RESTORED = 'user.restored',
  USER_ROLE_CHANGED = 'user.role.changed',
  USER_DELETED = 'user.deleted',
  PORTFOLIO_VIEWED = 'portfolio.viewed',
  PORTFOLIO_DELETED = 'portfolio.deleted',
  PORTFOLIO_FEATURED = 'portfolio.featured',
  SYSTEM_CONFIG_UPDATED = 'system.config.updated',
  ANNOUNCEMENT_CREATED = 'announcement.created',
  ANNOUNCEMENT_UPDATED = 'announcement.updated',
  ANNOUNCEMENT_DELETED = 'announcement.deleted',
  SYSTEM_BACKUP = 'system.backup',
  SYSTEM_RESTORE = 'system.restore',
  SYSTEM_MAINTENANCE = 'system.maintenance',
}

export interface IAdminLog extends Document {
  adminId: string;
  action: AdminAction;
  targetUserId?: string;
  targetPortfolioId?: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: Date;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: Object.values(AdminAction),
      required: true,
      index: true,
    },
    targetUserId: {
      type: String,
      index: true,
    },
    targetPortfolioId: {
      type: String,
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ip: {
      type: String,
    },
    userAgent: {
      type: String,
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

export const AdminLog = mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);