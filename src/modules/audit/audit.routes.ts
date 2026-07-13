// src/modules/audit/audit.routes.ts
import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate, authorize } from '../../core/middlewares/auth.middleware';
import { audit } from '../../core/middlewares/audit.middleware';
import { AuditAction } from './models/audit-log.model';

const router = Router();
const controller = new AuditController();

// All routes require authentication
router.use(authenticate);

// Admin routes
router.get(
  '/logs',
  authorize('admin'),
  audit({
    action: AuditAction.ADMIN_ACTION,
    resource: 'audit_logs',
  }),
  controller.getLogs
);

router.get(
  '/stats',
  authorize('admin'),
  audit({
    action: AuditAction.ADMIN_ACTION,
    resource: 'audit_stats',
  }),
  controller.getStats
);

router.get(
  '/user/:userId',
  audit({
    action: AuditAction.DATA_EXPORTED,
    resource: 'user_audit',
    getResourceId: (req) => req.params.userId,
  }),
  controller.getUserLogs
);

router.get(
  '/resource/:resource/:resourceId',
  authorize('admin'),
  controller.getResourceLogs
);

// GDPR routes
router.get(
  '/export',
  audit({
    action: AuditAction.DATA_EXPORTED,
    resource: 'user_data',
  }),
  controller.exportUserData
);

router.delete(
  '/user/:userId',
  authorize('admin'),
  audit({
    action: AuditAction.DATA_DELETED,
    resource: 'user_data',
    getResourceId: (req) => req.params.userId,
  }),
  controller.deleteUserData
);

export default router;