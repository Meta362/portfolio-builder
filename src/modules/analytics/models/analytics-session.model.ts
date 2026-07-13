// src/modules/analytics/models/analytics-session.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsSession extends Document {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  active: boolean;
  device: {
    type?: string;
    platform?: string;
    browser?: string;
    os?: string;
    version?: string;
  };
  location: {
    ip?: string;
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  events: string[];
  pageViews: number;
  createdAt: Date;
  updatedAt: Date;
}

const AnalyticsSessionSchema = new Schema<IAnalyticsSession>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    duration: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    device: {
      type: { type: String },
      platform: { type: String },
      browser: { type: String },
      os: { type: String },
      version: { type: String },
    },
    location: {
      ip: { type: String },
      country: { type: String },
      city: { type: String },
      latitude: { type: Number },
      longitude: { type: Number },
    },
    events: {
      type: [String],
      default: [],
    },
    pageViews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const AnalyticsSession = mongoose.model<IAnalyticsSession>('AnalyticsSession', AnalyticsSessionSchema);