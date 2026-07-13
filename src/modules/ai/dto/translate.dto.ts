// src/modules/ai/dto/translate.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class TranslateDto {
  @IsString()
  content!: string;

  @IsEnum(['km', 'en'])
  targetLanguage!: 'km' | 'en';

  @IsOptional()
  @IsEnum(['km', 'en'])
  sourceLanguage?: 'km' | 'en';
}