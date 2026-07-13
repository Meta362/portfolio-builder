// src/modules/audit/dto/audit-query.dto.ts
import { IsOptional, IsString, IsEnum, IsDate, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { AuditAction, AuditStatus } from '../models/audit-log.model';

export class AuditQueryDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsString()
  resource?: string;

  @IsOptional()
  @IsString()
  resourceId?: string;

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

  @IsOptional()
  @IsString()
  sortBy?: string = 'timestamp';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class AuditLogResponseDto {
  id: string;
  userId: string;
  action: string;
  status: string;
  resource: string;
  resourceId?: string;
  ip?: string;
  userAgent?: string;
  device?: string;
  platform?: string;
  browser?: string;
  location?: {
    country?: string;
    city?: string;
  };
  details: Record<string, any>;
  changes: Array<{
    field: string;
    oldValue: any;
    newValue: any;
  }>;
  timestamp: Date;
  createdAt: Date;

  constructor(log: any) {
    this.id = log._id.toString();
    this.userId = log.userId;
    this.action = log.action;
    this.status = log.status;
    this.resource = log.resource;
    this.resourceId = log.resourceId;
    this.ip = log.ip;
    this.userAgent = log.userAgent;
    this.device = log.device;
    this.platform = log.platform;
    this.browser = log.browser;
    this.location = log.location;
    this.details = log.details;
    this.changes = log.changes || [];
    this.timestamp = log.timestamp;
    this.createdAt = log.createdAt;
  }
}