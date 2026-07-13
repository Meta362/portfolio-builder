// src/modules/shared/events/pdf-generated.event.ts

export interface PDFGeneratedEvent {
  userId: string;
  portfolioId: string;
  requestId: string;
  downloadUrl: string;
  fileSize: number;
  format: string;
  generatedAt: Date;
}

export class PDFGeneratedEvent {
  constructor(public readonly data: PDFGeneratedEvent) {}
}