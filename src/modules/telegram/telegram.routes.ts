// src/modules/telegram/telegram.routes.ts
import { Router } from 'express';
import { TelegramController } from './telegram.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { LinkTelegramDto } from './dto/link-telegram.dto';
import { UpdateTelegramSettingsDto } from './dto/update-telegram-settings.dto';

const router = Router();
const controller = new TelegramController();

// All routes require authentication
router.use(authenticate);

// Link/unlink
router.post('/link', validate(LinkTelegramDto), controller.linkAccount);
router.post('/unlink', controller.unlinkAccount);

// Settings
router.put('/settings', validate(UpdateTelegramSettingsDto), controller.updateSettings);
router.get('/settings', controller.getSettings);

// Notifications
router.get('/notifications', controller.getNotifications);
router.put('/notifications/:id/read', controller.markAsRead);
router.post('/notifications/read-all', controller.markAllAsRead);

export default router;