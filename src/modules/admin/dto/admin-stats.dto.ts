// src/modules/admin/dto/admin-stats.dto.ts
export class AdminStatsDto {
  users: {
    total: number;
    active: number;
    verified: number;
    newToday: number;
    bySubscription: Record<string, number>;
  };
  portfolios: {
    total: number;
    published: number;
    draft: number;
    archived: number;
    newToday: number;
  };
  analytics: {
    totalEvents: number;
    activeSessions: number;
    totalViews: number;
    totalDownloads: number;
    totalContacts: number;
  };
  ai: {
    totalRequests: number;
    totalTokens: number;
    averageCost: number;
  };
  system: {
    uptime: number;
    memory: {
      total: number;
      used: number;
      free: number;
    };
    cpu: number;
    databaseSize: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}