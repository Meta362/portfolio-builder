// src/modules/analytics/analytics.service.ts
import { AnalyticsRepository } from './analytics.repository';
import { TrackEventDto, TrackSessionDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { AnalyticsEventType } from './models/analytics-event.model';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor() {
    this.repository = new AnalyticsRepository();
  }

  /**
   * Track event
   */
  async trackEvent(userId: string, dto: TrackEventDto, sessionId?: string) {
    try {
      const event = await this.repository.trackEvent(userId, dto, sessionId);
      
      // Update session
      if (sessionId) {
        await this.repository.updateSession(sessionId, dto.eventType);
      }
      
      return event;
    } catch (error) {
      logger.error('Error tracking event:', error);
      throw error;
    }
  }

  /**
   * Track session
   */
  async trackSession(userId: string, dto: TrackSessionDto) {
    try {
      // Check if session exists
      const existing = await this.repository.createSession(
        userId,
        dto.sessionId,
        {
          device: dto.device,
          location: dto.location,
        }
      );
      
      return existing;
    } catch (error) {
      logger.error('Error tracking session:', error);
      throw error;
    }
  }

  /**
   * End session
   */
  async endSession(sessionId: string) {
    try {
      await this.repository.endSession(sessionId);
    } catch (error) {
      logger.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Get analytics stats
   */
  async getStats(userId: string, query: AnalyticsQueryDto) {
    try {
      const startDate = query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = query.endDate || new Date();
      
      return await this.repository.getStats(userId, startDate, endDate);
    } catch (error) {
      logger.error('Error getting analytics stats:', error);
      throw error;
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioStats(userId: string, portfolioId: string, query: AnalyticsQueryDto) {
    try {
      const startDate = query.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = query.endDate || new Date();
      
      // Verify portfolio ownership
      const { Portfolio } = require('../portfolios/models/portfolio.model');
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId });
      
      if (!portfolio) {
        throw new BadRequestException('Portfolio not found or you do not have permission');
      }
      
      return await this.repository.getPortfolioStats(portfolioId, startDate, endDate);
    } catch (error) {
      logger.error('Error getting portfolio analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time stats
   */
  async getRealtimeStats(userId: string) {
    try {
      return await this.repository.getRealtimeStats(userId);
    } catch (error) {
      logger.error('Error getting realtime stats:', error);
      throw error;
    }
  }

  /**
   * Get retention stats
   */
  async getRetentionStats(userId: string) {
    try {
      return await this.repository.getRetentionStats(userId);
    } catch (error) {
      logger.error('Error getting retention stats:', error);
      throw error;
    }
  }

  /**
   * Generate report
   */
  async generateReport(userId: string, format: 'json' | 'csv' = 'json') {
    try {
      const endDate = new Date();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const stats = await this.repository.getStats(userId, startDate, endDate);
      
      if (format === 'csv') {
        return this.convertToCSV(stats);
      }
      
      return stats;
    } catch (error) {
      logger.error('Error generating report:', error);
      throw error;
    }
  }

  /**
   * Convert stats to CSV
   */
  private convertToCSV(stats: any): string {
    const rows: string[] = [];
    
    // Header
    rows.push('Date,Event Type,Count,Unique Users');
    
    // Add events by day
    stats.eventsByDay.forEach((item: any) => {
      rows.push(`${item.date},Total,${item.count},`);
    });
    
    // Add events by type
    Object.entries(stats.eventsByType).forEach(([type, count]) => {
      rows.push(`${new Date().toISOString().split('T')[0]},${type},${count},`);
    });
    
    return rows.join('\n');
  }
}