// src/modules/ai/models/ai-request.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IAiRequest extends Document {
  userId: string;
  portfolioId?: string;
  type: 'generate_about' | 'rewrite' | 'score' | 'suggestions' | 'translate';
  input: {
    prompt: string;
    context: any;
    language?: string;
  };
  output?: {
    content: string;
    metadata?: any;
    confidence?: number;
  };
  cost: {
    tokens: number;
    estimatedCost: number;
  };
  performance: {
    duration: number; // milliseconds
    model: string;
    temperature: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

const AiRequestSchema = new Schema<IAiRequest>(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    portfolioId: {
      type: String,
      index: true
    },
    type: {
      type: String,
      enum: ['generate_about', 'rewrite', 'score', 'suggestions', 'translate'],
      required: true
    },
    input: {
      prompt: { type: String, required: true },
      context: { type: Schema.Types.Mixed },
      language: { type: String, default: 'en' }
    },
    output: {
      content: { type: String },
      metadata: { type: Schema.Types.Mixed },
      confidence: { type: Number }
    },
    cost: {
      tokens: { type: Number, default: 0 },
      estimatedCost: { type: Number, default: 0 }
    },
    performance: {
      duration: { type: Number, default: 0 },
      model: { type: String, default: 'gemini-3.5-flash' },
      temperature: { type: Number, default: 0.7 }
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
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
AiRequestSchema.index({ userId: 1, createdAt: -1 });
AiRequestSchema.index({ portfolioId: 1, type: 1 });
AiRequestSchema.index({ status: 1, createdAt: 1 });

export const AiRequest = mongoose.model<IAiRequest>('AiRequest', AiRequestSchema);