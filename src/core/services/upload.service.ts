// src/core/services/upload.service.ts
import cloudinary, { cloudinaryConfig } from '../../config/cloudinary';
import { File, IFile, FileType } from '../../modules/upload/models/file.model';
import { UploadType } from '../../modules/upload/dto/upload.dto';
import { BadRequestException, NotFoundException } from '../exceptions/base.exception';
import logger from '../../config/logger';

export interface UploadOptions {
  userId: string;
  file: Express.Multer.File;
  type: UploadType;
  folder?: string;
  quality?: number;
  width?: number;
  height?: number;
}

export interface UploadResult {
  file: IFile;
  url: string;
  secureUrl: string;
  publicId: string;
}

export class UploadService {
  private static instance: UploadService;

  static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  /**
   * Upload single file
   */
  async uploadFile(options: UploadOptions): Promise<UploadResult> {
    try {
      const { userId, file, type, folder, quality = 80, width, height } = options;

      // Determine folder
      const uploadFolder = folder || this.getFolderByType(type);

      // Prepare upload options
      const uploadOptions: any = {
        folder: uploadFolder,
        quality: quality,
        resource_type: 'auto',
        transformation: [],
      };

      // Add resizing if specified
      if (width && height) {
        uploadOptions.transformation.push({
          width: width,
          height: height,
          crop: 'fill',
          gravity: 'auto',
        });
      } else if (type === UploadType.AVATAR) {
        // Default avatar size
        uploadOptions.transformation.push({
          width: cloudinaryConfig.avatarWidth,
          height: cloudinaryConfig.avatarHeight,
          crop: 'fill',
          gravity: 'auto',
        });
      }

      // Upload to Cloudinary
      const result = await this.uploadToCloudinary(file.buffer, uploadOptions);

      // Create file record in database
      const fileRecord = await File.create({
        userId,
        filename: result.public_id.split('/').pop(),
        originalName: file.originalname,
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
        type: type,
        mimeType: file.mimetype,
        size: file.size,
        width: result.width,
        height: result.height,
        format: result.format,
        metadata: {
          originalName: file.originalname,
          uploadTimestamp: new Date(),
        },
      });

      logger.info(`File uploaded successfully: ${result.public_id} by user ${userId}`);

      return {
        file: fileRecord,
        url: result.url,
        secureUrl: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      logger.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    userId: string,
    files: Express.Multer.File[],
    type: UploadType,
    folder?: string
  ): Promise<UploadResult[]> {
    try {
      const results: UploadResult[] = [];

      for (const file of files) {
        try {
          const result = await this.uploadFile({
            userId,
            file,
            type,
            folder,
          });
          results.push(result);
        } catch (error) {
          logger.error(`Failed to upload file: ${file.originalname}`, error);
          // Continue with next file
        }
      }

      return results;
    } catch (error) {
      logger.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  /**
   * Upload to Cloudinary
   */
  private async uploadToCloudinary(buffer: Buffer, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }).end(buffer);
    });
  }

  /**
   * Get folder by type
   */
  private getFolderByType(type: UploadType): string {
    switch (type) {
      case UploadType.AVATAR:
        return cloudinaryConfig.avatarFolder;
      case UploadType.PROJECT:
        return cloudinaryConfig.projectFolder;
      default:
        return cloudinaryConfig.folder;
    }
  }

  /**
   * Delete file by public ID
   */
  async deleteFile(userId: string, publicId: string): Promise<void> {
    try {
      // Find file in database
      const file = await File.findOne({ publicId, userId, isDeleted: false });
      
      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw new Error(`Failed to delete file from Cloudinary: ${result.result}`);
      }

      // Soft delete in database
      file.isDeleted = true;
      file.deletedAt = new Date();
      await file.save();

      logger.info(`File deleted: ${publicId} by user ${userId}`);
    } catch (error) {
      logger.error('Error deleting file:', error);
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(userId: string, publicIds: string[]): Promise<{ deleted: number; failed: number }> {
    try {
      let deleted = 0;
      let failed = 0;

      for (const publicId of publicIds) {
        try {
          await this.deleteFile(userId, publicId);
          deleted++;
        } catch (error) {
          failed++;
        }
      }

      return { deleted, failed };
    } catch (error) {
      logger.error('Error deleting multiple files:', error);
      throw error;
    }
  }

  /**
   * Get files by user
   */
  async getFilesByUser(userId: string, type?: FileType): Promise<IFile[]> {
    try {
      const filter: any = { userId, isDeleted: false };
      if (type) {
        filter.type = type;
      }

      return await File.find(filter).sort({ createdAt: -1 });
    } catch (error) {
      logger.error('Error getting files by user:', error);
      throw error;
    }
  }

  /**
   * Get file by ID
   */
  async getFileById(id: string, userId: string): Promise<IFile> {
    try {
      const file = await File.findOne({ _id: id, userId, isDeleted: false });
      
      if (!file) {
        throw new NotFoundException('File not found');
      }

      return file;
    } catch (error) {
      logger.error('Error getting file by ID:', error);
      throw error;
    }
  }

  /**
   * Get user avatar
   */
  async getUserAvatar(userId: string): Promise<IFile | null> {
    try {
      const avatar = await File.findOne({
        userId,
        type: FileType.AVATAR,
        isDeleted: false,
      }).sort({ createdAt: -1 });

      return avatar;
    } catch (error) {
      logger.error('Error getting user avatar:', error);
      throw error;
    }
  }
}

export const uploadService = UploadService.getInstance();