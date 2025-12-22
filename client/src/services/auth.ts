import api from './api';
import type { 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  User 
} from '../types';

// Register a new user
export const register = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/register', credentials);
  return response.data;
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

// Get current user
export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await api.get<{ user: User }>('/auth/me');
  return response.data;
};

// Logout (client-side only)
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
