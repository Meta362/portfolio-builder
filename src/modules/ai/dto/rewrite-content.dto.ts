// src/modules/ai/dto/rewrite-content.dto.ts
import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class RewriteContentDto {
  @IsString()
  content!: string;

  @IsOptional()
  @IsEnum(['professional', 'casual', 'creative', 'technical'])
  tone?: 'professional' | 'casual' | 'creative' | 'technical';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  improvements?: string[];

  @IsOptional()
  @IsEnum(['km', 'en'])
  language?: 'km' | 'en';

  @IsOptional()
  @IsString()
  section?: string;
}