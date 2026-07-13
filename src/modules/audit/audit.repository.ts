// src/modules/audit/audit.repository.ts
import { AuditLog, IAuditLog, AuditAction, AuditStatus } from './models/audit-log.model';
import { AuditQueryDto } from './dto/audit-query.dto';
import logger from '../../config/logger';

export class AuditRepository {
  /**
   * Create audit log
   */
  async createLog(data: any): Promise<IAuditLog> {
    try {
      const log = new AuditLog(data);
      await log.save();
      return log;
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Get audit logs with pagination
   */
  async getLogs(query: AuditQueryDto) {
    try {
      const { 
        userId, action, status, resource, resourceId, startDate, endDate,
        page = 1, limit = 20, sortBy = 'timestamp', sortOrder = 'desc'
      } = query;
      
      const filter: any = {};
      if (userId) filter.userId = userId;
      if (action) filter.action = action;
      if (status) filter.status = status;
      if (resource) filter.resource = resource;
      if (resourceId) filter.resourceId = resourceId;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = startDate;
        if (endDate) filter.timestamp.$lte = endDate;
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [logs, total] = await Promise.all([
        AuditLog.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        AuditLog.countDocuments(filter),
      ]);

      return {
        logs,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error getting audit logs:', error);
      throw error;
    }
  }

  /**
   * Get user audit logs
   */
  async getUserLogs(userId: string, query: AuditQueryDto) {
    try {
      return await this.getLogs({ ...query, userId });
    } catch (error) {
      logger.error('Error getting user audit logs:', error);
      throw error;
    }
  }

  /**
   * Get resource audit logs
   */
  async getResourceLogs(resource: string, resourceId: string, query: AuditQueryDto) {
    try {
      return await this.getLogs({ ...query, resource, resourceId });
    } catch (error) {
      logger.error('Error getting resource audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit stats
   */
  async getStats(startDate: Date, endDate: Date) {
    try {
      const match = {
        timestamp: { $gte: startDate, $lte: endDate },
      };

      const [total, byAction, byStatus, byUser] = await Promise.all([
        AuditLog.countDocuments(match),
        AuditLog.aggregate([
          { $match: match },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
        AuditLog.aggregate([
          { $match: match },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        AuditLog.aggregate([
          { $match: match },
          { $group: { _id: '$userId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      return {
        total,
        byAction: byAction.map((item: any) => ({
          action: item._id,
          count: item.count,
        })),
        byStatus: byStatus.map((item: any) => ({
          status: item._id,
          count: item.count,
        })),
        byUser: byUser.map((item: any) => ({
          userId: item._id,
          count: item.count,
        })),
        period: {
          start: startDate,
          end: endDate,
        },
      };
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      throw error;
    }
  }

  /**
   * Delete old logs (GDPR compliance)
   */
  async deleteOldLogs(beforeDate: Date): Promise<number> {
    try {
      const result = await AuditLog.deleteMany({
        timestamp: { $lt: beforeDate },
      });
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting old logs:', error);
      throw error;
    }
  }

  /**
   * Delete user logs (GDPR right to be forgotten)
   */
  async deleteUserLogs(userId: string): Promise<number> {
    try {
      const result = await AuditLog.deleteMany({ userId });
      return result.deletedCount;
    } catch (error) {
      logger.error('Error deleting user logs:', error);
      throw error;
    }
  }
}