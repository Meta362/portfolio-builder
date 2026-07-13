// src/modules/users/dto/update-profile.dto.ts
import { IsString, IsOptional, MaxLength, IsEnum, IsBoolean } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Last name must be less than 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsEnum(['km', 'en'], { message: 'Language must be km or en' })
  language?: 'km' | 'en';

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}