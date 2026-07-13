// src/modules/users/interfaces/user.interface.ts
import { IUser } from '../../../models/User.model';

export interface IUserService {
  findAll(query: any): Promise<{ users: IUser[]; total: number }>;
  findById(id: string): Promise<IUser>;
  findByEmail(email: string): Promise<IUser | null>;
  create(data: any): Promise<IUser>;
  update(id: string, data: any): Promise<IUser>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<IUser>;
  suspend(id: string): Promise<IUser>;
  getStats(): Promise<any>;
}

export interface IUserRepository {
  findAll(query: any): Promise<{ users: IUser[]; total: number }>;
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string): Promise<IUser | null>;
  create(data: any): Promise<IUser>;
  update(id: string, data: any): Promise<IUser>;
  delete(id: string): Promise<void>;
  restore(id: string): Promise<IUser>;
  suspend(id: string): Promise<IUser>;
  getStats(): Promise<any>;
}