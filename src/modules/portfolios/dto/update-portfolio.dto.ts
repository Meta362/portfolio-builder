// src/modules/portfolios/dto/update-portfolio.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreatePortfolioDto } from './create-portfolio.dto';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PortfolioStatus } from '../models/portfolio.model';

export class UpdatePortfolioDto extends PartialType(CreatePortfolioDto) {
  @IsOptional()
  @IsEnum(PortfolioStatus)
  status?: PortfolioStatus;

  @IsOptional()
  @IsString()
  username?: string;
}