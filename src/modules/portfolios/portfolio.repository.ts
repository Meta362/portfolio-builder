// src/modules/portfolios/portfolio.repository.ts
import { Portfolio, IPortfolio, PortfolioStatus } from './models/portfolio.model';
import { NotFoundException, ConflictException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class PortfolioRepository {
  /**
   * Find all portfolios with pagination
   */
  async findAll(query: any): Promise<{ portfolios: IPortfolio[]; total: number }> {
    try {
      const { search, status, visibility, userId, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      
      const filter: any = { isDeleted: false };
      
      if (userId) {
        filter.userId = userId;
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (visibility) {
        filter.visibility = visibility;
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
        ];
      }

      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const [portfolios, total] = await Promise.all([
        Portfolio.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Portfolio.countDocuments(filter),
      ]);

      return { portfolios: portfolios as IPortfolio[], total };
    } catch (error) {
      logger.error('Error finding portfolios:', error);
      throw error;
    }
  }

  /**
   * Find portfolio by ID
   */
  async findById(id: string): Promise<IPortfolio | null> {
    try {
      return await Portfolio.findOne({ _id: id, isDeleted: false });
    } catch (error) {
      logger.error('Error finding portfolio by ID:', error);
      throw error;
    }
  }

  /**
   * Find portfolio by username (public)
   */
  async findByUsername(username: string): Promise<IPortfolio | null> {
    try {
      return await Portfolio.findOne({
        username: username.toLowerCase(),
        isDeleted: false,
        status: PortfolioStatus.PUBLISHED,
      });
    } catch (error) {
      logger.error('Error finding portfolio by username:', error);
      throw error;
    }
  }

  /**
   * Find portfolio by username and user (for editing)
   */
  async findByUsernameAndUser(username: string, userId: string): Promise<IPortfolio | null> {
    try {
      return await Portfolio.findOne({
        username: username.toLowerCase(),
        userId,
        isDeleted: false,
      });
    } catch (error) {
      logger.error('Error finding portfolio by username and user:', error);
      throw error;
    }
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string, excludeId?: string): Promise<boolean> {
    try {
      const query: any = {
        username: username.toLowerCase(),
        isDeleted: false,
      };
      
      if (excludeId) {
        query._id = { $ne: excludeId };
      }
      
      const existing = await Portfolio.findOne(query);
      return !existing;
    } catch (error) {
      logger.error('Error checking username availability:', error);
      throw error;
    }
  }

  /**
   * Create portfolio
   */
  async create(data: any): Promise<IPortfolio> {
    try {
      const portfolio = new Portfolio(data);
      await portfolio.save();
      return portfolio;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Username already taken');
      }
      logger.error('Error creating portfolio:', error);
      throw error;
    }
  }

  /**
   * Update portfolio
   */
  async update(id: string, updateData: any): Promise<IPortfolio | null> {
    try {
      const portfolio = await Portfolio.findByIdAndUpdate(
        id,
        { 
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
          $inc: { version: 1 }
        },
        { new: true, runValidators: true }
      );
      return portfolio;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Username already taken');
      }
      logger.error('Error updating portfolio:', error);
      throw error;
    }
  }

  /**
   * Delete portfolio (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const portfolio = await Portfolio.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            deletedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );
      if (!portfolio) {
        throw new NotFoundException('Portfolio not found');
      }
    } catch (error) {
      logger.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  /**
   * Publish portfolio
   */
  async publish(id: string): Promise<IPortfolio | null> {
    try {
      const portfolio = await Portfolio.findByIdAndUpdate(
        id,
        {
          $set: {
            status: PortfolioStatus.PUBLISHED,
            publishedAt: new Date(),
            lastPublishedAt: new Date(),
            updatedAt: new Date(),
          }
        },
        { new: true }
      );
      return portfolio;
    } catch (error) {
      logger.error('Error publishing portfolio:', error);
      throw error;
    }
  }

  /**
   * Unpublish portfolio
   */
  async unpublish(id: string): Promise<IPortfolio | null> {
    try {
      const portfolio = await Portfolio.findByIdAndUpdate(
        id,
        {
          $set: {
            status: PortfolioStatus.DRAFT,
            updatedAt: new Date(),
          }
        },
        { new: true }
      );
      return portfolio;
    } catch (error) {
      logger.error('Error unpublishing portfolio:', error);
      throw error;
    }
  }

  /**
   * Get portfolio statistics
   */
  async getStats(userId?: string): Promise<any> {
    try {
      const filter: any = { isDeleted: false };
      if (userId) {
        filter.userId = userId;
      }

      const [total, published, draft, archived, totalViews] = await Promise.all([
        Portfolio.countDocuments(filter),
        Portfolio.countDocuments({ ...filter, status: PortfolioStatus.PUBLISHED }),
        Portfolio.countDocuments({ ...filter, status: PortfolioStatus.DRAFT }),
        Portfolio.countDocuments({ ...filter, status: PortfolioStatus.ARCHIVED }),
        Portfolio.aggregate([
          { $match: filter },
          { $group: { _id: null, total: { $sum: '$analytics.views' } } }
        ]),
      ]);

      return {
        total,
        published,
        draft,
        archived,
        totalViews: totalViews[0]?.total || 0,
      };
    } catch (error) {
      logger.error('Error getting portfolio stats:', error);
      throw error;
    }
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await Portfolio.findByIdAndUpdate(id, {
        $inc: { 'analytics.views': 1, 'analytics.uniqueViews': 1 },
        $set: { 'analytics.lastViewedAt': new Date() },
      });
    } catch (error) {
      logger.error('Error incrementing views:', error);
      throw error;
    }
  }

  /**
   * Increment download count
   */
  async incrementDownloads(id: string): Promise<void> {
    try {
      await Portfolio.findByIdAndUpdate(id, {
        $inc: { 'analytics.downloads': 1 },
      });
    } catch (error) {
      logger.error('Error incrementing downloads:', error);
      throw error;
    }
  }

  /**
   * Increment contact count
   */
  async incrementContacts(id: string): Promise<void> {
    try {
      await Portfolio.findByIdAndUpdate(id, {
        $inc: { 'analytics.contacts': 1 },
      });
    } catch (error) {
      logger.error('Error incrementing contacts:', error);
      throw error;
    }
  }
}