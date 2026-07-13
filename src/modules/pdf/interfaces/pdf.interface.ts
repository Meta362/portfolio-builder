// src/modules/pdf/interfaces/pdf.interface.ts

export interface IPdfRequest {
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

export interface IPdfOptions {
  format: 'A4' | 'letter';
  orientation: 'portrait' | 'landscape';
  margin: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  printBackground: boolean;
}

export interface IPdfDownloadResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
}