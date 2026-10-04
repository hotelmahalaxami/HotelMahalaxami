export type Role = 'ADMIN' | 'STAFF';

export interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
