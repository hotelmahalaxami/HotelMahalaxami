import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tokenStore, userStore } from '../../../services/apiClient';
import type { User } from '../../../types/auth';

describe('Stage 5 — Production Hardening Frontend Audit', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenStore.clearToken();
    userStore.clearUser();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenStore.clearToken();
    userStore.clearUser();
  });

  it('session persistence: preserves token across page reloads and browser restarts using localStorage', () => {
    expect(tokenStore.getToken()).toBeNull();

    tokenStore.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token');

    // Simulate page reload or browser restart by resetting in-memory variable
    tokenStore._token = null;

    // Should seamlessly recover token from persistent storage without requiring re-login
    expect(tokenStore.getToken()).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token');
    expect(localStorage.getItem('mahalaxmi_pos_token')).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token');
  });

  it('user profile persistence: preserves user info in localStorage for instant hydration', () => {
    const mockUser: User = {
      id: 1,
      username: 'admin',
      email: 'admin@mahalaxmi.com',
      role: 'ADMIN',
      enabled: true,
      createdAt: '2026-01-01T00:00:00',
    };

    userStore.setUser(mockUser);
    expect(userStore.getUser()).toEqual(mockUser);
    expect(localStorage.getItem('mahalaxmi_pos_user')).toContain('admin@mahalaxmi.com');

    userStore.clearUser();
    expect(userStore.getUser()).toBeNull();
    expect(localStorage.getItem('mahalaxmi_pos_user')).toBeNull();
  });

  it('session termination: clearToken removes token from storage and memory', () => {
    tokenStore.setToken('sample-session-token');
    expect(tokenStore.getToken()).toBe('sample-session-token');

    tokenStore.clearToken();
    expect(tokenStore.getToken()).toBeNull();
    expect(localStorage.getItem('mahalaxmi_pos_token')).toBeNull();
    expect(sessionStorage.getItem('mahalaxmi_pos_token')).toBeNull();
  });
});
