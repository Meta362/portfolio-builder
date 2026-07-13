// src/models/User.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  telegramChatId?: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  roles: string[];
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  preferences: {
    language: 'km' | 'en';
    timezone: string;
    darkMode: boolean;
  };
  metadata: {
    lastLogin?: Date;
    loginCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  refreshTokens: string[];
  deletedAt?: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): string;
  generateResetToken(): string;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    avatarUrl: {
      type: String,
      default: null
    },
    telegramChatId: {
      type: String,
      sparse: true,
      unique: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: {
      type: String,
      select: false
    },
    verificationTokenExpires: {
      type: Date,
      select: false
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpires: {
      type: Date,
      select: false
    },
    roles: {
      type: [String],
      enum: ['user', 'admin', 'moderator'],
      default: ['user']
    },
    subscriptionTier: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free'
    },
    preferences: {
      language: {
        type: String,
        enum: ['km', 'en'],
        default: 'en'
      },
      timezone: {
        type: String,
        default: 'Asia/Phnom_Penh'
      },
      darkMode: {
        type: Boolean,
        default: false
      }
    },
    metadata: {
      lastLogin: {
        type: Date
      },
      loginCount: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.refreshTokens;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      }
    }
  }
);

// Pre-save hook to hash password
UserSchema.pre('save', function(this: IUser, next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    this.password = bcrypt.hashSync(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate verification token
UserSchema.methods.generateVerificationToken = function(this: IUser): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return token;
};

// Generate reset token
UserSchema.methods.generateResetToken = function(this: IUser): string {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = token;
  this.resetPasswordExpires = new Date(Date.now() + 1 * 60 * 60 * 1000);
  return token;
};

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ telegramChatId: 1 }, { sparse: true });
UserSchema.index({ verificationToken: 1 }, { sparse: true });
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

// Use type assertion to avoid TypeScript errors
export const User = mongoose.model<IUser>('User', UserSchema);