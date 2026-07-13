// src/modules/portfolios/portfolio.service.ts
import { PortfolioRepository } from './portfolio.repository';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { PortfolioQueryDto } from './dto/portfolio-query.dto';
import { PortfolioResponseDto } from './dto/portfolio-response.dto';
import { NotFoundException, BadRequestException } from '../../core/exceptions/base.exception';
import { PortfolioStatus } from './models/portfolio.model';
import logger from '../../config/logger';
import { eventEmitter, EVENTS } from '../shared/events/event-emitter';

export class PortfolioService {
  private portfolioRepository: PortfolioRepository;

  constructor() {
    this.portfolioRepository = new PortfolioRepository();
  }

  /**
   * Get all portfolios
   */
  async findAll(query: PortfolioQueryDto, userId?: string) {
    try {
      const result = await this.portfolioRepository.findAll({
        ...query,
        userId,
      });
      
      return {
        portfolios: PortfolioResponseDto.fromPortfolios(result.portfolios),
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 20,
        pages: Math.ceil(result.total / (query.limit || 20)),
      };
    } catch (error) {
      logger.error('Error getting portfolios:', error);
      throw error;
    }
  }

  /**
   * Get portfolio by ID
   */
  async findById(id: string, userId?: string) {
    try {
      const portfolio = await this.portfolioRepository.findById(id);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      // Check permissions
      if (userId && portfolio.userId !== userId) {
        throw new BadRequestException('You do not have permission to view this portfolio');
      }
      
      return new PortfolioResponseDto(portfolio);
    } catch (error) {
      logger.error('Error getting portfolio by ID:', error);
      throw error;
    }
  }

  /**
   * Get public portfolio by username
   */
  async findByUsername(username: string) {
    try {
      const portfolio = await this.portfolioRepository.findByUsername(username);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      // Increment view count
      await this.portfolioRepository.incrementViews(portfolio._id.toString());
      
      // Emit event
      eventEmitter.emit(EVENTS.PORTFOLIO_VIEWED, {
        portfolioId: portfolio._id.toString(),
        username: portfolio.username,
      });
      
      return new PortfolioResponseDto(portfolio);
    } catch (error) {
      logger.error('Error getting portfolio by username:', error);
      throw error;
    }
  }

  /**
   * Create portfolio
   */
  async create(userId: string, createDto: CreatePortfolioDto) {
    try {
      // Generate username from title if not provided
      let username = createDto.title
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if username is available
      let isAvailable = await this.portfolioRepository.isUsernameAvailable(username);
      let counter = 1;
      while (!isAvailable) {
        username = `${username}-${counter}`;
        isAvailable = await this.portfolioRepository.isUsernameAvailable(username);
        counter++;
      }
      
      const portfolioData = {
        ...createDto,
        userId,
        username,
        status: createDto.status || PortfolioStatus.DRAFT,
      };
      
      const portfolio = await this.portfolioRepository.create(portfolioData);
      
      // Emit event
      eventEmitter.emit(EVENTS.PORTFOLIO_CREATED, {
        portfolioId: portfolio._id.toString(),
        userId,
        username: portfolio.username,
        title: portfolio.title,
      });
      
      logger.info(`Portfolio created: ${portfolio.title} by user ${userId}`);
      return new PortfolioResponseDto(portfolio);
    } catch (error) {
      logger.error('Error creating portfolio:', error);
      throw error;
    }
  }

  /**
   * Update portfolio
   */
  async update(id: string, userId: string, updateDto: UpdatePortfolioDto) {
    try {
      const portfolio = await this.portfolioRepository.findById(id);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      if (portfolio.userId !== userId) {
        throw new BadRequestException('You do not have permission to update this portfolio');
      }
      
      // Check username availability
      if (updateDto.username) {
        const isAvailable = await this.portfolioRepository.isUsernameAvailable(
          updateDto.username,
          id
        );
        if (!isAvailable) {
          throw new BadRequestException('Username already taken');
        }
      }
      
      const updated = await this.portfolioRepository.update(id, updateDto);
      if (!updated) {
        throw new NotFoundException('Portfolio not found');
      }
      
      // Emit event
      eventEmitter.emit(EVENTS.PORTFOLIO_UPDATED, {
        portfolioId: id,
        userId,
        username: updated.username,
        title: updated.title,
      });
      
      logger.info(`Portfolio updated: ${updated.title} by user ${userId}`);
      return new PortfolioResponseDto(updated);
    } catch (error) {
      logger.error('Error updating portfolio:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio
   */
  async delete(id: string, userId: string) {
    try {
      const portfolio = await this.portfolioRepository.findById(id);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      if (portfolio.userId !== userId) {
        throw new BadRequestException('You do not have permission to delete this portfolio');
      }
      
      await this.portfolioRepository.delete(id);
      
      // Emit event
      eventEmitter.emit(EVENTS.PORTFOLIO_DELETED, {
        portfolioId: id,
        userId,
        username: portfolio.username,
        title: portfolio.title,
      });
      
      logger.info(`Portfolio deleted: ${id} by user ${userId}`);
    } catch (error) {
      logger.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  /**
   * Publish portfolio
   */
  async publish(id: string, userId: string) {
    try {
      const portfolio = await this.portfolioRepository.findById(id);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      if (portfolio.userId !== userId) {
        throw new BadRequestException('You do not have permission to publish this portfolio');
      }
      
      const published = await this.portfolioRepository.publish(id);
      if (!published) {
        throw new NotFoundException('Portfolio not found');
      }
      
      // Emit event
      eventEmitter.emit(EVENTS.PORTFOLIO_PUBLISHED, {
        portfolioId: id,
        userId,
        username: published.username,
        title: published.title,
      });
      
      logger.info(`Portfolio published: ${published.title} by user ${userId}`);
      return new PortfolioResponseDto(published);
    } catch (error) {
      logger.error('Error publishing portfolio:', error);
      throw error;
    }
  }

  /**
   * Unpublish portfolio
   */
  async unpublish(id: string, userId: string) {
    try {
      const portfolio = await this.portfolioRepository.findById(id);
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
      
      if (portfolio.userId !== userId) {
        throw new BadRequestException('You do not have permission to unpublish this portfolio');
      }
      
      const unpublished = await this.portfolioRepository.unpublish(id);
      if (!unpublished) {
        throw new NotFoundException('Portfolio not found');
      }
      
      // Emit event
      eventEmitter.emit(EVENTS.PORTFOLIO_UNPUBLISHED, {
        portfolioId: id,
        userId,
        username: unpublished.username,
        title: unpublished.title,
      });
      
      logger.info(`Portfolio unpublished: ${unpublished.title} by user ${userId}`);
      return new PortfolioResponseDto(unpublished);
    } catch (error) {
      logger.error('Error unpublishing portfolio:', error);
      throw error;
    }
  }

  /**
   * Get portfolio statistics
   */
  async getStats(userId?: string) {
    try {
      return await this.portfolioRepository.getStats(userId);
    } catch (error) {
      logger.error('Error getting portfolio stats:', error);
      throw error;
    }
  }
}