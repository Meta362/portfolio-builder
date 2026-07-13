// src/modules/auth/interfaces/auth.interface.ts
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    roles: string[];
    subscriptionTier: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface LoginResponse extends AuthResponse {}
export interface RegisterResponse extends AuthResponse {}