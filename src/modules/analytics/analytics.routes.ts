// src/modules/analytics/analytics.routes.ts
import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { TrackEventDto } from './dto/track-event.dto';

const router = Router();
const controller = new AnalyticsController();

// All routes require authentication
router.use(authenticate);

// Session tracking
router.post('/session', controller.trackSession);
router.post('/session/end', controller.endSession);

// Event tracking
router.post('/track', validate(TrackEventDto), controller.trackEvent);

// Analytics stats
router.get('/user', controller.getUserAnalytics);
router.get('/realtime', controller.getRealtimeStats);
router.get('/retention', controller.getRetentionStats);
router.get('/report', controller.generateReport);
router.get('/portfolio/:portfolioId', controller.getPortfolioAnalytics);

export default router;