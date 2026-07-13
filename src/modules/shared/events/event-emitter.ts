// src/modules/shared/events/event-emitter.ts
import { EventEmitter as NodeEventEmitter } from 'events';
import logger from '../../../config/logger';

export class EventEmitter {
  private static instance: EventEmitter;
  private emitter: NodeEventEmitter;

  private constructor() {
    this.emitter = new NodeEventEmitter();
    // Increase max listeners to avoid warnings
    this.emitter.setMaxListeners(50);
  }

  static getInstance(): EventEmitter {
    if (!EventEmitter.instance) {
      EventEmitter.instance = new EventEmitter();
    }
    return EventEmitter.instance;
  }

  /**
   * Emit an event synchronously
   */
  emit(event: string, data: any): boolean {
    logger.debug(`Event emitted: ${event}`, { data });
    return this.emitter.emit(event, data);
  }

  /**
   * Emit an event asynchronously
   */
  async emitAsync(event: string, data: any): Promise<boolean> {
    return new Promise((resolve) => {
      logger.debug(`Event emitted (async): ${event}`, { data });
      const result = this.emitter.emit(event, data);
      resolve(result);
    });
  }

  /**
   * Register an event listener
   */
  on(event: string, listener: (...args: any[]) => void): this {
    this.emitter.on(event, listener);
    return this;
  }

  /**
   * Register a one-time event listener
   */
  once(event: string, listener: (...args: any[]) => void): this {
    this.emitter.once(event, listener);
    return this;
  }

  /**
   * Remove an event listener
   */
  off(event: string, listener: (...args: any[]) => void): this {
    this.emitter.off(event, listener);
    return this;
  }

  /**
   * Remove all listeners for an event
   */
  removeAllListeners(event?: string): this {
    if (event) {
      this.emitter.removeAllListeners(event);
    } else {
      this.emitter.removeAllListeners();
    }
    return this;
  }

  /**
   * Get listener count for an event
   */
  listenerCount(event: string): number {
    return this.emitter.listenerCount(event);
  }

  /**
   * Get all event names
   */
  eventNames(): string[] {
    return this.emitter.eventNames() as string[];
  }
}

// Export singleton instance
export const eventEmitter = EventEmitter.getInstance();

// Export event types
export const EVENTS = {
  // User events
  USER_REGISTERED: 'user.registered',
  USER_VERIFIED: 'user.verified',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Portfolio events
  PORTFOLIO_CREATED: 'portfolio.created',
  PORTFOLIO_UPDATED: 'portfolio.updated',
  PORTFOLIO_DELETED: 'portfolio.deleted',
  PORTFOLIO_PUBLISHED: 'portfolio.published',
  PORTFOLIO_UNPUBLISHED: 'portfolio.unpublished',
  PORTFOLIO_VIEWED: 'portfolio.viewed',

  // PDF events
  PDF_GENERATED: 'pdf.generated',
  PDF_DOWNLOADED: 'pdf.downloaded',

  // Contact events
  CONTACT_RECEIVED: 'contact.received',

  // Notification events
  NOTIFICATION_SENT: 'notification.sent',

  // AI events
  AI_REQUEST: 'ai.request',
  AI_COMPLETED: 'ai.completed',

  // System events
  SYSTEM_ERROR: 'system.error',
  SYSTEM_WARNING: 'system.warning',
};