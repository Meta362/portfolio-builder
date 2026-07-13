// src/modules/users/dto/update-user.dto.ts
import { IsString, IsOptional, MaxLength, IsEnum, IsArray, IsBoolean } from 'class-validator';

export class UpdateUserDto {
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
  @IsArray()
  @IsEnum(['user', 'admin', 'moderator'], { each: true })
  roles?: string[];

  @IsOptional()
  @IsEnum(['free', 'pro', 'enterprise'])
  subscriptionTier?: 'free' | 'pro' | 'enterprise';

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  telegramChatId?: string;

  @IsOptional()
  preferences?: {
    language?: 'km' | 'en';
    timezone?: string;
    darkMode?: boolean;
  };
}