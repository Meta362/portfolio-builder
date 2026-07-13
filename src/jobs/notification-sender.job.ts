// src/jobs/notification-sender.job.ts
import logger from '../config/logger';

export async function notificationSenderJob(): Promise<void> {
  try {
    // Your job logic here
    logger.debug('Notification sender job executed');
  } catch (error) {
    logger.error('Notification sender job failed:', error);
    throw error;
  }
}