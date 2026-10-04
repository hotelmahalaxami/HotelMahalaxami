import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { AuthState, LoginRequest } from '../../types/auth';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // On mount: if token exists in memory, fetch current user
  useEffect(() => {
    const initAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          setState({
            user,
            token: 'in-memory',  // actual token is in tokenStore
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };
    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const loginData = await authService.login(credentials);
      setState({
        user: loginData.user,
        token: 'in-memory',
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
