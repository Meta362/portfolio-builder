// src/modules/users/users.service.ts
import { UserRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { 
  NotFoundException, 
  BadRequestException,
  ConflictException,
  UnauthorizedException
} from '../../core/exceptions/base.exception';
import { IUser } from '../../models/User.model';
import logger from '../../config/logger';
import * as bcrypt from 'bcryptjs';

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Get all users with pagination
   */
  async findAll(query: UserQueryDto): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number; pages: number }> {
    try {
      const { page = 1, limit = 20 } = query;
      const result = await this.userRepository.findAll(query);
      
      return {
        users: UserResponseDto.fromUsers(result.users),
        total: result.total,
        page,
        limit,
        pages: Math.ceil(result.total / limit)
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user || user.deletedAt) {
        throw new NotFoundException('User not found');
      }
      return new UserResponseDto(user);
    } catch (error) {
      logger.error('Error getting user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        return null;
      }
      return new UserResponseDto(user);
    } catch (error) {
      logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  /**
   * Create user (Admin only)
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(createUserDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      const userData = {
        ...createUserDto,
        password: hashedPassword,
        isEmailVerified: false,
        roles: createUserDto.roles || ['user'],
        subscriptionTier: createUserDto.subscriptionTier || 'free',
        preferences: {
          language: 'en',
          timezone: 'Asia/Phnom_Penh',
          darkMode: false
        }
      };

      const user = await this.userRepository.create(userData);
      logger.info(`User created by admin: ${user.email}`);
      return new UserResponseDto(user);
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user (Admin only)
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.update(id, updateUserDto);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      logger.info(`User updated: ${user.email}`);
      return new UserResponseDto(user);
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // src/modules/users/users.service.ts

/**
 * Update profile (User)
 */
async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<UserResponseDto> {
  try {
    // Build update data
    const updateData: any = {};
    
    if (updateProfileDto.firstName !== undefined) {
      updateData.firstName = updateProfileDto.firstName;
    }
    if (updateProfileDto.lastName !== undefined) {
      updateData.lastName = updateProfileDto.lastName;
    }
    if (updateProfileDto.avatarUrl !== undefined) {
      updateData.avatarUrl = updateProfileDto.avatarUrl;
    }
    
    // Update preferences - only if they exist
    const preferences: any = {};
    if (updateProfileDto.language !== undefined) {
      preferences.language = updateProfileDto.language;
    }
    if (updateProfileDto.timezone !== undefined) {
      preferences.timezone = updateProfileDto.timezone;
    }
    if (updateProfileDto.darkMode !== undefined) {
      preferences.darkMode = updateProfileDto.darkMode;
    }
    
    if (Object.keys(preferences).length > 0) {
      updateData.preferences = preferences;
    }

    const user = await this.userRepository.update(userId, updateData);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    logger.info(`Profile updated for user: ${user.email}`);
    return new UserResponseDto(user);
  } catch (error) {
    logger.error('Error updating profile:', error);
    throw error;
  }
}

  /**
   * Delete user (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
      logger.info(`User deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Restore user
   */
  async restore(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.restore(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      logger.info(`User restored: ${user.email}`);
      return new UserResponseDto(user);
    } catch (error) {
      logger.error('Error restoring user:', error);
      throw error;
    }
  }

  /**
   * Suspend user
   */
  async suspend(id: string): Promise<UserResponseDto> {
    try {
      const user = await this.userRepository.suspend(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      logger.info(`User suspended: ${user.email}`);
      return new UserResponseDto(user);
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
      return await this.userRepository.getStats();
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }
}