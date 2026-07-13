// src/modules/pdf/pdf.controller.ts
import { Request, Response, NextFunction } from 'express';
import { PdfService } from './pdf.service';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { BadRequestException } from '../../core/exceptions/base.exception';

export class PdfController {
  private pdfService: PdfService;

  constructor() {
    this.pdfService = new PdfService();
  }

  /**
   * Generate PDF
   * POST /api/v1/pdf/generate
   */
  generatePdf = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const dto: GeneratePdfDto = req.body;

      const result = await this.pdfService.generatePdf(userId, dto);

      res.status(202).json({
        success: true,
        message: 'PDF generation started',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Download PDF
   * GET /api/v1/pdf/download/:requestId
   */
  downloadPdf = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { requestId } = req.params;

      const result = await this.pdfService.downloadPdf(requestId, userId);

      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.setHeader('Content-Length', result.buffer.length);
      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get PDF request by ID
   * GET /api/v1/pdf/requests/:id
   */
  getRequest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { id } = req.params;

      const request = await this.pdfService.getRequestById(id, userId);

      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's PDF requests
   * GET /api/v1/pdf/requests
   */
  getUserRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;

      const requests = await this.pdfService.getUserRequests(userId, limit, offset);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get portfolio's PDF requests
   * GET /api/v1/pdf/portfolios/:portfolioId/requests
   */
  getPortfolioRequests = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { portfolioId } = req.params;

      const requests = await this.pdfService.getPortfolioRequests(portfolioId, userId);

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  };
}