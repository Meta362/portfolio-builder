// src/modules/ai/dto/score-portfolio.dto.ts
import { IsString, IsOptional, IsEnum, Length } from 'class-validator';

export class ScorePortfolioDto {
  @IsString()
  @Length(24, 24, { message: 'Portfolio ID must be exactly 24 characters' })
  portfolioId!: string;

  @IsOptional()
  @IsEnum(['km', 'en'])
  language?: 'km' | 'en';
}