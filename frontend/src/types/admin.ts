import type { Role, User } from './auth';

export interface CreateCategoryRequest {
  name: string;
  displayOrder?: number;
  active?: boolean;
}

export interface UpdateCategoryRequest {
  name: string;
  displayOrder?: number;
  active?: boolean;
}

export interface CreateMenuItemRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  vegetarian?: boolean;
  available?: boolean;
  displayOrder?: number;
}

export interface UpdateMenuItemRequest {
  categoryId: number;
  name: string;
  description?: string;
  price: number;
  vegetarian?: boolean;
  available?: boolean;
  displayOrder?: number;
}

export interface CreateStaffRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateStaffRequest {
  email?: string;
  role?: Role;
  enabled?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
}

export type StaffUser = User;
