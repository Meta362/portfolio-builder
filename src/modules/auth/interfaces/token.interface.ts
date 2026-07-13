// src/modules/auth/interfaces/token.interface.ts
export interface TokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface DecodedToken {
  userId: string;
  email: string;
  roles: string[];
  iat: number;
  exp: number;
}