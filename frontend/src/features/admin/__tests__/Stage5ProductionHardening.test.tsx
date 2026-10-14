import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tokenStore } from '../../../services/apiClient';

describe('Stage 5 — Production Hardening Frontend Audit', () => {
  beforeEach(() => {
    sessionStorage.clear();
    tokenStore.clearToken();
  });

  afterEach(() => {
    sessionStorage.clear();
    tokenStore.clearToken();
  });

  it('session persistence: preserves token across page reloads using sessionStorage', () => {
    expect(tokenStore.getToken()).toBeNull();

    tokenStore.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token');

    // Simulate page reload by resetting in-memory variable
    tokenStore._token = null;

    // Should seamlessly recover token from storage without requiring re-login
    expect(tokenStore.getToken()).toBe('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-token');
  });

  it('session termination: clearToken removes token from storage and memory', () => {
    tokenStore.setToken('sample-session-token');
    expect(tokenStore.getToken()).toBe('sample-session-token');

    tokenStore.clearToken();
    expect(tokenStore.getToken()).toBeNull();
    expect(sessionStorage.getItem('mahalaxmi_pos_token')).toBeNull();
  });
});
