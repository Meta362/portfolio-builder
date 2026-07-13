// src/modules/admin/models/announcement.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum AnnouncementPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum AnnouncementStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export interface IAnnouncement extends Document {
  title: string;
  content: string;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  authorId: string;
  publishedAt?: Date;
  expiresAt?: Date;
  targetAudience: {
    roles?: string[];
    subscriptionTiers?: string[];
  };
  metadata: {
    views: number;
    clicks: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(AnnouncementPriority),
      default: AnnouncementPriority.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(AnnouncementStatus),
      default: AnnouncementStatus.DRAFT,
      index: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
    },
    publishedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
    },
    targetAudience: {
      roles: {
        type: [String],
        default: ['user', 'admin', 'moderator'],
      },
      subscriptionTiers: {
        type: [String],
        default: ['free', 'pro', 'enterprise'],
      },
    },
    metadata: {
      views: {
        type: Number,
        default: 0,
      },
      clicks: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Announcement = mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);