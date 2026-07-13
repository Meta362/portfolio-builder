// src/modules/users/users.routes.ts
import { Router } from 'express';
import { UserController } from './users.controller';
import { authenticate, authorize } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

const router = Router();
const controller = new UserController();

// All routes require authentication
router.use(authenticate);

// ==================== USER PROFILE ====================

// Get current user profile
router.get('/profile', controller.getProfile);

// Update current user profile
router.put('/profile', validate(UpdateProfileDto), controller.updateProfile);

// ==================== ADMIN ONLY ROUTES ====================

// Get all users
router.get('/', authorize('admin'), controller.getAllUsers);

// Get user by ID
router.get('/:id', authorize('admin'), controller.getUserById);

// Create user
router.post('/', authorize('admin'), validate(CreateUserDto), controller.createUser);

// Update user
router.put('/:id', authorize('admin'), validate(UpdateUserDto), controller.updateUser);

// Delete user
router.delete('/:id', authorize('admin'), controller.deleteUser);

// Restore user
router.post('/:id/restore', authorize('admin'), controller.restoreUser);

// Suspend user
router.post('/:id/suspend', authorize('admin'), controller.suspendUser);

// Get user statistics
router.get('/stats', authorize('admin'), controller.getUserStats);

export default router;