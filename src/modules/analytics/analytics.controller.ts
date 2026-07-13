// src/modules/analytics/analytics.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { AnalyticsService } from './analytics.service';
import { TrackEventDto, TrackSessionDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor() {
    this.analyticsService = new AnalyticsService();
  }

  /**
   * Track event
   * POST /api/v1/analytics/track
   */
  trackEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: TrackEventDto = req.body;
      const sessionId = req.headers['x-session-id'] as string;
      
      const event = await this.analyticsService.trackEvent(userId, dto, sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Event tracked successfully',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Track session
   * POST /api/v1/analytics/session
   */
  trackSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: TrackSessionDto = req.body;
      
      const session = await this.analyticsService.trackSession(userId, dto);
      
      res.status(200).json({
        success: true,
        message: 'Session tracked successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * End session
   * POST /api/v1/analytics/session/end
   */
  endSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const sessionId = req.headers['x-session-id'] as string;
      
      if (!sessionId) {
        throw new BadRequestException('Session ID is required');
      }
      
      await this.analyticsService.endSession(sessionId);
      
      res.status(200).json({
        success: true,
        message: 'Session ended successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user analytics
   * GET /api/v1/analytics/user
   */
  getUserAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const query: AnalyticsQueryDto = req.query;
      
      const stats = await this.analyticsService.getStats(userId, query);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get portfolio analytics
   * GET /api/v1/analytics/portfolio/:portfolioId
   */
  getPortfolioAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const portfolioId = req.params.portfolioId;
      const query: AnalyticsQueryDto = req.query;
      
      const stats = await this.analyticsService.getPortfolioStats(userId, portfolioId, query);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get real-time stats
   * GET /api/v1/analytics/realtime
   */
  getRealtimeStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const stats = await this.analyticsService.getRealtimeStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get retention stats
   * GET /api/v1/analytics/retention
   */
  getRetentionStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const stats = await this.analyticsService.getRetentionStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate report
   * GET /api/v1/analytics/report
   */
  generateReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const format = (req.query.format as string) || 'json';
      
      const report = await this.analyticsService.generateReport(userId, format as 'json' | 'csv');
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-report-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(report);
        return;
      }
      
      res.status(200).json({
        success: true,
        data: report,
      });
    } catch (error) {
      next(error);
    }
  };
}