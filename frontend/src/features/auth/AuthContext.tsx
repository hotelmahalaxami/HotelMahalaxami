import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService } from '../../services/authService';
import type { AuthState, LoginRequest } from '../../types/auth';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(() => {
    const hasToken = typeof authService.isAuthenticated === 'function' && authService.isAuthenticated();
    const storedUser = typeof authService.getStoredUser === 'function' ? authService.getStoredUser() : null;
    const isAuth = Boolean(hasToken && storedUser);
    return {
      user: storedUser,
      token: hasToken ? 'persisted' : null,
      isAuthenticated: isAuth,
      // If token exists but user details are not yet cached, show loader while completing hydration
      isLoading: Boolean(hasToken && !storedUser),
    };
  });

  // On mount: if token exists, verify current user or complete hydration
  useEffect(() => {
    const initAuth = async () => {
      if (typeof authService.isAuthenticated === 'function' && authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          setState({
            user,
            token: 'persisted',
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err: unknown) {
          const apiErr = err as { status?: number };
          if (apiErr?.status === 401) {
            authService.logout();
            setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
          } else {
            // Cold boot, network drop, or temporary outage: retain hydrated session
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isAuthenticated: Boolean(prev.user),
            }));
          }
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
        token: 'persisted',
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
