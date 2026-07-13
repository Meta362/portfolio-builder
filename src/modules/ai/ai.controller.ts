// src/modules/ai/ai.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AiService } from './ai.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { GenerateAboutDto } from './dto/generate-about.dto';
import { RewriteContentDto } from './dto/rewrite-content.dto';
import { ScorePortfolioDto } from './dto/score-portfolio.dto';
import { TranslateDto } from './dto/translate.dto';

export class AiController {
  private aiService: AiService;

  constructor() {
    this.aiService = new AiService();
  }

  /**
   * Generate About Me
   * POST /api/v1/ai/generate/about
   */
  generateAbout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: GenerateAboutDto = req.body;
      
      const result = await this.aiService.generateAbout(userId, dto);
      
      res.status(200).json({
        success: true,
        message: 'About Me generated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Rewrite Content
   * POST /api/v1/ai/rewrite
   */
  rewriteContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: RewriteContentDto = req.body;
      
      const result = await this.aiService.rewriteContent(userId, dto);
      
      res.status(200).json({
        success: true,
        message: 'Content rewritten successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Score Portfolio
   * POST /api/v1/ai/score
   */
  scorePortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: ScorePortfolioDto = req.body;
      
      const result = await this.aiService.scorePortfolio(userId, dto);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio scored successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Translate Content
   * POST /api/v1/ai/translate
   */
  translateContent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: TranslateDto = req.body;
      
      const result = await this.aiService.translateContent(userId, dto);
      
      res.status(200).json({
        success: true,
        message: 'Content translated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get AI Usage Stats
   * GET /api/v1/ai/usage
   */
  getUsageStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      
      const stats = await this.aiService.getUsageStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get AI Request by ID
   * GET /api/v1/ai/requests/:id
   */
  getRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      
      const request = await this.aiService.getRequestById(userId, id);
      
      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  };
}