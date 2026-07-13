// src/modules/ai/ai.routes.ts
import { Router } from 'express';
import { AiController } from './ai.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { aiRateLimiter } from '../../core/middlewares/rate-limiter.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { GenerateAboutDto } from './dto/generate-about.dto';
import { RewriteContentDto } from './dto/rewrite-content.dto';
import { ScorePortfolioDto } from './dto/score-portfolio.dto';
import { TranslateDto } from './dto/translate.dto';

const router = Router();
const aiController = new AiController();

// All AI routes require authentication
router.use(authenticate);
router.use(aiRateLimiter); // Rate limit: 20 requests per hour

router.post(
  '/generate/about',
  validate(GenerateAboutDto),
  aiController.generateAbout
);

router.post(
  '/rewrite',
  validate(RewriteContentDto),
  aiController.rewriteContent
);

router.post(
  '/score',
  validate(ScorePortfolioDto),
  aiController.scorePortfolio
);

router.post(
  '/translate',
  validate(TranslateDto),
  aiController.translateContent
);

router.get(
  '/usage',
  aiController.getUsageStats
);

router.get(
  '/requests/:id',
  aiController.getRequest
);

export default router;