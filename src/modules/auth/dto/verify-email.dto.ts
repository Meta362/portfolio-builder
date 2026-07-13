// src/modules/auth/dto/verify-email.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token!: string;
}