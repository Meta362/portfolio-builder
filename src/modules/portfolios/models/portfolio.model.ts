// src/modules/portfolios/models/portfolio.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export enum PortfolioStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum PortfolioVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private',
  PASSWORD = 'password',
}

export interface ISkill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
  icon?: string;
}

export interface IProject {
  title: string;
  description: string;
  technologies: string[];
  imageUrls: string[];
  projectUrl?: string;
  githubUrl?: string;
  startDate?: Date;
  endDate?: Date;
  featured: boolean;
}

export interface IExperience {
  company: string;
  position: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface IEducation {
  institution: string;
  degree: string;
  field: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  gpa?: string;
  description?: string;
}

export interface IDesign {
  theme: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'classic' | 'modern' | 'creative' | 'minimal';
  animations: boolean;
  darkMode: boolean;
}

export interface IPortfolio extends Document {
  userId: string;
  username: string;
  title: string;
  subtitle?: string;
  about?: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  status: PortfolioStatus;
  visibility: PortfolioVisibility;
  password?: string;
  skills: ISkill[];
  projects: IProject[];
  experience: IExperience[];
  education: IEducation[];
  design: IDesign;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  analytics: {
    views: number;
    uniqueViews: number;
    downloads: number;
    contacts: number;
    shareCount: number;
    lastViewedAt?: Date;
  };
  publishedAt?: Date;
  lastPublishedAt?: Date;
  version: number;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>({
  name: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'intermediate'
  },
  category: { type: String },
  icon: { type: String },
});

const ProjectSchema = new Schema<IProject>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  imageUrls: [{ type: String }],
  projectUrl: { type: String },
  githubUrl: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  featured: { type: Boolean, default: false },
});

const ExperienceSchema = new Schema<IExperience>({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
  achievements: [{ type: String }],
});

const EducationSchema = new Schema<IEducation>({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  current: { type: Boolean, default: false },
  gpa: { type: String },
  description: { type: String },
});

const DesignSchema = new Schema<IDesign>({
  theme: { type: String, default: 'default' },
  colors: {
    primary: { type: String, default: '#667eea' },
    secondary: { type: String, default: '#764ba2' },
    accent: { type: String, default: '#f093fb' },
    background: { type: String, default: '#ffffff' },
    text: { type: String, default: '#333333' },
  },
  fonts: {
    heading: { type: String, default: 'Inter' },
    body: { type: String, default: 'Inter' },
  },
  layout: { 
    type: String, 
    enum: ['classic', 'modern', 'creative', 'minimal'],
    default: 'modern'
  },
  animations: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
});

const PortfolioSchema = new Schema<IPortfolio>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    about: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
    },
    coverImageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(PortfolioStatus),
      default: PortfolioStatus.DRAFT,
    },
    visibility: {
      type: String,
      enum: Object.values(PortfolioVisibility),
      default: PortfolioVisibility.PUBLIC,
    },
    password: {
      type: String,
      select: false,
    },
    skills: [SkillSchema],
    projects: [ProjectSchema],
    experience: [ExperienceSchema],
    education: [EducationSchema],
    design: {
      type: DesignSchema,
      default: () => ({}),
    },
    socialLinks: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      website: { type: String },
    },
    contactEmail: { type: String },
    contactPhone: { type: String },
    analytics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      contacts: { type: Number, default: 0 },
      shareCount: { type: Number, default: 0 },
      lastViewedAt: { type: Date },
    },
    publishedAt: { type: Date },
    lastPublishedAt: { type: Date },
    version: { type: Number, default: 1 },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
PortfolioSchema.index({ userId: 1, status: 1 });
PortfolioSchema.index({ username: 1 });
PortfolioSchema.index({ status: 1, visibility: 1 });

// Pre-save hook to generate username if not provided
PortfolioSchema.pre('save', function(next) {
  if (!this.username && this.title) {
    this.username = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

export const Portfolio = mongoose.model<IPortfolio>('Portfolio', PortfolioSchema);