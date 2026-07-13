// src/modules/auth/auth.service.ts
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { 
  UnauthorizedException, 
  BadRequestException,
  NotFoundException 
} from '../../core/exceptions/base.exception';
import { TokenPayload, TokenResponse } from './interfaces/token.interface';
import { emailService } from '../../core/services/email.service';
import logger from '../../config/logger';

export class AuthService {
  private authRepository: AuthRepository;
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly jwtExpiry: string;
  private readonly refreshExpiry: string;

  constructor() {
    this.authRepository = new AuthRepository();
    this.jwtSecret = process.env.JWT_SECRET || 'default-secret';
    this.refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret';
    this.jwtExpiry = process.env.JWT_EXPIRY || '7d';
    this.refreshExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d';
  }

  /**
   * Register new user
   */
  async register(registerDto: RegisterDto) {
    try {
      // Check if user already exists
      const existingUser = await this.authRepository.findByEmail(registerDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already registered');
      }

      // Create user
      const user = await this.authRepository.create({
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        preferences: {
          language: registerDto.language || 'en',
          timezone: 'Asia/Phnom_Penh',
          darkMode: false
        }
      });

      // Generate verification token
      const verificationToken = user.generateVerificationToken();
      await user.save();

      // Get user ID as string
      const userId = user._id.toString();

      // Generate JWT tokens
      const tokens = this.generateTokens({
        userId: userId,
        email: user.email,
        roles: user.roles
      });

      // Save refresh token
      await this.authRepository.addRefreshToken(userId, tokens.refreshToken);

      // Send verification email
      try {
        await emailService.sendVerificationEmail({
          to: user.email,
          name: user.firstName,
          token: verificationToken,
        });
      } catch (emailError) {
        logger.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      logger.info(`User registered: ${user.email} (${userId})`);

      return {
        user: {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          roles: user.roles,
          subscriptionTier: user.subscriptionTier
        },
        tokens
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(loginDto: LoginDto) {
    try {
      // Find user by email
      const user = await this.authRepository.findByEmail(loginDto.email);
      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if user is deleted
      if (user.deletedAt) {
        throw new UnauthorizedException('Account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(loginDto.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Get user ID as string
      const userId = user._id.toString();

      // Generate tokens
      const tokens = this.generateTokens({
        userId: userId,
        email: user.email,
        roles: user.roles
      });

      // Save refresh token
      await this.authRepository.addRefreshToken(userId, tokens.refreshToken);

      // Update login metadata
      await this.authRepository.updateLoginMetadata(userId);

      logger.info(`User logged in: ${user.email} (${userId})`);

      return {
        user: {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isEmailVerified: user.isEmailVerified,
          roles: user.roles,
          subscriptionTier: user.subscriptionTier
        },
        tokens
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    try {
      const { refreshToken } = refreshTokenDto;

      // Verify refresh token
      let decoded: TokenPayload;
      try {
        decoded = jwt.verify(refreshToken, this.refreshSecret) as TokenPayload;
      } catch (error) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Find user
      const user = await this.authRepository.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Check if refresh token exists in user's tokens
      if (!user.refreshTokens?.includes(refreshToken)) {
        throw new UnauthorizedException('Refresh token not found');
      }

      // Get user ID as string
      const userId = user._id.toString();

      // Generate new tokens
      const newTokens = this.generateTokens({
        userId: userId,
        email: user.email,
        roles: user.roles
      });

      // Remove old refresh token and add new one
      await this.authRepository.removeRefreshToken(userId, refreshToken);
      await this.authRepository.addRefreshToken(userId, newTokens.refreshToken);

      logger.info(`Token refreshed for user: ${user.email} (${userId})`);

      return newTokens;
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string, refreshToken: string) {
    try {
      await this.authRepository.removeRefreshToken(userId, refreshToken);
      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string) {
    try {
      await this.authRepository.removeAllRefreshTokens(userId);
      logger.info(`User logged out from all devices: ${userId}`);
    } catch (error) {
      logger.error('Logout all error:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string) {
    try {
      logger.info(`Verifying email with token: ${token.substring(0, 20)}...`);

      // Find user by token
      const user = await this.authRepository.findByVerificationToken(token);
      
      if (!user) {
        logger.warn(`No user found with token: ${token.substring(0, 20)}...`);
        throw new BadRequestException('Invalid or expired verification token');
      }

      // Check if email already verified
      if (user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Check if token expired
      if (user.verificationTokenExpires && user.verificationTokenExpires < new Date()) {
        throw new BadRequestException('Verification token has expired. Please request a new one.');
      }

      // Verify email
      const userId = user._id.toString();
      await this.authRepository.verifyEmail(userId);

      // Send welcome email
      try {
        await emailService.sendWelcomeEmail({
          to: user.email,
          name: user.firstName,
        });
      } catch (emailError) {
        logger.error('Failed to send welcome email:', emailError);
      }

      logger.info(`Email verified successfully for user: ${user.email} (${userId})`);
      return { message: 'Email verified successfully' };
      
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Resend verification email (authenticated)
   */
  async resendVerification(userId: string) {
    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Generate new verification token
      const verificationToken = user.generateVerificationToken();
      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail({
        to: user.email,
        name: user.firstName,
        token: verificationToken,
      });

      logger.info(`Verification email resent for user: ${user.email} (${userId})`);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }

  /**
   * Resend verification email by email (public)
   */
  async resendVerificationByEmail(email: string) {
    try {
      const user = await this.authRepository.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not (security)
        return { message: 'If your email is registered, a verification link has been sent' };
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email already verified');
      }

      // Generate new verification token
      const verificationToken = user.generateVerificationToken();
      await user.save();

      // Send verification email
      await emailService.sendVerificationEmail({
        to: user.email,
        name: user.firstName,
        token: verificationToken,
      });

      logger.info(`Verification email resent for user: ${user.email}`);
      return { message: 'Verification email sent successfully' };
    } catch (error) {
      logger.error('Resend verification by email error:', error);
      throw error;
    }
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.authRepository.findByEmail(forgotPasswordDto.email);
      if (!user) {
        // Don't reveal if email exists or not (security)
        return { message: 'If your email is registered, you will receive a password reset link' };
      }

      // Generate reset token
      const resetToken = user.generateResetToken();
      await user.save();

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail({
          to: user.email,
          name: user.firstName,
          token: resetToken,
        });
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
      }

      const userId = user._id.toString();
      logger.info(`Password reset requested for: ${user.email} (${userId})`);

      return { message: 'If your email is registered, you will receive a password reset link' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const { token, newPassword } = resetPasswordDto;

      const user = await this.authRepository.findByResetToken(token);
      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Update password
      user.password = newPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      // Get user ID as string
      const userId = user._id.toString();

      // Remove all refresh tokens (force re-login)
      await this.authRepository.removeAllRefreshTokens(userId);

      logger.info(`Password reset for user: ${user.email} (${userId})`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Change password (authenticated)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Update password
      user.password = newPassword;
      await user.save();

      // Remove all refresh tokens (force re-login)
      await this.authRepository.removeAllRefreshTokens(userId);

      logger.info(`Password changed for user: ${user.email} (${userId})`);
      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(userId: string) {
    try {
      const user = await this.authRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        roles: user.roles,
        subscriptionTier: user.subscriptionTier,
        preferences: user.preferences,
        metadata: user.metadata
      };
    } catch (error) {
      logger.error('Get current user error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(payload: TokenPayload): TokenResponse {
    const accessToken = jwt.sign(
      { 
        userId: payload.userId, 
        email: payload.email, 
        roles: payload.roles 
      }, 
      this.jwtSecret, 
      { expiresIn: this.jwtExpiry as any }
    );

    const refreshToken = jwt.sign(
      { 
        userId: payload.userId, 
        email: payload.email, 
        roles: payload.roles 
      }, 
      this.refreshSecret, 
      { expiresIn: this.refreshExpiry as any }
    );

    const expiresIn = this.parseExpiry(this.jwtExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Parse JWT expiry to seconds
   */
  private parseExpiry(expiry: string): number {
    const match = expiry.match(/^(\d+)([dhm])$/);
    if (!match) {
      return 7 * 24 * 60 * 60; // Default 7 days
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60;
      case 'h': return value * 60 * 60;
      case 'm': return value * 60;
      default: return 7 * 24 * 60 * 60;
    }
  }
}