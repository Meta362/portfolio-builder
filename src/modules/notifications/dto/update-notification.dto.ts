// src/modules/notifications/dto/update-notification.dto.ts
import { IsOptional, IsBoolean, IsEnum, IsDate } from 'class-validator';
import { NotificationStatus } from '../models/notification.model';
import { Type } from 'class-transformer/types/decorators/type.decorator';

export class UpdateNotificationDto {
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  readAt?: Date;
}