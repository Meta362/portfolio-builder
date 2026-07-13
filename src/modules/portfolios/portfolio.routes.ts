// src/modules/portfolios/portfolio.routes.ts
import { Router } from 'express';
import { PortfolioController } from './portfolio.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

const router = Router();
const controller = new PortfolioController();

// Public routes
router.get('/username/:username', controller.getPublicPortfolio);

// Protected routes (require authentication)
router.use(authenticate);

// CRUD operations
router.get('/', controller.getAllPortfolios);
router.get('/:id', controller.getPortfolioById);
router.post('/', validate(CreatePortfolioDto), controller.createPortfolio);
router.put('/:id', validate(UpdatePortfolioDto), controller.updatePortfolio);
router.delete('/:id', controller.deletePortfolio);

// Publishing
router.post('/:id/publish', controller.publishPortfolio);
router.post('/:id/unpublish', controller.unpublishPortfolio);

// Statistics
router.get('/stats', controller.getPortfolioStats);

export default router;