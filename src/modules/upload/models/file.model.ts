// src/modules/upload/models/file.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum FileType {
  AVATAR = 'avatar',
  PROJECT = 'project',
  PDF = 'pdf',
  OTHER = 'other',
}

export interface IFile extends Document {
  userId: string;
  filename: string;
  originalName: string;
  url: string;
  secureUrl: string;
  publicId: string;
  type: FileType;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;
  metadata?: Record<string, any>;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(FileType),
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: {
      type: Number,
    },
    height: {
      type: Number,
    },
    format: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
FileSchema.index({ userId: 1, type: 1 });
FileSchema.index({ userId: 1, isDeleted: 1 });
FileSchema.index({ publicId: 1 });

export const File = mongoose.model<IFile>('File', FileSchema);