// src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import logger from '../../config/logger';
import { auditService } from '../../modules/audit/audit.service';
import { AuditAction, AuditStatus } from '../../modules/audit/models/audit-log.model';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // ==================== REGISTER & LOGIN ====================

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const registerDto: RegisterDto = req.body;
      const result = await this.authService.register(registerDto);
      
      // Log audit
      await auditService.createLog({
        userId: result.user.id,
        action: AuditAction.USER_REGISTERED,
        status: AuditStatus.SUCCESS,
        resource: 'user',
        resourceId: result.user.id,
        ip: req.ip || req.headers['x-forwarded-for'] as string || '',
        userAgent: req.headers['user-agent'] || '',
        details: {
          email: registerDto.email,
          firstName: registerDto.firstName,
          lastName: registerDto.lastName,
        },
      });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please verify your email.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginDto: LoginDto = req.body;
      const result = await this.authService.login(loginDto);
      
      // Log audit
      await auditService.createLog({
        userId: result.user.id,
        action: AuditAction.USER_LOGIN,
        status: AuditStatus.SUCCESS,
        resource: 'user',
        resourceId: result.user.id,
        ip: req.ip || req.headers['x-forwarded-for'] as string || '',
        userAgent: req.headers['user-agent'] || '',
        details: {
          email: loginDto.email,
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshTokenDto: RefreshTokenDto = req.body;
      const tokens = await this.authService.refreshToken(refreshTokenDto);
      
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== EMAIL VERIFICATION ====================

  /**
   * Verify email - GET method (for web)
   * GET /api/v1/auth/verify-email/:token
   */
  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.params.token;
      const result = await this.authService.verifyEmail(token);
      
      // Log audit - find user by token to get userId
      try {
        const { User } = require('../../models/User.model');
        const user = await User.findOne({ verificationToken: token });
        if (user) {
          await auditService.createLog({
            userId: user._id.toString(),
            action: AuditAction.USER_VERIFIED,
            status: AuditStatus.SUCCESS,
            resource: 'user',
            resourceId: user._id.toString(),
            ip: req.ip || req.headers['x-forwarded-for'] as string || '',
            userAgent: req.headers['user-agent'] || '',
            details: {
              email: user.email,
            },
          });
        }
      } catch (auditError) {
        logger.warn('Failed to create audit log for email verification:', auditError);
      }
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: { verified: true },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: {
          message: (error as Error).message,
        },
      });
    }
  };

  /**
   * Verify email - POST method (for mobile)
   * POST /api/v1/auth/verify-email
   */
  verifyEmailPost = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body as VerifyEmailDto;
      const result = await this.authService.verifyEmail(token);
      
      // Log audit - find user by token to get userId
      try {
        const { User } = require('../../models/User.model');
        const user = await User.findOne({ verificationToken: token });
        if (user) {
          await auditService.createLog({
            userId: user._id.toString(),
            action: AuditAction.USER_VERIFIED,
            status: AuditStatus.SUCCESS,
            resource: 'user',
            resourceId: user._id.toString(),
            ip: req.ip || req.headers['x-forwarded-for'] as string || '',
            userAgent: req.headers['user-agent'] || '',
            details: {
              email: user.email,
            },
          });
        }
      } catch (auditError) {
        logger.warn('Failed to create audit log for email verification:', auditError);
      }
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: { verified: true },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend verification email (authenticated)
   * POST /api/v1/auth/resend-verification
   */
  resendVerification = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const result = await this.authService.resendVerification(userId);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Resend verification email by email (public)
   * POST /api/v1/auth/resend-verification-by-email
   */
  resendVerificationByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body as ResendVerificationDto;
      const result = await this.authService.resendVerificationByEmail(email);
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Forgot password
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const forgotPasswordDto: ForgotPasswordDto = req.body;
      const result = await this.authService.forgotPassword(forgotPasswordDto);
      
      // Log audit (without userId since user may not exist)
      try {
        const { User } = require('../../models/User.model');
        const user = await User.findOne({ email: forgotPasswordDto.email });
        if (user) {
          await auditService.createLog({
            userId: user._id.toString(),
            action: AuditAction.PASSWORD_RESET,
            status: AuditStatus.SUCCESS,
            resource: 'user',
            resourceId: user._id.toString(),
            ip: req.ip || req.headers['x-forwarded-for'] as string || '',
            userAgent: req.headers['user-agent'] || '',
            details: {
              email: forgotPasswordDto.email,
            },
          });
        }
      } catch (auditError) {
        logger.warn('Failed to create audit log for forgot password:', auditError);
      }
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resetPasswordDto: ResetPasswordDto = req.body;
      const result = await this.authService.resetPassword(resetPasswordDto);
      
      // Log audit - find user by token
      try {
        const { User } = require('../../models/User.model');
        const user = await User.findOne({ resetPasswordToken: resetPasswordDto.token });
        if (user) {
          await auditService.createLog({
            userId: user._id.toString(),
            action: AuditAction.PASSWORD_RESET,
            status: AuditStatus.SUCCESS,
            resource: 'user',
            resourceId: user._id.toString(),
            ip: req.ip || req.headers['x-forwarded-for'] as string || '',
            userAgent: req.headers['user-agent'] || '',
            details: {
              email: user.email,
            },
          });
        }
      } catch (auditError) {
        logger.warn('Failed to create audit log for reset password:', auditError);
      }
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change password (authenticated)
   * PUT /api/v1/auth/change-password
   */
  changePassword = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { currentPassword, newPassword } = req.body as ChangePasswordDto;
      const result = await this.authService.changePassword(userId, currentPassword, newPassword);
      
      // Log audit
      await auditService.createLog({
        userId,
        action: AuditAction.PASSWORD_CHANGED,
        status: AuditStatus.SUCCESS,
        resource: 'user',
        resourceId: userId,
        ip: req.ip || req.headers['x-forwarded-for'] as string || '',
        userAgent: req.headers['user-agent'] || '',
        details: {
          passwordChanged: true,
        },
      });
      
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };

  // ==================== USER INFO & LOGOUT ====================

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const user = await this.authService.getCurrentUser(userId);
      
      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const refreshToken = req.body.refreshToken;
      
      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
        });
        return;
      }
      
      await this.authService.logout(userId, refreshToken);
      
      // Log audit
      await auditService.createLog({
        userId,
        action: AuditAction.USER_LOGOUT,
        status: AuditStatus.SUCCESS,
        resource: 'user',
        resourceId: userId,
        ip: req.ip || req.headers['x-forwarded-for'] as string || '',
        userAgent: req.headers['user-agent'] || '',
        details: {
          logoutType: 'single',
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout from all devices
   * POST /api/v1/auth/logout-all
   */
  logoutAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      await this.authService.logoutAll(userId);
      
      // Log audit
      await auditService.createLog({
        userId,
        action: AuditAction.USER_LOGOUT,
        status: AuditStatus.SUCCESS,
        resource: 'user',
        resourceId: userId,
        ip: req.ip || req.headers['x-forwarded-for'] as string || '',
        userAgent: req.headers['user-agent'] || '',
        details: {
          logoutType: 'all_devices',
        },
      });
      
      res.status(200).json({
        success: true,
        message: 'Logged out from all devices successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}