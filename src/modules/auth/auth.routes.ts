// src/modules/auth/auth.routes.ts
import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { authRateLimiter } from '../../core/middlewares/rate-limiter.middleware';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';

const router = Router();
const authController = new AuthController();

// ==================== PUBLIC ROUTES ====================

// Register
router.post(
  '/register',
  authRateLimiter,
  validate(RegisterDto),
  authController.register
);

// Login
router.post(
  '/login',
  authRateLimiter,
  validate(LoginDto),
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  validate(RefreshTokenDto),
  authController.refreshToken
);

// ==================== EMAIL VERIFICATION ====================

// ✅ GET - Verify email with token in URL (for web)
router.get(
  '/verify-email/:token',
  authController.verifyEmail
);

// ✅ POST - Verify email with token in body (for mobile)
router.post(
  '/verify-email',
  validate(VerifyEmailDto),
  authController.verifyEmailPost
);

// ✅ POST - Resend verification (authenticated)
router.post(
  '/resend-verification',
  authenticate,
  authController.resendVerification
);

// ✅ POST - Resend verification by email (public)
router.post(
  '/resend-verification-by-email',
  validate(ResendVerificationDto),
  authController.resendVerificationByEmail
);

// ==================== PASSWORD MANAGEMENT ====================

// Forgot password
router.post(
  '/forgot-password',
  authRateLimiter,
  validate(ForgotPasswordDto),
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  validate(ResetPasswordDto),
  authController.resetPassword
);

// ==================== PROTECTED ROUTES ====================

// Change password
router.put(
  '/change-password',
  authenticate,
  validate(ChangePasswordDto),
  authController.changePassword
);

// Get current user
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser
);

// Logout
router.post(
  '/logout',
  authenticate,
  authController.logout
);

// Logout all devices
router.post(
  '/logout-all',
  authenticate,
  authController.logoutAll
);

export default router;