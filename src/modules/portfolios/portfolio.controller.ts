// src/modules/portfolios/portfolio.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioQueryDto } from './dto/portfolio-query.dto';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import logger from '../../config/logger';

export class PortfolioController {
  private portfolioService: PortfolioService;

  constructor() {
    this.portfolioService = new PortfolioService();
  }

  /**
   * Get all portfolios (with pagination)
   * GET /api/v1/portfolios
   */
  getAllPortfolios = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const query: PortfolioQueryDto = req.query;
      
      const result = await this.portfolioService.findAll(query, userId);
      
      res.status(200).json({
        success: true,
        data: result.portfolios,
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
   * Get portfolio by ID
   * GET /api/v1/portfolios/:id
   */
  getPortfolioById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId;
      
      const portfolio = await this.portfolioService.findById(id, userId);
      
      res.status(200).json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get public portfolio by username
   * GET /api/v1/portfolios/username/:username
   */
  getPublicPortfolio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const username = req.params.username;
      
      const portfolio = await this.portfolioService.findByUsername(username);
      
      res.status(200).json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create portfolio
   * POST /api/v1/portfolios
   */
  createPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const createDto: CreatePortfolioDto = req.body;
      
      const portfolio = await this.portfolioService.create(userId, createDto);
      
      res.status(201).json({
        success: true,
        message: 'Portfolio created successfully',
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update portfolio
   * PUT /api/v1/portfolios/:id
   */
  updatePortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      const updateDto: UpdatePortfolioDto = req.body;
      
      const portfolio = await this.portfolioService.update(id, userId, updateDto);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio updated successfully',
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete portfolio
   * DELETE /api/v1/portfolios/:id
   */
  deletePortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      
      await this.portfolioService.delete(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Publish portfolio
   * POST /api/v1/portfolios/:id/publish
   */
  publishPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      
      const portfolio = await this.portfolioService.publish(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio published successfully',
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unpublish portfolio
   * POST /api/v1/portfolios/:id/unpublish
   */
  unpublishPortfolio = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.userId!;
      
      const portfolio = await this.portfolioService.unpublish(id, userId);
      
      res.status(200).json({
        success: true,
        message: 'Portfolio unpublished successfully',
        data: portfolio,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get portfolio statistics
   * GET /api/v1/portfolios/stats
   */
  getPortfolioStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      
      const stats = await this.portfolioService.getStats(userId);
      
      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  };
}