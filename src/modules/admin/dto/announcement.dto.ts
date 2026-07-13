// src/modules/admin/dto/announcement.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsDate, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { AnnouncementPriority, AnnouncementStatus } from '../models/announcement.model';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTiers?: string[];
}

export class UpdateAnnouncementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(AnnouncementPriority)
  priority?: AnnouncementPriority;

  @IsOptional()
  @IsEnum(AnnouncementStatus)
  status?: AnnouncementStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  publishedAt?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRoles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetTiers?: string[];
}

export class AnnouncementResponseDto {
  id: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  authorId: string;
  publishedAt?: Date;
  expiresAt?: Date;
  targetAudience: {
    roles: string[];
    subscriptionTiers: string[];
  };
  metadata: {
    views: number;
    clicks: number;
  };
  createdAt: Date;
  updatedAt: Date;

  constructor(announcement: any) {
    this.id = announcement._id.toString();
    this.title = announcement.title;
    this.content = announcement.content;
    this.priority = announcement.priority;
    this.status = announcement.status;
    this.authorId = announcement.authorId;
    this.publishedAt = announcement.publishedAt;
    this.expiresAt = announcement.expiresAt;
    this.targetAudience = announcement.targetAudience;
    this.metadata = announcement.metadata;
    this.createdAt = announcement.createdAt;
    this.updatedAt = announcement.updatedAt;
  }
}