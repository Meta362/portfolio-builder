// src/modules/portfolios/dto/create-portfolio.dto.ts
import { IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsUrl, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { PortfolioStatus, PortfolioVisibility } from '../models/portfolio.model';

export class SkillDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced', 'expert'])
  level?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class ProjectDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  technologies?: string[];

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  imageUrls?: string[];

  @IsOptional()
  @IsUrl()
  projectUrl?: string;

  @IsOptional()
  @IsUrl()
  githubUrl?: string;

  @IsOptional()
  startDate?: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class ExperienceDto {
  @IsString()
  company!: string;

  @IsString()
  position!: string;

  @IsOptional()
  @IsString()
  location?: string;

  startDate!: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsString()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  achievements?: string[];
}

export class EducationDto {
  @IsString()
  institution!: string;

  @IsString()
  degree!: string;

  @IsString()
  field!: string;

  startDate!: Date;

  @IsOptional()
  endDate?: Date;

  @IsOptional()
  @IsBoolean()
  current?: boolean;

  @IsOptional()
  @IsString()
  gpa?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class DesignDto {
  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };

  @IsOptional()
  fonts?: {
    heading?: string;
    body?: string;
  };

  @IsOptional()
  @IsEnum(['classic', 'modern', 'creative', 'minimal'])
  layout?: string;

  @IsOptional()
  @IsBoolean()
  animations?: boolean;

  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}

export class SocialLinksDto {
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional()
  @IsUrl()
  github?: string;

  @IsOptional()
  @IsUrl()
  twitter?: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  youtube?: string;

  @IsOptional()
  @IsUrl()
  website?: string;
}

export class CreatePortfolioDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  subtitle?: string;

  @IsOptional()
  @IsString()
  about?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsEnum(PortfolioStatus)
  status?: PortfolioStatus;

  @IsOptional()
  @IsEnum(PortfolioVisibility)
  visibility?: PortfolioVisibility;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillDto)
  skills?: SkillDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExperienceDto)
  experience?: ExperienceDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EducationDto)
  education?: EducationDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => DesignDto)
  design?: DesignDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @IsString()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;
}