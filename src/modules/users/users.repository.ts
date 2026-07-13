// src/modules/users/users.repository.ts
import { User, IUser } from '../../models/User.model';
import { NotFoundException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class UserRepository {
  /**
   * Find all users with pagination and filters
   */
  async findAll(query: any): Promise<{ users: IUser[]; total: number }> {
    try {
      const { search, email, role, subscriptionTier, isEmailVerified, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = query;
      
      // Build filter
      const filter: any = { deletedAt: null };
      
      if (search) {
        filter.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (email) {
        filter.email = { $regex: email, $options: 'i' };
      }
      
      if (role) {
        filter.roles = role;
      }
      
      if (subscriptionTier) {
        filter.subscriptionTier = subscriptionTier;
      }
      
      if (isEmailVerified !== undefined) {
        filter.isEmailVerified = isEmailVerified === 'true';
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [users, total] = await Promise.all([
        User.find(filter)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(filter)
      ]);

      return { users: users as IUser[], total };
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      return await User.findById(id);
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await User.findOne({ 
        email: email.toLowerCase(),
        deletedAt: null 
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async create(userData: any): Promise<IUser> {
    try {
      const user = new User({
        ...userData,
        email: userData.email.toLowerCase()
      });
      await user.save();
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

// src/modules/users/users.repository.ts

/**
 * Update user
 */
async update(id: string, updateData: any): Promise<IUser | null> {
  try {
    // Handle nested preferences update
    if (updateData.preferences) {
      // Use $set for nested object to avoid overwriting
      const preferences = updateData.preferences;
      delete updateData.preferences;
      
      const setData: any = {
        ...updateData,
        'metadata.updatedAt': new Date()
      };
      
      // Add preferences fields individually
      if (preferences.language !== undefined) {
        setData['preferences.language'] = preferences.language;
      }
      if (preferences.timezone !== undefined) {
        setData['preferences.timezone'] = preferences.timezone;
      }
      if (preferences.darkMode !== undefined) {
        setData['preferences.darkMode'] = preferences.darkMode;
      }
      
      const user = await User.findByIdAndUpdate(
        id,
        { $set: setData },
        { new: true, runValidators: true }
      );
      return user;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...updateData,
          'metadata.updatedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    );
    return user;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
}

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { 
          $set: { 
            deletedAt: new Date(),
            'metadata.updatedAt': new Date()
          }
        }
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Restore user (undo soft delete)
   */
  async restore(id: string): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { 
          $set: { 
            deletedAt: null,
            'metadata.updatedAt': new Date()
          }
        },
        { new: true }
      );
      return user;
    } catch (error) {
      logger.error('Error restoring user:', error);
      throw error;
    }
  }

  /**
   * Suspend user
   */
  async suspend(id: string): Promise<IUser | null> {
    try {
      // You can add a 'suspended' field to the User model
      // For now, we'll use a soft delete approach
      const user = await User.findByIdAndUpdate(
        id,
        { 
          $set: { 
            deletedAt: new Date(),
            'metadata.updatedAt': new Date()
          }
        },
        { new: true }
      );
      return user;
    } catch (error) {
      logger.error('Error suspending user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getStats(): Promise<any> {
    try {
      const [total, verified, unverified, suspended, bySubscription] = await Promise.all([
        User.countDocuments({ deletedAt: null }),
        User.countDocuments({ deletedAt: null, isEmailVerified: true }),
        User.countDocuments({ deletedAt: null, isEmailVerified: false }),
        User.countDocuments({ deletedAt: { $ne: null } }),
        User.aggregate([
          { $match: { deletedAt: null } },
          { $group: { _id: '$subscriptionTier', count: { $sum: 1 } } }
        ])
      ]);

      const subscriptionDistribution = bySubscription.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {});

      return {
        total,
        verified,
        unverified,
        suspended,
        subscriptionDistribution: {
          free: subscriptionDistribution.free || 0,
          pro: subscriptionDistribution.pro || 0,
          enterprise: subscriptionDistribution.enterprise || 0
        },
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  // src/modules/users/users.repository.ts

/**
 * Update user profile (specific fields)
 */
async updateProfile(id: string, updateData: any): Promise<IUser | null> {
  try {
    const user = await User.findByIdAndUpdate(
      id,
      { 
        $set: {
          ...updateData,
          'metadata.updatedAt': new Date()
        }
      },
      { new: true, runValidators: true }
    );
    return user;
  } catch (error) {
    logger.error('Error updating profile:', error);
    throw error;
  }
}

}