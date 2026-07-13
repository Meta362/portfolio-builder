// src/modules/admin/dto/system-config.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, IsObject, IsArray } from 'class-validator';

export class CreateSystemConfigDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsNotEmpty()
  value!: any;

  @IsEnum(['string', 'number', 'boolean', 'object', 'array'])
  type!: 'string' | 'number' | 'boolean' | 'object' | 'array';

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdateSystemConfigDto {
  @IsOptional()
  value?: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class SystemConfigResponseDto {
  key: string;
  value: any;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
  updatedBy: string;
  updatedAt: Date;

  constructor(config: any) {
    this.key = config.key;
    this.value = config.value;
    this.type = config.type;
    this.category = config.category;
    this.description = config.description;
    this.isPublic = config.isPublic;
    this.updatedBy = config.updatedBy;
    this.updatedAt = config.updatedAt;
  }
}