// src/modules/admin/admin.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { AdminService } from './admin.service';
import { CreateSystemConfigDto, UpdateSystemConfigDto } from './dto/system-config.dto';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AdminController {
  private adminService: AdminService;

  constructor() {
    this.adminService = new AdminService();
  }

  // ==================== DASHBOARD ====================

  /**
   * Get dashboard stats
   * GET /api/v1/admin/dashboard
   */
  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.adminService.getDashboardStats();
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get admin logs
   * GET /api/v1/admin/logs
   */
  getLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const query = req.query;
      
      const result = await this.adminService.getLogs(adminId, query);
      
      res.status(200).json({
        success: true,
        data: result.logs,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== SYSTEM CONFIG ====================

  /**
   * Get system config
   * GET /api/v1/admin/config/:key
   */
  getConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const key = req.params.key;
      
      const config = await this.adminService.getConfig(key);
      
      res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get configs by category
   * GET /api/v1/admin/configs/category/:category
   */
  getConfigsByCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const category = req.params.category;
      
      const configs = await this.adminService.getConfigsByCategory(category);
      
      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get public configs
   * GET /api/v1/admin/configs/public
   */
  getPublicConfigs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const configs = await this.adminService.getPublicConfigs();
      
      res.status(200).json({
        success: true,
        data: configs,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set system config
   * POST /api/v1/admin/config
   */
  setConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const data: CreateSystemConfigDto = req.body;
      
      const config = await this.adminService.setConfig(adminId, data);
      
      res.status(201).json({
        success: true,
        message: 'Config set successfully',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update system config
   * PUT /api/v1/admin/config/:key
   */
  updateConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const key = req.params.key;
      const data: UpdateSystemConfigDto = req.body;
      
      const config = await this.adminService.updateConfig(adminId, key, data);
      
      res.status(200).json({
        success: true,
        message: 'Config updated successfully',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete system config
   * DELETE /api/v1/admin/config/:key
   */
  deleteConfig = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const key = req.params.key;
      
      await this.adminService.deleteConfig(adminId, key);
      
      res.status(200).json({
        success: true,
        message: 'Config deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== ANNOUNCEMENTS ====================

  /**
   * Create announcement
   * POST /api/v1/admin/announcements
   */
  createAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const data: CreateAnnouncementDto = req.body;
      
      const announcement = await this.adminService.createAnnouncement(adminId, data);
      
      res.status(201).json({
        success: true,
        message: 'Announcement created successfully',
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get announcements
   * GET /api/v1/admin/announcements
   */
  getAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = req.query;
      
      const result = await this.adminService.getAnnouncements(query);
      
      res.status(200).json({
        success: true,
        data: result.announcements,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get active announcements (public)
   * GET /api/v1/admin/announcements/active
   */
  getActiveAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const announcements = await this.adminService.getActiveAnnouncements();
      
      res.status(200).json({
        success: true,
        data: announcements,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get announcement by ID
   * GET /api/v1/admin/announcements/:id
   */
  getAnnouncementById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      
      const announcement = await this.adminService.getAnnouncementById(id);
      
      // Increment views
      await this.adminService.incrementAnnouncementViews(id);
      
      res.status(200).json({
        success: true,
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update announcement
   * PUT /api/v1/admin/announcements/:id
   */
  updateAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const id = req.params.id;
      const data: UpdateAnnouncementDto = req.body;
      
      const announcement = await this.adminService.updateAnnouncement(adminId, id, data);
      
      res.status(200).json({
        success: true,
        message: 'Announcement updated successfully',
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete announcement
   * DELETE /api/v1/admin/announcements/:id
   */
  deleteAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const id = req.params.id;
      
      await this.adminService.deleteAnnouncement(adminId, id);
      
      res.status(200).json({
        success: true,
        message: 'Announcement deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== USER MANAGEMENT (ADMIN) ====================

  /**
   * Suspend user
   * POST /api/v1/admin/users/:userId/suspend
   */
  suspendUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const userId = req.params.userId;
      const { reason } = req.body;
      
      const user = await this.adminService.suspendUser(adminId, userId, reason);
      
      res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Restore user
   * POST /api/v1/admin/users/:userId/restore
   */
  restoreUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const userId = req.params.userId;
      
      const user = await this.adminService.restoreUser(adminId, userId);
      
      res.status(200).json({
        success: true,
        message: 'User restored successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change user role
   * PUT /api/v1/admin/users/:userId/role
   */
  changeUserRole = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const userId = req.params.userId;
      const { roles } = req.body;
      
      if (!roles || !Array.isArray(roles)) {
        throw new BadRequestException('Roles must be an array');
      }
      
      const user = await this.adminService.changeUserRole(adminId, userId, roles);
      
      res.status(200).json({
        success: true,
        message: 'User role updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete portfolio (Admin)
   * DELETE /api/v1/admin/portfolios/:portfolioId
   */
  deletePortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId!;
      const portfolioId = req.params.portfolioId;
      
      const portfolio = await this.adminService.deletePortfolio(adminId, portfolioId);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio deleted successfully',
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };
}