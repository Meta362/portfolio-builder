// src/modules/ai/ai.repository.ts
import { AiRequest, IAiRequest } from './models/ai-request.model';
import logger from '../../config/logger';

export class AiRepository {
  /**
   * Create AI request record
   */
  async createRequest(data: Partial<IAiRequest>): Promise<IAiRequest> {
    try {
      const request = new AiRequest(data);
      await request.save();
      return request;
    } catch (error) {
      logger.error('Error creating AI request:', error);
      throw error;
    }
  }

  /**
   * Update AI request with result
   */
  async updateRequest(
    id: string,
    data: {
      output?: any;
      cost?: any;
      performance?: any;
      status: 'completed' | 'failed';
      error?: string;
      completedAt?: Date;
    }
  ): Promise<IAiRequest | null> {
    try {
      return await AiRequest.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating AI request:', error);
      throw error;
    }
  }

  /**
   * Get AI requests by user
   */
  async getUserRequests(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<IAiRequest[]> {
    try {
      return await AiRequest.find({ userId })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);
    } catch (error) {
      logger.error('Error getting user AI requests:', error);
      throw error;
    }
  }

  /**
   * Get AI requests by portfolio
   */
  async getPortfolioRequests(
    portfolioId: string,
    type?: string
  ): Promise<IAiRequest[]> {
    try {
      const query: any = { portfolioId };
      if (type) {
        query.type = type;
      }
      return await AiRequest.find(query)
        .sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error getting portfolio AI requests:', error);
      throw error;
    }
  }

  /**
   * Get AI usage stats for user
   */
  async getUserUsageStats(userId: string): Promise<any> {
    try {
      const stats = await AiRequest.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
            totalTokens: { $sum: '$cost.tokens' },
            totalCost: { $sum: '$cost.estimatedCost' },
            avgDuration: { $avg: '$performance.duration' }
          }
        }
      ]);
      
      const total = await AiRequest.countDocuments({ userId });
      
      return {
        totalRequests: total,
        byType: stats,
        totalCost: stats.reduce((sum: number, s: any) => sum + s.totalCost, 0),
        totalTokens: stats.reduce((sum: number, s: any) => sum + s.totalTokens, 0)
      };
    } catch (error) {
      logger.error('Error getting user usage stats:', error);
      throw error;
    }
  }

  /**
   * Get request by ID
   */
  async getRequestById(id: string): Promise<IAiRequest | null> {
    try {
      return await AiRequest.findById(id);
    } catch (error) {
      logger.error('Error getting AI request by ID:', error);
      throw error;
    }
  }
}