// src/config/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';
import logger from './logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

// Verify connection
export const verifyCloudinaryConnection = async (): Promise<boolean> => {
  try {
    // Try to get account details to verify connection
    const result = await cloudinary.api.ping();
    logger.info('✅ Cloudinary connected successfully');
    return true;
  } catch (error) {
    logger.error('❌ Cloudinary connection failed:', error);
    return false;
  }
};

export const cloudinaryConfig = {
  folder: 'portfolio-builder',
  avatarFolder: 'portfolio-builder/avatars',
  projectFolder: 'portfolio-builder/projects',
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxAvatarSize: 2 * 1024 * 1024, // 2MB
  avatarWidth: 300,
  avatarHeight: 300,
  projectWidth: 1200,
  projectHeight: 800,
};

export default cloudinary;