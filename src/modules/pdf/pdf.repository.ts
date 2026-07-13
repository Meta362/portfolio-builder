// src/modules/pdf/pdf.repository.ts
import { PdfRequest, IPdfRequest } from './models/pdf-request.model';
import logger from '../../config/logger';

export class PdfRepository {
  /**
   * Create PDF request
   */
  async createRequest(data: Partial<IPdfRequest>): Promise<IPdfRequest> {
    try {
      const request = new PdfRequest(data);
      await request.save();
      return request;
    } catch (error) {
      logger.error('Error creating PDF request:', error);
      throw error;
    }
  }

  /**
   * Update PDF request
   */
  async updateRequest(
    id: string,
    data: Partial<IPdfRequest>
  ): Promise<IPdfRequest | null> {
    try {
      return await PdfRequest.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating PDF request:', error);
      throw error;
    }
  }

  /**
   * Get PDF request by ID
   */
  async getRequestById(id: string): Promise<IPdfRequest | null> {
    try {
      return await PdfRequest.findById(id);
    } catch (error) {
      logger.error('Error getting PDF request:', error);
      return null;
    }
  }

  /**
   * Get user's PDF requests
   */
  async getUserRequests(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IPdfRequest[]> {
    try {
      return await PdfRequest.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    } catch (error) {
      logger.error('Error getting user PDF requests:', error);
      throw error;
    }
  }

  /**
   * Get portfolio's PDF requests
   */
  async getPortfolioRequests(
    portfolioId: string,
    limit: number = 10
  ): Promise<IPdfRequest[]> {
    try {
      return await PdfRequest.find({ portfolioId })
        .sort({ createdAt: -1 })
        .limit(limit);
    } catch (error) {
      logger.error('Error getting portfolio PDF requests:', error);
      throw error;
    }
  }

  /**
   * Mark request as completed
   */
  async markCompleted(
    id: string,
    downloadUrl: string,
    fileSize: number
  ): Promise<IPdfRequest | null> {
    try {
      return await PdfRequest.findByIdAndUpdate(
        id,
        {
          status: 'completed',
          downloadUrl,
          fileSize,
          completedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error marking PDF as completed:', error);
      throw error;
    }
  }

  /**
   * Mark request as failed
   */
  async markFailed(id: string, error: string): Promise<IPdfRequest | null> {
    try {
      return await PdfRequest.findByIdAndUpdate(
        id,
        {
          status: 'failed',
          error,
          completedAt: new Date()
        },
        { new: true }
      );
    } catch (error) {
      logger.error('Error marking PDF as failed:', error);
      throw error;
    }
  }
}