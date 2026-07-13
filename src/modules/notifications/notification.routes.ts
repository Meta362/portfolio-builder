// src/modules/notifications/notification.routes.ts
import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { authenticate, authorize } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

const router = Router();
const controller = new NotificationController();

// All routes require authentication
router.use(authenticate);

// Preferences
router.get('/preferences', controller.getPreferences);
router.put('/preferences', validate(UpdatePreferenceDto), controller.updatePreferences);

// Notification CRUD
router.get('/', controller.getUserNotifications);
router.get('/stats', controller.getStats);
router.get('/:id', controller.getById);

// Admin only - create notification
router.post('/', authorize('admin'), validate(CreateNotificationDto), controller.create);

// Read/Unread
router.put('/:id/read', controller.markAsRead);
router.post('/read-all', controller.markAllAsRead);

// Delete
router.delete('/:id', controller.delete);
router.delete('/all', controller.deleteAll);

export default router;