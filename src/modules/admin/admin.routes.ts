// src/modules/admin/admin.routes.ts
import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate, authorize } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { CreateSystemConfigDto, UpdateSystemConfigDto } from './dto/system-config.dto';
import { CreateAnnouncementDto, UpdateAnnouncementDto } from './dto/announcement.dto';

const router = Router();
const controller = new AdminController();

// All routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// ==================== DASHBOARD ====================
router.get('/dashboard', controller.getDashboard);
router.get('/logs', controller.getLogs);

// ==================== SYSTEM CONFIG ====================
router.get('/config/:key', controller.getConfig);
router.get('/configs/category/:category', controller.getConfigsByCategory);
router.get('/configs/public', controller.getPublicConfigs);
router.post('/config', validate(CreateSystemConfigDto), controller.setConfig);
router.put('/config/:key', validate(UpdateSystemConfigDto), controller.updateConfig);
router.delete('/config/:key', controller.deleteConfig);

// ==================== ANNOUNCEMENTS ====================
router.get('/announcements', controller.getAnnouncements);
router.get('/announcements/active', controller.getActiveAnnouncements);
router.get('/announcements/:id', controller.getAnnouncementById);
router.post('/announcements', validate(CreateAnnouncementDto), controller.createAnnouncement);
router.put('/announcements/:id', validate(UpdateAnnouncementDto), controller.updateAnnouncement);
router.delete('/announcements/:id', controller.deleteAnnouncement);

// ==================== USER MANAGEMENT ====================
router.post('/users/:userId/suspend', controller.suspendUser);
router.post('/users/:userId/restore', controller.restoreUser);
router.put('/users/:userId/role', controller.changeUserRole);

// ==================== PORTFOLIO MANAGEMENT ====================
router.delete('/portfolios/:portfolioId', controller.deletePortfolio);

export default router;