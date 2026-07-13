// src/modules/analytics/analytics.repository.ts
import { AnalyticsEvent, IAnalyticsEvent, AnalyticsEventType } from './models/analytics-event.model';
import { AnalyticsSession, IAnalyticsSession } from './models/analytics-session.model';
import { TrackEventDto } from './dto/track-event.dto';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import logger from '../../config/logger';
import { v4 as uuidv4 } from 'uuid';

export class AnalyticsRepository {
  /**
   * Track event
   */
  async trackEvent(userId: string, dto: TrackEventDto, sessionId?: string): Promise<IAnalyticsEvent> {
    try {
      const event = new AnalyticsEvent({
        userId,
        sessionId: sessionId || uuidv4(),
        eventType: dto.eventType,
        source: dto.source || 'web',
        timestamp: new Date(),
        metadata: dto.metadata || {},
        properties: dto.properties || {},
        value: dto.value,
        category: dto.category,
        label: dto.label,
      });
      
      await event.save();
      return event;
    } catch (error) {
      logger.error('Error tracking event:', error);
      throw error;
    }
  }

  /**
   * Create session
   */
  async createSession(userId: string, sessionId: string, data: any): Promise<IAnalyticsSession> {
    try {
      const session = new AnalyticsSession({
        userId,
        sessionId,
        startTime: new Date(),
        active: true,
        device: data.device || {},
        location: data.location || {},
        events: [],
        pageViews: 0,
      });
      
      await session.save();
      return session;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Update session
   */
  async updateSession(sessionId: string, eventType: string): Promise<void> {
    try {
      await AnalyticsSession.findOneAndUpdate(
        { sessionId },
        {
          $push: { events: eventType },
          $inc: { pageViews: 1 },
          $set: { active: true, updatedAt: new Date() },
        }
      );
    } catch (error) {
      logger.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * End session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = await AnalyticsSession.findOne({ sessionId });
      if (session) {
        const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000);
        await AnalyticsSession.findOneAndUpdate(
          { sessionId },
          {
            $set: {
              active: false,
              endTime: new Date(),
              duration,
            },
          }
        );
      }
    } catch (error) {
      logger.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Get analytics stats
   */
  async getStats(userId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const match = {
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      };

      const [totalEvents, uniqueUsers, eventsByType, eventsByDay, topUsers] = await Promise.all([
        AnalyticsEvent.countDocuments(match),
        AnalyticsEvent.distinct('userId', match).then(users => users.length),
        AnalyticsEvent.aggregate([
          { $match: match },
          { $group: { _id: '$eventType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        AnalyticsEvent.aggregate([
          { $match: match },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        AnalyticsEvent.aggregate([
          { $match: match },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      // Format events by type
      const eventsByTypeMap: Record<string, number> = {};
      eventsByType.forEach((item: any) => {
        eventsByTypeMap[item._id] = item.count;
      });

      return {
        totalEvents,
        uniqueUsers,
        eventsByType: eventsByTypeMap,
        eventsByDay: eventsByDay.map((item: any) => ({
          date: item._id,
          count: item.count,
        })),
        topUsers: topUsers.map((item: any) => ({
          userId: item._id,
          count: item.count,
        })),
        period: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error) {
      logger.error('Error getting analytics stats:', error);
      throw error;
    }
  }

  /**
   * Get portfolio analytics
   */
  async getPortfolioStats(portfolioId: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const match = {
        'properties.portfolioId': portfolioId,
        timestamp: { $gte: startDate, $lte: endDate },
      };

      const [views, uniqueViews, downloads, contacts] = await Promise.all([
        AnalyticsEvent.countDocuments({
          ...match,
          eventType: AnalyticsEventType.PORTFOLIO_VIEWED,
        }),
        AnalyticsEvent.distinct('userId', {
          ...match,
          eventType: AnalyticsEventType.PORTFOLIO_VIEWED,
        }).then(users => users.length),
        AnalyticsEvent.countDocuments({
          ...match,
          eventType: AnalyticsEventType.PDF_DOWNLOADED,
        }),
        AnalyticsEvent.countDocuments({
          ...match,
          eventType: AnalyticsEventType.CONTACT_RECEIVED,
        }),
      ]);

      // Get daily breakdown
      const viewsByDay = await AnalyticsEvent.aggregate([
        { $match: { ...match, eventType: AnalyticsEventType.PORTFOLIO_VIEWED } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const downloadsByDay = await AnalyticsEvent.aggregate([
        { $match: { ...match, eventType: AnalyticsEventType.PDF_DOWNLOADED } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      const contactsByDay = await AnalyticsEvent.aggregate([
        { $match: { ...match, eventType: AnalyticsEventType.CONTACT_RECEIVED } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Get share counts
      const shares = await AnalyticsEvent.countDocuments({
        ...match,
        eventType: {
          $in: [
            AnalyticsEventType.SHARE_LINKEDIN,
            AnalyticsEventType.SHARE_TWITTER,
            AnalyticsEventType.SHARE_FACEBOOK,
          ],
        },
      });

      return {
        views: {
          total: views,
          unique: uniqueViews,
          byDay: viewsByDay.map((item: any) => ({
            date: item._id,
            count: item.count,
          })),
        },
        downloads: {
          total: downloads,
          byDay: downloadsByDay.map((item: any) => ({
            date: item._id,
            count: item.count,
          })),
        },
        contacts: {
          total: contacts,
          byDay: contactsByDay.map((item: any) => ({
            date: item._id,
            count: item.count,
          })),
        },
        shares: {
          total: shares,
        },
        period: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error) {
      logger.error('Error getting portfolio analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time stats (last 24 hours)
   */
  async getRealtimeStats(userId: string): Promise<any> {
    try {
      const startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const [events, sessions, topEvents] = await Promise.all([
        AnalyticsEvent.countDocuments({
          userId,
          timestamp: { $gte: startDate },
        }),
        AnalyticsSession.countDocuments({
          userId,
          startTime: { $gte: startDate },
          active: true,
        }),
        AnalyticsEvent.aggregate([
          {
            $match: {
              userId,
              timestamp: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: '$eventType',
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      // Get hourly breakdown
      const hourlyData = await AnalyticsEvent.aggregate([
        {
          $match: {
            userId,
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              hour: { $hour: '$timestamp' },
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1, '_id.hour': 1 } },
      ]);

      return {
        totalEvents: events,
        activeSessions: sessions,
        topEvents: topEvents.map((item: any) => ({
          eventType: item._id,
          count: item.count,
        })),
        hourlyData: hourlyData.map((item: any) => ({
          hour: item._id.hour,
          date: item._id.date,
          count: item.count,
        })),
        period: {
          start: startDate,
          end: new Date(),
        },
      };
    } catch (error) {
      logger.error('Error getting realtime stats:', error);
      throw error;
    }
  }

  /**
   * Get user retention
   */
  async getRetentionStats(userId: string): Promise<any> {
    try {
      const now = new Date();
      const periods = [7, 14, 30, 60, 90];
      
      const result: any = {
        currentActive: 0,
        retention: [],
      };

      // Get active sessions in last 30 days
      const activeSessions = await AnalyticsSession.find({
        userId,
        startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      });

      // Get unique days active
      const activeDays = new Set();
      activeSessions.forEach(session => {
        const date = session.startTime.toISOString().split('T')[0];
        activeDays.add(date);
      });

      result.currentActive = activeSessions.length;

      // Calculate retention for each period
      for (const period of periods) {
        const cutoff = new Date(Date.now() - period * 24 * 60 * 60 * 1000);
        const count = await AnalyticsSession.countDocuments({
          userId,
          startTime: { $gte: cutoff },
        });
        
        const dayCount = activeSessions.filter(
          s => s.startTime >= cutoff
        ).length;

        result.retention.push({
          period: `${period}d`,
          activeUsers: dayCount,
          totalSessions: count,
        });
      }

      return result;
    } catch (error) {
      logger.error('Error getting retention stats:', error);
      throw error;
    }
  }
}