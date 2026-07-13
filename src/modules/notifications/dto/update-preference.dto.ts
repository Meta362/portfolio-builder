// src/modules/notifications/dto/update-preference.dto.ts
import { IsOptional, IsBoolean, IsEnum, IsString, IsObject } from 'class-validator';

export class ChannelPreferencesDto {
  @IsOptional()
  @IsBoolean()
  inApp?: boolean;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  telegram?: boolean;
}

export class TypePreferencesDto {
  @IsOptional()
  @IsBoolean()
  system?: boolean;

  @IsOptional()
  @IsBoolean()
  portfolio?: boolean;

  @IsOptional()
  @IsBoolean()
  analytics?: boolean;

  @IsOptional()
  @IsBoolean()
  ai?: boolean;

  @IsOptional()
  @IsBoolean()
  telegram?: boolean;

  @IsOptional()
  @IsBoolean()
  email?: boolean;

  @IsOptional()
  @IsBoolean()
  user?: boolean;

  @IsOptional()
  @IsBoolean()
  security?: boolean;

  @IsOptional()
  @IsBoolean()
  subscription?: boolean;

  @IsOptional()
  @IsBoolean()
  contact?: boolean;

  @IsOptional()
  @IsBoolean()
  pdf?: boolean;
}

export class DigestPreferencesDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'never'])
  frequency?: 'daily' | 'weekly' | 'never';
}

export class QuietHoursDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  start?: string;

  @IsOptional()
  @IsString()
  end?: string;
}

export class UpdatePreferenceDto {
  @IsOptional()
  @IsObject()
  channels?: ChannelPreferencesDto;

  @IsOptional()
  @IsObject()
  types?: TypePreferencesDto;

  @IsOptional()
  @IsObject()
  digest?: DigestPreferencesDto;

  @IsOptional()
  @IsObject()
  quietHours?: QuietHoursDto;
}