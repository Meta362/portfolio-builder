// src/modules/portfolios/dto/portfolio-response.dto.ts
import { IPortfolio } from '../models/portfolio.model';

export class PortfolioResponseDto {
  id: string;
  userId: string;
  username: string;
  title: string;
  subtitle?: string;
  about?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  status: string;
  visibility: string;
  skills: any[];
  projects: any[];
  experience: any[];
  education: any[];
  design: any;
  socialLinks: any;
  contactEmail?: string;
  contactPhone?: string;
  analytics: {
    views: number;
    uniqueViews: number;
    downloads: number;
    contacts: number;
    shareCount: number;
  };
  publishedAt?: Date;
  lastPublishedAt?: Date;
  version: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(portfolio: IPortfolio) {
    this.id = portfolio._id.toString();
    this.userId = portfolio.userId;
    this.username = portfolio.username;
    this.title = portfolio.title;
    this.subtitle = portfolio.subtitle;
    this.about = portfolio.about;
    this.avatarUrl = portfolio.avatarUrl;
    this.coverImageUrl = portfolio.coverImageUrl;
    this.status = portfolio.status;
    this.visibility = portfolio.visibility;
    this.skills = portfolio.skills;
    this.projects = portfolio.projects;
    this.experience = portfolio.experience;
    this.education = portfolio.education;
    this.design = portfolio.design;
    this.socialLinks = portfolio.socialLinks;
    this.contactEmail = portfolio.contactEmail;
    this.contactPhone = portfolio.contactPhone;
    this.analytics = portfolio.analytics;
    this.publishedAt = portfolio.publishedAt;
    this.lastPublishedAt = portfolio.lastPublishedAt;
    this.version = portfolio.version;
    this.createdAt = portfolio.createdAt;
    this.updatedAt = portfolio.updatedAt;
  }

  static fromPortfolio(portfolio: IPortfolio): PortfolioResponseDto {
    return new PortfolioResponseDto(portfolio);
  }

  static fromPortfolios(portfolios: IPortfolio[]): PortfolioResponseDto[] {
    return portfolios.map(p => new PortfolioResponseDto(p));
  }
}