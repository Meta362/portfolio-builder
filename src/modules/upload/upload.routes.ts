// src/modules/upload/upload.routes.ts
import { Router } from 'express';
import { UploadController } from './upload.controller';
import { authenticate } from '../../core/middlewares/auth.middleware';
import { validate } from '../../core/middlewares/validation.middleware';
import { uploadSingle, uploadMultiple } from './upload.middleware';
import { UploadDto, DeleteFileDto } from './dto/upload.dto';

const router = Router();
const controller = new UploadController();

// All routes require authentication
router.use(authenticate);

// Upload routes
router.post(
  '/',
  uploadSingle(),
  validate(UploadDto),
  controller.uploadSingle
);

router.post(
  '/multiple',
  uploadMultiple('files', 5),
  controller.uploadMultiple
);

router.post(
  '/avatar',
  uploadSingle('file'),
  controller.uploadAvatar
);

router.post(
  '/delete-multiple',
  controller.deleteMultiple
);

// Get routes
router.get('/', controller.getUserFiles);

router.get('/:id', controller.getFileById);

// Delete routes
router.delete('/:publicId', controller.deleteFile);

export default router;