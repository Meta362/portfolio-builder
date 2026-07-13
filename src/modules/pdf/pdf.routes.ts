// src/modules/pdf/pdf.routes.ts
import { Router } from 'express';
import { PdfController } from './pdf.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { GeneratePdfDto } from './dto/generate-pdf.dto';

const router = Router();
const pdfController = new PdfController();

// All PDF routes require authentication
router.use(authenticate);

// Generate PDF
router.post(
  '/generate',
  validate(GeneratePdfDto),
  pdfController.generatePdf
);

// Download PDF
router.get('/download/:requestId', pdfController.downloadPdf);

// Get PDF request by ID
router.get('/requests/:id', pdfController.getRequest);

// Get user's PDF requests
router.get('/requests', pdfController.getUserRequests);

// Get portfolio's PDF requests
router.get('/portfolios/:portfolioId/requests', pdfController.getPortfolioRequests);

export default router;