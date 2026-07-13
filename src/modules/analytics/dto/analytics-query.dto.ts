// src/modules/analytics/dto/analytics-query.dto.ts
import { IsOptional, IsString, IsEnum, IsDate, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AnalyticsEventType } from '../models/analytics-event.model';

export class AnalyticsQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AnalyticsEventType)
  eventType?: AnalyticsEventType;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AnalyticsStatsDto {
  totalEvents: number;
  uniqueUsers: number;
  eventsByType: Record<string, number>;
  eventsByDay: Array<{ date: string; count: number }>;
  topUsers: Array<{ userId: string; count: number }>;
  period: {
    start: Date;
    end: Date;
  };
}

export class PortfolioAnalyticsDto {
  portfolioId: string;
  views: {
    total: number;
    unique: number;
    byDay: Array<{ date: string; count: number }>;
  };
  downloads: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
  };
  contacts: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
  };
  shares: {
    total: number;
    byDay: Array<{ date: string; count: number }>;
  };
  period: {
    start: Date;
    end: Date;
  };
}