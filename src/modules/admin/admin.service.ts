// src/modules/admin/admin.service.ts
import { AdminRepository } from './admin.repository';
import { User } from '../../models/User.model';
import { Portfolio } from '../portfolios/models/portfolio.model';
import { CreateSystemConfigDto, UpdateSystemConfigDto } from './dto/system-config.dto';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { AdminAction } from './models/admin-log.model';
import { BadRequestException, NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AdminService {
  private repository: AdminRepository;

  constructor() {
    this.repository = new AdminRepository();
  }

  /**
   * Get dashboard stats
   */
  async getDashboardStats() {
    return await this.repository.getDashboardStats();
  }

  /**
   * Get admin logs
   */
  async getLogs(adminId: string, query: any) {
    return await this.repository.getLogs({ ...query, adminId });
  }

  /**
   * Log admin action
   */
  async logAction(data: {
    adminId: string;
    action: AdminAction;
    targetUserId?: string;
    targetPortfolioId?: string;
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }) {
    return await this.repository.createLog(data);
  }

  /**
   * Get system config
   */
  async getConfig(key: string) {
    return await this.repository.getConfig(key);
  }

  /**
   * Get configs by category
   */
  async getConfigsByCategory(category: string) {
    return await this.repository.getConfigsByCategory(category);
  }

  /**
   * Get public configs
   */
  async getPublicConfigs() {
    return await this.repository.getPublicConfigs();
  }

  /**
   * Set system config
   */
  async setConfig(adminId: string, data: CreateSystemConfigDto) {
    const config = await this.repository.setConfig({
      ...data,
      updatedBy: adminId,
    });
    
    await this.logAction({
      adminId,
      action: AdminAction.SYSTEM_CONFIG_UPDATED,
      details: { key: data.key, value: data.value },
    });
    
    return config;
  }

  /**
   * Update system config
   */
  async updateConfig(adminId: string, key: string, data: UpdateSystemConfigDto) {
    const existing = await this.repository.getConfig(key);
    if (!existing) {
      throw new NotFoundException('Config not found');
    }
    
    const config = await this.repository.setConfig({
      ...existing.toObject(),
      ...data,
      updatedBy: adminId,
    });
    
    await this.logAction({
      adminId,
      action: AdminAction.SYSTEM_CONFIG_UPDATED,
      details: { key, updated: data },
    });
    
    return config;
  }

  /**
   * Delete system config
   */
  async deleteConfig(adminId: string, key: string) {
    await this.repository.deleteConfig(key);
    
    await this.logAction({
      adminId,
      action: AdminAction.SYSTEM_CONFIG_UPDATED,
      details: { key, action: 'deleted' },
    });
  }

  /**
   * Create announcement
   */
  async createAnnouncement(adminId: string, data: CreateAnnouncementDto) {
    const announcement = await this.repository.createAnnouncement({
      ...data,
      authorId: adminId,
    });
    
    await this.logAction({
      adminId,
      action: AdminAction.ANNOUNCEMENT_CREATED,
      details: { announcementId: announcement._id, title: data.title },
    });
    
    return announcement;
  }

  /**
   * Get announcements
   */
  async getAnnouncements(query: any) {
    return await this.repository.getAnnouncements(query);
  }

  /**
   * Get active announcements
   */
  async getActiveAnnouncements() {
    return await this.repository.getActiveAnnouncements();
  }

  /**
   * Get announcement by ID
   */
  async getAnnouncementById(id: string) {
    const announcement = await this.repository.getAnnouncementById(id);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    return announcement;
  }

  /**
   * Update announcement
   */
  async updateAnnouncement(adminId: string, id: string, data: UpdateAnnouncementDto) {
    const announcement = await this.repository.updateAnnouncement(id, data);
    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }
    
    await this.logAction({
      adminId,
      action: AdminAction.ANNOUNCEMENT_UPDATED,
      details: { announcementId: id },
    });
    
    return announcement;
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(adminId: string, id: string) {
    await this.repository.deleteAnnouncement(id);
    
    await this.logAction({
      adminId,
      action: AdminAction.ANNOUNCEMENT_DELETED,
      details: { announcementId: id },
    });
  }

  /**
   * Increment announcement views
   */
  async incrementAnnouncementViews(id: string) {
    await this.repository.incrementAnnouncementViews(id);
  }

  /**
   * Suspend user (Admin)
   */
  async suspendUser(adminId: string, userId: string, reason?: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    user.deletedAt = new Date();
    await user.save();
    
    await this.logAction({
      adminId,
      action: AdminAction.USER_SUSPENDED,
      targetUserId: userId,
      details: { reason },
    });
    
    return user;
  }

  /**
   * Restore user (Admin)
   */
  async restoreUser(adminId: string, userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    user.deletedAt = null;
    await user.save();
    
    await this.logAction({
      adminId,
      action: AdminAction.USER_RESTORED,
      targetUserId: userId,
    });
    
    return user;
  }

  /**
   * Change user role (Admin)
   */
  async changeUserRole(adminId: string, userId: string, roles: string[]) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    const oldRoles = user.roles;
    user.roles = roles;
    await user.save();
    
    await this.logAction({
      adminId,
      action: AdminAction.USER_ROLE_CHANGED,
      targetUserId: userId,
      details: { oldRoles, newRoles: roles },
    });
    
    return user;
  }

  /**
   * Delete portfolio (Admin)
   */
  async deletePortfolio(adminId: string, portfolioId: string) {
    const portfolio = await Portfolio.findById(portfolioId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    
    portfolio.isDeleted = true;
    portfolio.deletedAt = new Date();
    await portfolio.save();
    
    await this.logAction({
      adminId,
      action: AdminAction.PORTFOLIO_DELETED,
      targetPortfolioId: portfolioId,
      details: { title: portfolio.title },
    });
    
    return portfolio;
  }
}