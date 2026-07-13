// src/modules/pdf/dto/generate-pdf.dto.ts
import { IsString, IsOptional, IsEnum, Length } from 'class-validator';

export class GeneratePdfDto {
  @IsString()
  @Length(24, 24, { message: 'Portfolio ID must be exactly 24 characters' })
  portfolioId!: string;

  @IsOptional()
  @IsEnum(['A4', 'letter'])
  format?: 'A4' | 'letter';

  @IsOptional()
  @IsEnum(['portrait', 'landscape'])
  orientation?: 'portrait' | 'landscape';

  @IsOptional()
  @IsEnum(['minimal', 'professional', 'creative'])
  template?: 'minimal' | 'professional' | 'creative';

  @IsOptional()
  @IsEnum(['km', 'en'])
  language?: 'km' | 'en';
}