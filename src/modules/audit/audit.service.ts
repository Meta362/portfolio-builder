// src/modules/audit/audit.service.ts
import { AuditRepository } from './audit.repository';
import { AuditQueryDto, AuditLogResponseDto } from './dto/audit-query.dto';
import { AuditAction, AuditStatus } from './models/audit-log.model';
import { BadRequestException, NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AuditService {
  private repository: AuditRepository;

  constructor() {
    this.repository = new AuditRepository();
  }

  /**
   * Create audit log
   */
  async createLog(data: {
    userId: string;
    action: AuditAction;
    status?: AuditStatus;
    resource: string;
    resourceId?: string;
    ip?: string;
    userAgent?: string;
    details?: Record<string, any>;
    changes?: Array<{ field: string; oldValue: any; newValue: any }>;
    metadata?: Record<string, any>;
  }) {
    try {
      // Parse user agent
      const userAgentInfo = this.parseUserAgent(data.userAgent || '');
      
      const logData = {
        userId: data.userId,
        action: data.action,
        status: data.status || AuditStatus.SUCCESS,
        resource: data.resource,
        resourceId: data.resourceId,
        ip: data.ip,
        userAgent: data.userAgent,
        device: userAgentInfo.device,
        platform: userAgentInfo.platform,
        browser: userAgentInfo.browser,
        details: data.details || {},
        changes: data.changes || [],
        metadata: data.metadata || {},
        timestamp: new Date(),
      };

      return await this.repository.createLog(logData);
    } catch (error) {
      logger.error('Error creating audit log:', error);
      throw error;
    }
  }

  /**
   * Parse user agent
   */
  private parseUserAgent(userAgent: string) {
    const info = {
      device: 'Unknown',
      platform: 'Unknown',
      browser: 'Unknown',
    };

    if (!userAgent) return info;

    // Detect device
    if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
      info.device = 'Mobile';
    } else if (/Tablet|iPad/i.test(userAgent)) {
      info.device = 'Tablet';
    } else {
      info.device = 'Desktop';
    }

    // Detect platform
    if (/Windows/i.test(userAgent)) {
      info.platform = 'Windows';
    } else if (/Mac|Macintosh/i.test(userAgent)) {
      info.platform = 'macOS';
    } else if (/Linux/i.test(userAgent)) {
      info.platform = 'Linux';
    } else if (/Android/i.test(userAgent)) {
      info.platform = 'Android';
    } else if (/iOS|iPhone|iPad/i.test(userAgent)) {
      info.platform = 'iOS';
    }

    // Detect browser
    if (/Chrome/i.test(userAgent) && !/Edge|Edg/i.test(userAgent)) {
      info.browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
      info.browser = 'Firefox';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      info.browser = 'Safari';
    } else if (/Edge|Edg/i.test(userAgent)) {
      info.browser = 'Edge';
    } else if (/Opera|OPR/i.test(userAgent)) {
      info.browser = 'Opera';
    }

    return info;
  }

  /**
   * Get audit logs
   */
  async getLogs(userId: string, query: AuditQueryDto) {
    try {
      const result = await this.repository.getLogs({ ...query, userId });
      
      return {
        logs: result.logs.map((log: any) => new AuditLogResponseDto(log)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
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
      const result = await this.repository.getUserLogs(userId, query);
      
      return {
        logs: result.logs.map((log: any) => new AuditLogResponseDto(log)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      };
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
      const result = await this.repository.getResourceLogs(resource, resourceId, query);
      
      return {
        logs: result.logs.map((log: any) => new AuditLogResponseDto(log)),
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      };
    } catch (error) {
      logger.error('Error getting resource audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit stats
   */
  async getStats(userId: string, startDate?: Date, endDate?: Date) {
    try {
      const stats = await this.repository.getStats(
        startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate || new Date()
      );
      return stats;
    } catch (error) {
      logger.error('Error getting audit stats:', error);
      throw error;
    }
  }

  /**
   * Export user data (GDPR)
   */
  async exportUserData(userId: string) {
    try {
      const logs = await this.repository.getUserLogs(userId, {
        limit: 1000,
        page: 1,
      });

      return {
        userId,
        exportedAt: new Date(),
        data: {
          logs: logs.logs,
          totalLogs: logs.total,
        },
      };
    } catch (error) {
      logger.error('Error exporting user data:', error);
      throw error;
    }
  }

  /**
   * Delete user data (GDPR - Right to be forgotten)
   */
  async deleteUserData(userId: string): Promise<{ deletedCount: number }> {
    try {
      const deletedCount = await this.repository.deleteUserLogs(userId);
      logger.info(`Deleted ${deletedCount} audit logs for user ${userId}`);
      return { deletedCount };
    } catch (error) {
      logger.error('Error deleting user data:', error);
      throw error;
    }
  }
}
export const auditService = new AuditService();