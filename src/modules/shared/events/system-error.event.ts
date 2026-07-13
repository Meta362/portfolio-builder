// src/modules/shared/events/system-error.event.ts

export interface SystemErrorEvent {
  error: string;
  stack?: string;
  path?: string;
  userId?: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class SystemErrorEvent {
  constructor(public readonly data: SystemErrorEvent) {}
}