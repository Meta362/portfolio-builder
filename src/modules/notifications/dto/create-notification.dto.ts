// src/modules/notifications/dto/create-notification.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType, NotificationPriority, NotificationChannel } from '../models/notification.model';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiresAt?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}