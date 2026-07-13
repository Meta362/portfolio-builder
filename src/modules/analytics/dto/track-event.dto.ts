// src/modules/analytics/dto/track-event.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsNumber, IsUUID } from 'class-validator';
import { AnalyticsEventType, AnalyticsSource } from '../models/analytics-event.model';

export class TrackEventDto {
  @IsEnum(AnalyticsEventType)
  eventType!: AnalyticsEventType;

  @IsOptional()
  @IsEnum(AnalyticsSource)
  source?: AnalyticsSource;

  @IsOptional()
  @IsObject()
  metadata?: {
    ip?: string;
    userAgent?: string;
    device?: string;
    platform?: string;
    browser?: string;
    referrer?: string;
    url?: string;
    path?: string;
    query?: string;
  };

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

export class TrackSessionDto {
  @IsUUID()
  sessionId!: string;

  @IsOptional()
  @IsObject()
  device?: {
    type?: string;
    platform?: string;
    browser?: string;
    os?: string;
    version?: string;
  };

  @IsOptional()
  @IsObject()
  location?: {
    ip?: string;
    country?: string;
    city?: string;
  };
}