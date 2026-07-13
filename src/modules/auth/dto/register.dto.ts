// src/modules/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(50, { message: 'Password must be less than 50 characters' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must be less than 50 characters' })
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must be less than 50 characters' })
  lastName!: string;

  @IsOptional()
  @IsEnum(['km', 'en'], { message: 'Language must be km or en' })
  language?: 'km' | 'en';
}