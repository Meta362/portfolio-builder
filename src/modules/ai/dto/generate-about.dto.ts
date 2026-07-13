// src/modules/ai/dto/generate-about.dto.ts
import { IsString, IsOptional, IsEnum, Length, IsArray } from 'class-validator';

export class GenerateAboutDto {
  @IsString()
  @Length(24, 24, { message: 'Portfolio ID must be exactly 24 characters' })
  portfolioId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengths?: string[];

  @IsOptional()
  @IsEnum(['professional', 'casual', 'creative'])
  tone?: 'professional' | 'casual' | 'creative';

  @IsOptional()
  @IsEnum(['km', 'en'])
  language?: 'km' | 'en';
}