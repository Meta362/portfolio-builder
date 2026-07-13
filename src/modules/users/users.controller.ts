// src/modules/users/users.controller.ts
import { Request, Response, NextFunction } from 'express';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { ForbiddenException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users (Admin only)
   * GET /api/v1/users
   */
  getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query: UserQueryDto = req.query;
      const result = await this.userService.findAll(query);
      
      res.status(200).json({
        success: true,
        data: result.users,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          pages: result.pages
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID (Admin only)
   * GET /api/v1/users/:id
   */
  getUserById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const user = await this.userService.findById(userId);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get current user profile
   * GET /api/v1/users/profile
   */
  getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const user = await this.userService.findById(userId);
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update current user profile
   * PUT /api/v1/users/profile
   */
  updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const updateProfileDto: UpdateProfileDto = req.body;
      const user = await this.userService.updateProfile(userId, updateProfileDto);
      
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create user (Admin only)
   * POST /api/v1/users
   */
  createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const createUserDto: CreateUserDto = req.body;
      const user = await this.userService.create(createUserDto);
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user (Admin only)
   * PUT /api/v1/users/:id
   */
  updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const updateUserDto: UpdateUserDto = req.body;
      const user = await this.userService.update(userId, updateUserDto);
      
      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete user (Admin only)
   * DELETE /api/v1/users/:id
   */
  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      
      // Prevent self-deletion
      if (userId === req.userId) {
        throw new ForbiddenException('Cannot delete your own account');
      }
      
      await this.userService.delete(userId);
      
      res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Restore user (Admin only)
   * POST /api/v1/users/:id/restore
   */
  restoreUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const user = await this.userService.restore(userId);
      
      res.status(200).json({
        success: true,
        message: 'User restored successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Suspend user (Admin only)
   * POST /api/v1/users/:id/suspend
   */
  suspendUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      
      // Prevent self-suspension
      if (userId === req.userId) {
        throw new ForbiddenException('Cannot suspend your own account');
      }
      
      const user = await this.userService.suspend(userId);
      
      res.status(200).json({
        success: true,
        message: 'User suspended successfully',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user statistics (Admin only)
   * GET /api/v1/users/stats
   */
  getUserStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const stats = await this.userService.getStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  };
}