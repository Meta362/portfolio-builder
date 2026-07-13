// src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateUserDto {
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
  @IsArray()
  @IsEnum(['user', 'admin', 'moderator'], { each: true })
  roles?: string[];

  @IsOptional()
  @IsEnum(['free', 'pro', 'enterprise'])
  subscriptionTier?: 'free' | 'pro' | 'enterprise';
}