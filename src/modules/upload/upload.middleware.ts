// src/modules/upload/upload.middleware.ts
import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
import { BadRequestException } from '../../core/exceptions/base.exception';
import logger from '../../config/logger';
import { cloudinaryConfig } from '../../config/cloudinary';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedMimeTypes.join(', ')}`));
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: cloudinaryConfig.maxFileSize,
  },
});

// Single file upload middleware
export const uploadSingle = (fieldName: string = 'file') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestException(`File too large. Max size: ${cloudinaryConfig.maxFileSize / 1024 / 1024}MB`));
          }
          return next(new BadRequestException(`Upload error: ${err.message}`));
        }
        return next(err);
      }
      
      if (!req.file) {
        return next(new BadRequestException('No file uploaded'));
      }
      
      next();
    });
  };
};

// Multiple files upload middleware
export const uploadMultiple = (fieldName: string = 'files', maxCount: number = 5) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new BadRequestException(`Too many files. Max: ${maxCount}`));
          }
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new BadRequestException(`File too large. Max size: ${cloudinaryConfig.maxFileSize / 1024 / 1024}MB`));
          }
          return next(new BadRequestException(`Upload error: ${err.message}`));
        }
        return next(err);
      }
      
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return next(new BadRequestException('No files uploaded'));
      }
      
      next();
    });
  };
};

// Validate file type
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;
    if (!file) {
      return next(new BadRequestException('No file uploaded'));
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return next(new BadRequestException(`File type ${file.mimetype} is not allowed`));
    }

    next();
  };
};