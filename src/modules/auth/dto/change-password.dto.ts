// src/modules/auth/dto/change-password.dto.ts
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'Current password must be at least 8 characters' })
  @MaxLength(100, { message: 'Current password must not exceed 100 characters' })
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters' })
  @MaxLength(100, { message: 'New password must not exceed 100 characters' })
  newPassword!: string;
}