// src/modules/telegram/dto/update-telegram-settings.dto.ts
import { IsOptional, IsBoolean, IsEnum, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationTypesDto {
  @IsOptional()
  @IsBoolean()
  portfolioPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  contactReceived?: boolean;

  @IsOptional()
  @IsBoolean()
  pdfGenerated?: boolean;

  @IsOptional()
  @IsBoolean()
  weeklyDigest?: boolean;

  @IsOptional()
  @IsBoolean()
  systemAlert?: boolean;
}

export class UpdateTelegramSettingsDto {
  @IsOptional()
  @IsBoolean()
  notificationsEnabled?: boolean;

  @IsOptional()
  @IsEnum(['en', 'km'], { message: 'Language must be en or km' })
  language?: 'en' | 'km';

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationTypesDto)
  notificationTypes?: NotificationTypesDto;
}