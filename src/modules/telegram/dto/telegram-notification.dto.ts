// src/modules/telegram/dto/telegram-notification.dto.ts
import { IsString, IsOptional, IsObject } from 'class-validator';

export class TelegramNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  type!: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}