// src/modules/pdf/models/pdf-request.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IPdfRequest extends Document {
  userId: string;
  portfolioId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: 'A4' | 'letter';
  orientation: 'portrait' | 'landscape';
  template: 'minimal' | 'professional' | 'creative';
  language: 'km' | 'en';
  downloadUrl?: string;
  fileSize?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

const PdfRequestSchema = new Schema<IPdfRequest>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    portfolioId: {
      type: String,
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    format: {
      type: String,
      enum: ['A4', 'letter'],
      default: 'A4'
    },
    orientation: {
      type: String,
      enum: ['portrait', 'landscape'],
      default: 'portrait'
    },
    template: {
      type: String,
      enum: ['minimal', 'professional', 'creative'],
      default: 'professional'
    },
    language: {
      type: String,
      enum: ['km', 'en'],
      default: 'en'
    },
    downloadUrl: {
      type: String
    },
    fileSize: {
      type: Number
    },
    error: {
      type: String
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes
PdfRequestSchema.index({ userId: 1, createdAt: -1 });
PdfRequestSchema.index({ portfolioId: 1, createdAt: -1 });
PdfRequestSchema.index({ status: 1, createdAt: 1 });

export const PdfRequest = mongoose.model<IPdfRequest>('PdfRequest', PdfRequestSchema);