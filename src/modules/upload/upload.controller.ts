// src/modules/upload/upload.controller.ts
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../core/middlewares/auth.middleware';
import { uploadService } from '../../core/services/upload.service';
import { UploadDto, UploadType, UploadResponseDto, MultipleUploadResponseDto } from './dto/upload.dto';
import { FileType } from './models/file.model';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';

export class UploadController {
  /**
   * Upload single file
   * POST /api/v1/upload
   */
  uploadSingle = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { type, quality, folder } = req.body as UploadDto;
      const file = req.file;

      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Validate type
      if (!type || !Object.values(UploadType).includes(type)) {
        throw new BadRequestException('Invalid upload type');
      }

      const result = await uploadService.uploadFile({
        userId,
        file,
        type: type as UploadType,
        folder,
        quality: quality || 80,
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: new UploadResponseDto(result.file),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload multiple files
   * POST /api/v1/upload/multiple
   */
  uploadMultiple = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { type, folder } = req.body;
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        throw new BadRequestException('No files uploaded');
      }

      // Validate type
      if (!type || !Object.values(UploadType).includes(type)) {
        throw new BadRequestException('Invalid upload type');
      }

      const results = await uploadService.uploadMultipleFiles(
        userId,
        files,
        type as UploadType,
        folder
      );

      res.status(201).json({
        success: true,
        message: `${results.length} files uploaded successfully`,
        data: new MultipleUploadResponseDto(results.map(r => r.file)),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload avatar
   * POST /api/v1/upload/avatar
   */
  uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const file = req.file;

      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      // Delete old avatar if exists
      const oldAvatar = await uploadService.getUserAvatar(userId);
      if (oldAvatar) {
        try {
          await uploadService.deleteFile(userId, oldAvatar.publicId);
        } catch (error) {
          logger.warn('Failed to delete old avatar:', error);
        }
      }

      const result = await uploadService.uploadFile({
        userId,
        file,
        type: UploadType.AVATAR,
        quality: 80,
      });

      res.status(201).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          url: result.secureUrl,
          publicId: result.publicId,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user files
   * GET /api/v1/upload
   */
  getUserFiles = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { type } = req.query;

      const files = await uploadService.getFilesByUser(
        userId,
        type as FileType
      );

      res.status(200).json({
        success: true,
        data: files.map(f => new UploadResponseDto(f)),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete file
   * DELETE /api/v1/upload/:publicId
   */
  deleteFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const publicId = req.params.publicId;

      await uploadService.deleteFile(userId, publicId);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete multiple files
   * POST /api/v1/upload/delete-multiple
   */
  deleteMultiple = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const { publicIds } = req.body;

      if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        throw new BadRequestException('No public IDs provided');
      }

      const result = await uploadService.deleteMultipleFiles(userId, publicIds);

      res.status(200).json({
        success: true,
        message: `${result.deleted} files deleted, ${result.failed} failed`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get file by ID
   * GET /api/v1/upload/:id
   */
  getFileById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const id = req.params.id;

      const file = await uploadService.getFileById(id, userId);

      res.status(200).json({
        success: true,
        data: new UploadResponseDto(file),
      });
    } catch (error) {
      next(error);
    }
  };
}