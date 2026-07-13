// src/jobs/job-scheduler.ts
import cron, { ScheduledTask } from 'node-cron';
import logger from '../config/logger';
import { aiProcessingJob } from './ai-processing.job';
import { notificationSenderJob } from './notification-sender.job';
import { analyticsAggregatorJob } from './analytics-aggregator.job';
import { weeklyReportJob } from './weekly-report.job';

export class JobScheduler {
  private static instance: JobScheduler;
  private jobs: Map<string, ScheduledTask> = new Map();

  private constructor() {}

  static getInstance(): JobScheduler {
    if (!JobScheduler.instance) {
      JobScheduler.instance = new JobScheduler();
    }
    return JobScheduler.instance;
  }

  /**
   * Start all scheduled jobs
   */
  startAll(): void {
    logger.info('Starting all scheduled jobs...');

    // AI Processing - every 5 minutes
    this.scheduleJob('ai-processing', '*/5 * * * *', async () => {
      await aiProcessingJob();
    });

    // Notification Sender - every 2 minutes
    this.scheduleJob('notification-sender', '*/2 * * * *', async () => {
      await notificationSenderJob();
    });

    // Analytics Aggregator - daily at midnight
    this.scheduleJob('analytics-aggregator', '0 0 * * *', async () => {
      await analyticsAggregatorJob();
    });

    // Weekly Report - Monday at 9:00 AM
    this.scheduleJob('weekly-report', '0 9 * * 1', async () => {
      await weeklyReportJob();
    });

    logger.info('All jobs scheduled successfully');
  }

  /**
   * Schedule a job
   */
  private scheduleJob(name: string, schedule: string, task: () => Promise<void>): void {
    const job = cron.schedule(schedule, async () => {
      try {
        logger.debug(`Running job: ${name}`);
        await task();
        logger.debug(`Job completed: ${name}`);
      } catch (error) {
        logger.error(`Job failed: ${name}`, { error });
      }
    });

    this.jobs.set(name, job);
    logger.info(`Job scheduled: ${name} (${schedule})`);
  }

  /**
   * Stop a specific job
   */
  stopJob(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      logger.info(`Job stopped: ${name}`);
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    for (const [name, job] of this.jobs) {
      job.stop();
      logger.info(`Job stopped: ${name}`);
    }
    this.jobs.clear();
    logger.info('All jobs stopped');
  }

  /**
   * Get job status
   */
  getJobStatus(name: string): boolean {
    const job = this.jobs.get(name);
    return job ? true : false;
  }

  /**
   * Get all job names
   */
  getJobNames(): string[] {
    return Array.from(this.jobs.keys());
  }
}

export const jobScheduler = JobScheduler.getInstance();