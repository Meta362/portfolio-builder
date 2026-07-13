// src/modules/users/dto/user-response.dto.ts
import { IUser } from '../../../models/User.model';

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  roles: string[];
  subscriptionTier: string;
  preferences: {
    language: string;
    timezone: string;
    darkMode: boolean;
  };
  metadata: {
    lastLogin?: Date;
    loginCount: number;
    createdAt: Date;
    updatedAt: Date;
  };
  telegramChatId?: string;
  deletedAt?: Date;

  constructor(user: IUser) {
    this.id = user._id.toString();
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.fullName = `${user.firstName} ${user.lastName}`;
    this.avatarUrl = user.avatarUrl;
    this.isEmailVerified = user.isEmailVerified;
    this.roles = user.roles;
    this.subscriptionTier = user.subscriptionTier;
    this.preferences = user.preferences;
    this.metadata = user.metadata;
    this.telegramChatId = user.telegramChatId;
    this.deletedAt = user.deletedAt;
  }

  static fromUser(user: IUser): UserResponseDto {
    return new UserResponseDto(user);
  }

  static fromUsers(users: IUser[]): UserResponseDto[] {
    return users.map(user => new UserResponseDto(user));
  }
}