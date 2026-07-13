// src/modules/auth/auth.repository.ts
import { User, IUser } from '../../models/User.model';
import { NotFoundException, ConflictException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class AuthRepository {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({ 
        email: email.toLowerCase(),
        deletedAt: null 
      }).select('+password +refreshTokens +verificationToken +verificationTokenExpires +resetPasswordToken +resetPasswordExpires');
      
      return user as IUser | null;
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<IUser | null> {
    try {
      const user = await User.findById(id).select('+refreshTokens');
      return user as IUser | null;
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by verification token
   */
  async findByVerificationToken(token: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({
        verificationToken: token,
      }).select('+verificationToken +verificationTokenExpires');
      
      return user as IUser | null;
    } catch (error) {
      logger.error('Error finding user by verification token:', error);
      throw error;
    }
  }

  /**
   * Find user by reset password token
   */
  async findByResetToken(token: string): Promise<IUser | null> {
    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      }).select('+resetPasswordToken +resetPasswordExpires');
      
      return user as IUser | null;
    } catch (error) {
      logger.error('Error finding user by reset token:', error);
      throw error;
    }
  }

  /**
   * Create new user
   */
  async create(userData: Partial<IUser>): Promise<IUser> {
    try {
      // Check if email already exists
      const existingUser = await User.findOne({ 
        email: userData.email?.toLowerCase() 
      });
      
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const user = new User({
        ...userData,
        email: userData.email?.toLowerCase()
      });

      await user.save();
      return user as IUser;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      return user as IUser;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Add refresh token to user
   */
  async addRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $push: { refreshTokens: refreshToken }
      });
    } catch (error) {
      logger.error('Error adding refresh token:', error);
      throw error;
    }
  }

  /**
   * Remove refresh token from user
   */
  async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: refreshToken }
      });
    } catch (error) {
      logger.error('Error removing refresh token:', error);
      throw error;
    }
  }

  /**
   * Remove all refresh tokens from user
   */
  async removeAllRefreshTokens(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] }
      });
    } catch (error) {
      logger.error('Error removing all refresh tokens:', error);
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<IUser | null> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            isEmailVerified: true,
            verificationToken: null,
            verificationTokenExpires: null
          }
        },
        { new: true }
      );
      
      return user as IUser | null;
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Update login metadata
   */
  async updateLoginMetadata(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        $set: { 'metadata.lastLogin': new Date() },
        $inc: { 'metadata.loginCount': 1 }
      });
    } catch (error) {
      logger.error('Error updating login metadata:', error);
      throw error;
    }
  }
}