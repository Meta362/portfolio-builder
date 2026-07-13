// src/modules/upload/dto/upload.dto.ts
import { IsOptional, IsString, IsEnum, IsNumber, Min, Max } from 'class-validator';

export enum UploadType {
  AVATAR = 'avatar',
  PROJECT = 'project',
}

export class UploadDto {
  @IsEnum(UploadType, { message: 'Type must be avatar or project' })
  type!: UploadType;

  @IsOptional()
  @IsString()
  folder?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  quality?: number = 80;
}

export class UploadResponseDto {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  filename: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
  format?: string;

  constructor(file: any) {
    this.id = file._id.toString();
    this.url = file.url;
    this.secureUrl = file.secureUrl;
    this.publicId = file.publicId;
    this.filename = file.filename;
    this.type = file.type;
    this.size = file.size;
    this.width = file.width;
    this.height = file.height;
    this.format = file.format;
  }
}

export class MultipleUploadResponseDto {
  files: UploadResponseDto[];
  total: number;
  successful: number;
  failed: number;

  constructor(files: any[]) {
    this.files = files.map(f => new UploadResponseDto(f));
    this.total = files.length;
    this.successful = files.filter(f => f).length;
    this.failed = files.length - this.successful;
  }
}

export class DeleteFileDto {
  @IsString()
  publicId!: string;
}