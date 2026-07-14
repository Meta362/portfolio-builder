// src/modules/pdf/pdf.service.ts
// Puppeteer is imported dynamically in generatePdfBuffer to fix ERR_REQUIRE_ESM
import Handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { PdfRepository } from './pdf.repository';
import { PortfolioService } from '../portfolios/portfolio.service';
import { GeneratePdfDto } from './dto/generate-pdf.dto';
import { IPdfDownloadResult } from './interfaces/pdf.interface';
import {
  NotFoundException,
  BadRequestException,
  InternalServerException
} from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class PdfService {
  private pdfRepository: PdfRepository;
  private portfolioService: PortfolioService;
  private templateCache: Map<string, any> = new Map();
  private storageDir: string;

  constructor() {
    this.pdfRepository = new PdfRepository();
    this.portfolioService = new PortfolioService();
    this.storageDir = path.join(process.cwd(), 'storage', 'pdf');
    this.ensureStorageDirectory();
    this.compileTemplates();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDirectory(): void {
    try {
      if (!fs.existsSync(this.storageDir)) {
        fs.mkdirSync(this.storageDir, { recursive: true });
        logger.info(`✅ Storage directory created: ${this.storageDir}`);
      }
    } catch (error) {
      logger.error('❌ Failed to create storage directory:', error);
    }
  }

  /**
   * Compile Handlebars templates
   */
  private compileTemplates(): void {
    try {
      let templatePath = path.join(__dirname, 'templates', 'portfolio-template.hbs');

      if (!fs.existsSync(templatePath)) {
        // Fallback to src directory if not copied to dist
        templatePath = path.join(process.cwd(), 'src', 'modules', 'pdf', 'templates', 'portfolio-template.hbs');
      }

      if (!fs.existsSync(templatePath)) {
        logger.warn(`⚠️ Template file not found: ${templatePath}`);
        return;
      }

      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Register helpers
      Handlebars.registerHelper('formatDate', (date: Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short'
        });
      });

      Handlebars.registerHelper('multiply', (a: number, b: number) => {
        return a * b;
      });

      Handlebars.registerHelper('eq', (a: any, b: any) => {
        return a === b;
      });

      const template = Handlebars.compile(templateContent);
      this.templateCache.set('portfolio', template);

      logger.info('✅ PDF templates compiled successfully');
    } catch (error) {
      logger.error('❌ Failed to compile PDF templates:', error);
    }
  }

  /**
   * Generate PDF - ប្តូរពី getById ទៅ findById
   */
  async generatePdf(userId: string, dto: GeneratePdfDto) {
    try {
      // Get portfolio - ប្តូរពី getById ទៅ findById
      const portfolio = await this.portfolioService.findById(dto.portfolioId, userId);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }

      // Create PDF request record
      const request = await this.pdfRepository.createRequest({
        userId,
        portfolioId: dto.portfolioId,
        status: 'processing',
        format: dto.format || 'A4',
        orientation: dto.orientation || 'portrait',
        template: dto.template || 'professional',
        language: dto.language || 'en'
      });

      try {
        // Generate PDF
        const pdfBuffer = await this.generatePdfBuffer(portfolio, dto);

        // Save PDF to storage
        const filename = `${portfolio.id}-portfolio-${Date.now()}.pdf`;
        const filePath = path.join(this.storageDir, filename);

        fs.writeFileSync(filePath, pdfBuffer);
        logger.info(`✅ PDF saved: ${filePath} (${pdfBuffer.length} bytes)`);

        // Update request
        const downloadUrl = `/api/v1/pdf/download/${request._id}`;
        await this.pdfRepository.markCompleted(
          request._id.toString(),
          downloadUrl,
          pdfBuffer.length
        );

        // Send Telegram notification
        try {
          const { TelegramService } = require('../telegram/telegram.service');
          const telegramService = new TelegramService();
          await telegramService.sendNotification(
            userId,
            'pdf_generated',
            '📄 PDF Generated!',
            `Your portfolio "${portfolio.title}" PDF is ready for download.`,
            {
              portfolioTitle: portfolio.title,
              downloadUrl: downloadUrl,
              format: dto.format || 'A4'
            }
          );
        } catch (telegramError) {
          logger.warn('Failed to send Telegram notification:', telegramError);
        }

        return {
          requestId: request._id,
          downloadUrl,
          fileSize: pdfBuffer.length,
          format: dto.format || 'A4'
        };
      } catch (error) {
        await this.pdfRepository.markFailed(
          request._id.toString(),
          error instanceof Error ? error.message : 'Unknown error'
        );
        throw error;
      }
    } catch (error) {
      logger.error('Generate PDF error:', error);
      throw error;
    }
  }

  /**
   * Generate PDF buffer from portfolio data
   */
  private async generatePdfBuffer(portfolio: any, dto: GeneratePdfDto): Promise<Buffer> {
    const template = this.templateCache.get('portfolio');
    if (!template) {
      throw new InternalServerException('PDF template not compiled');
    }

    // **បន្ថែម: កែប្រែការអានទិន្នន័យពី portfolio ថ្មី**
    const data = {
      title: portfolio.title || 'Portfolio',
      subtitle: portfolio.subtitle || '',
      about: portfolio.about || '',
      skills: portfolio.skills || [],
      projects: portfolio.projects || [],
      experience: portfolio.experience || [],
      education: portfolio.education || [],
      socialLinks: portfolio.socialLinks || {},
      design: portfolio.design || {
        colors: { primary: '#667eea', secondary: '#764ba2' },
        layout: 'modern'
      },
      contactEmail: portfolio.contactEmail || '',
      contactPhone: portfolio.contactPhone || '',
      generatedDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    const html = template(data);

    let browser = null;
    try {
      const puppeteerModule = await eval(`import('puppeteer')`);
      const puppeteer = puppeteerModule.default;

      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });

      const page = await browser.newPage();

      await page.setViewport({
        width: 1200,
        height: 1600
      });

      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      const pdfOptions: any = {
        format: dto.format || 'A4',
        landscape: dto.orientation === 'landscape',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      logger.error('Error generating PDF buffer:', error);
      throw new InternalServerException('Failed to generate PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Download PDF
   */
  async downloadPdf(requestId: string, userId: string): Promise<IPdfDownloadResult> {
    try {
      logger.info(`📥 Downloading PDF: ${requestId} for user ${userId}`);

      // Get request from database
      const request = await this.pdfRepository.getRequestById(requestId);

      if (!request) {
        throw new NotFoundException('PDF request not found');
      }

      // Check permission
      if (request.userId !== userId) {
        throw new BadRequestException('You do not have permission to download this PDF');
      }

      // Check status
      if (request.status !== 'completed') {
        throw new BadRequestException(`PDF is still being generated (status: ${request.status})`);
      }

      // **បន្ថែម: Update download count in portfolio analytics**
      try {
        const { Portfolio } = require('../portfolios/models/portfolio.model');
        await Portfolio.findOneAndUpdate(
          { _id: request.portfolioId },
          { $inc: { 'analytics.downloads': 1 } }
        );
        logger.info(`✅ Updated download count for portfolio: ${request.portfolioId}`);
      } catch (analyticsError) {
        logger.warn('Failed to update download analytics:', analyticsError);
      }

      // Find PDF file
      const files = fs.readdirSync(this.storageDir);
      let pdfFile = files.find(f =>
        f.includes(request.portfolioId) && f.endsWith('.pdf')
      );

      if (!pdfFile) {
        const pdfFiles = files.filter(f => f.endsWith('.pdf'));
        if (pdfFiles.length === 0) {
          throw new NotFoundException('No PDF file found');
        }
        pdfFile = pdfFiles[pdfFiles.length - 1];
      }

      const filePath = path.join(this.storageDir, pdfFile);

      if (!fs.existsSync(filePath)) {
        throw new NotFoundException('PDF file not found');
      }

      const buffer = fs.readFileSync(filePath);

      return {
        buffer,
        filename: `portfolio-${request.portfolioId}.pdf`,
        contentType: 'application/pdf'
      };
    } catch (error) {
      logger.error('Download PDF error:', error);
      throw error;
    }
  }

  /**
   * Get PDF request by ID
   */
  async getRequestById(requestId: string, userId: string) {
    try {
      const request = await this.pdfRepository.getRequestById(requestId);

      if (!request) {
        throw new NotFoundException('PDF request not found');
      }

      if (request.userId !== userId) {
        throw new BadRequestException('You do not have permission to view this PDF request');
      }

      return request;
    } catch (error) {
      logger.error('Get PDF request error:', error);
      throw error;
    }
  }

  /**
   * Get user's PDF requests
   */
  async getUserRequests(userId: string, limit?: number, offset?: number) {
    try {
      return await this.pdfRepository.getUserRequests(userId, limit, offset);
    } catch (error) {
      logger.error('Get user PDF requests error:', error);
      throw error;
    }
  }

  /**
   * Get portfolio's PDF requests - ប្តូរពី getById ទៅ findById
   */
  async getPortfolioRequests(portfolioId: string, userId: string) {
    try {
      // ប្តូរពី getById ទៅ findById
      await this.portfolioService.findById(portfolioId, userId);
      return await this.pdfRepository.getPortfolioRequests(portfolioId);
    } catch (error) {
      logger.error('Get portfolio PDF requests error:', error);
      throw error;
    }
  }
}