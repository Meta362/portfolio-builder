// src/modules/admin/admin.repository.ts
import { AdminLog, AdminAction, IAdminLog } from './models/admin-log.model';
import { SystemConfig, ISystemConfig } from './models/system-config.model';
import { Announcement, IAnnouncement, AnnouncementStatus } from './models/announcement.model';
import { User } from '../../models/User.model';
import { Portfolio } from '../portfolios/models/portfolio.model';
import { AnalyticsEvent } from '../analytics/models/analytics-event.model';
import { AnalyticsSession } from '../analytics/models/analytics-session.model';
import { AdminStatsDto } from './dto/admin-stats.dto';
import logger from '../../config/logger';

export class AdminRepository {
  /**
   * Create admin log
   */
  async createLog(data: any): Promise<IAdminLog> {
    try {
      const log = new AdminLog(data);
      await log.save();
      return log;
    } catch (error) {
      logger.error('Error creating admin log:', error);
      throw error;
    }
  }

  /**
   * Get admin logs
   */
  async getLogs(query: any) {
    try {
      const { adminId, action, page = 1, limit = 50 } = query;
      
      const filter: any = {};
      if (adminId) filter.adminId = adminId;
      if (action) filter.action = action;
      
      const [logs, total] = await Promise.all([
        AdminLog.find(filter)
          .sort({ timestamp: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        AdminLog.countDocuments(filter),
      ]);
      
      return { logs, total, page, limit, pages: Math.ceil(total / limit) };
    } catch (error) {
      logger.error('Error getting admin logs:', error);
      throw error;
    }
  }

  /**
   * Get system config
   */
  async getConfig(key: string): Promise<ISystemConfig | null> {
    try {
      return await SystemConfig.findOne({ key });
    } catch (error) {
      logger.error('Error getting system config:', error);
      throw error;
    }
  }

  /**
   * Get all system configs by category
   */
  async getConfigsByCategory(category: string): Promise<ISystemConfig[]> {
    try {
      return await SystemConfig.find({ category }).sort({ key: 1 });
    } catch (error) {
      logger.error('Error getting system configs:', error);
      throw error;
    }
  }

  /**
   * Get public system configs
   */
  async getPublicConfigs(): Promise<ISystemConfig[]> {
    try {
      return await SystemConfig.find({ isPublic: true }).sort({ key: 1 });
    } catch (error) {
      logger.error('Error getting public system configs:', error);
      throw error;
    }
  }

  /**
   * Set system config
   */
  async setConfig(data: any): Promise<ISystemConfig> {
    try {
      const config = await SystemConfig.findOneAndUpdate(
        { key: data.key },
        { $set: data },
        { new: true, upsert: true }
      );
      return config;
    } catch (error) {
      logger.error('Error setting system config:', error);
      throw error;
    }
  }

  /**
   * Delete system config
   */
  async deleteConfig(key: string): Promise<void> {
    try {
      await SystemConfig.deleteOne({ key });
    } catch (error) {
      logger.error('Error deleting system config:', error);
      throw error;
    }
  }

  /**
   * Create announcement
   */
  async createAnnouncement(data: any): Promise<IAnnouncement> {
    try {
      const announcement = new Announcement(data);
      await announcement.save();
      return announcement;
    } catch (error) {
      logger.error('Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Get announcements
   */
  async getAnnouncements(query: any) {
    try {
      const { status, priority, page = 1, limit = 20 } = query;
      
      const filter: any = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      
      const [announcements, total] = await Promise.all([
        Announcement.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Announcement.countDocuments(filter),
      ]);
      
      return { announcements, total, page, limit, pages: Math.ceil(total / limit) };
    } catch (error) {
      logger.error('Error getting announcements:', error);
      throw error;
    }
  }

  /**
   * Get active announcements
   */
  async getActiveAnnouncements(): Promise<IAnnouncement[]> {
    try {
      const now = new Date();
      return await Announcement.find({
        status: AnnouncementStatus.PUBLISHED,
        publishedAt: { $lte: now },
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gte: now } },
        ],
      }).sort({ priority: -1, createdAt: -1 });
    } catch (error) {
      logger.error('Error getting active announcements:', error);
      throw error;
    }
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string): Promise<IAnnouncement | null> {
    try {
      return await Announcement.findById(id);
    } catch (error) {
      logger.error('Error getting announcement by ID:', error);
      throw error;
    }
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(id: string, data: any): Promise<IAnnouncement | null> {
    try {
      return await Announcement.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true }
      );
    } catch (error) {
      logger.error('Error updating announcement:', error);
      throw error;
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id: string): Promise<void> {
    try {
      await Announcement.findByIdAndDelete(id);
    } catch (error) {
      logger.error('Error deleting announcement:', error);
      throw error;
    }
  }

  /**
   * Increment announcement views
   */
  async incrementAnnouncementViews(id: string): Promise<void> {
    try {
      await Announcement.findByIdAndUpdate(id, {
        $inc: { 'metadata.views': 1 },
      });
    } catch (error) {
      logger.error('Error incrementing announcement views:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard stats
   */
  async getDashboardStats(): Promise<AdminStatsDto> {
    try {
      const now = new Date();
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // User stats
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        newUsersToday,
        subscriptionDistribution,
      ] = await Promise.all([
        User.countDocuments({ deletedAt: null }),
        User.countDocuments({ 
          deletedAt: null,
          'metadata.lastLogin': { $gte: thirtyDaysAgo },
        }),
        User.countDocuments({ deletedAt: null, isEmailVerified: true }),
        User.countDocuments({ 
          deletedAt: null,
          createdAt: { $gte: startOfDay },
        }),
        User.aggregate([
          { $match: { deletedAt: null } },
          { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } },
        ]),
      ]);

      // Portfolio stats
      const [
        totalPortfolios,
        publishedPortfolios,
        draftPortfolios,
        archivedPortfolios,
        newPortfoliosToday,
      ] = await Promise.all([
        Portfolio.countDocuments({ isDeleted: false }),
        Portfolio.countDocuments({ isDeleted: false, status: 'published' }),
        Portfolio.countDocuments({ isDeleted: false, status: 'draft' }),
        Portfolio.countDocuments({ isDeleted: false, status: 'archived' }),
        Portfolio.countDocuments({
          isDeleted: false,
          createdAt: { $gte: startOfDay },
        }),
      ]);

      // Analytics stats
      const [
        totalEvents,
        activeSessions,
        totalViews,
        totalDownloads,
        totalContacts,
      ] = await Promise.all([
        AnalyticsEvent.countDocuments({ timestamp: { $gte: thirtyDaysAgo } }),
        AnalyticsSession.countDocuments({ active: true }),
        Portfolio.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: null, total: { $sum: '$analytics.views' } } },
        ]),
        Portfolio.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: null, total: { $sum: '$analytics.downloads' } } },
        ]),
        Portfolio.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: null, total: { $sum: '$analytics.contacts' } } },
        ]),
      ]);

      // AI stats
      const aiStats = await AnalyticsEvent.aggregate([
        {
          $match: {
            eventType: 'ai.request',
            timestamp: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            tokens: { $sum: '$properties.tokens' },
            cost: { $sum: '$properties.cost' },
          },
        },
      ]);

      // System stats
      const systemStats = {
        uptime: process.uptime(),
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          free: Math.round((process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) / 1024 / 1024),
        },
        cpu: process.cpuUsage().user / 1000000,
        databaseSize: 0, // Can be calculated from MongoDB
      };

      const subscriptionMap: Record<string, number> = {};
      subscriptionDistribution.forEach((item: any) => {
        subscriptionMap[item._id] = item.count;
      });

      return {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          newToday: newUsersToday,
          bySubscription: subscriptionMap,
        },
        portfolios: {
          total: totalPortfolios,
          published: publishedPortfolios,
          draft: draftPortfolios,
          archived: archivedPortfolios,
          newToday: newPortfoliosToday,
        },
        analytics: {
          totalEvents: totalEvents,
          activeSessions: activeSessions,
          totalViews: totalViews[0]?.total || 0,
          totalDownloads: totalDownloads[0]?.total || 0,
          totalContacts: totalContacts[0]?.total || 0,
        },
        ai: {
          totalRequests: aiStats[0]?.total || 0,
          totalTokens: aiStats[0]?.tokens || 0,
          averageCost: aiStats[0]?.cost ? (aiStats[0].cost / aiStats[0].total) : 0,
        },
        system: systemStats,
        period: {
          start: thirtyDaysAgo,
          end: now,
        },
      };
    } catch (error) {
      logger.error('Error getting dashboard stats:', error);
      throw error;
    }
  }
}