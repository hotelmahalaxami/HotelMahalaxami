import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from '../../../pages/LoginPage';
import { AuthProvider } from '../AuthContext';
import { authService } from '../../../services/authService';

vi.mock('../../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    isAuthenticated: vi.fn().mockReturnValue(false),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  }
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Helper: get the password input specifically by its placeholder text
// Using getByPlaceholderText avoids ambiguity with the "Show password" button aria-label
const getPasswordInput = () => screen.getByPlaceholderText(/enter your password/i);
const getUsernameInput = () => screen.getByLabelText(/Username or Email/i);

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with username, password and submit button', () => {
    renderWithRouter(<LoginPage />);
    expect(getUsernameInput()).toBeInTheDocument();
    expect(getPasswordInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    renderWithRouter(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Username or email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('shows API error message when login returns 401', async () => {
    vi.mocked(authService.login).mockRejectedValueOnce({
      status: 401,
      apiError: { message: 'Invalid credentials' },
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(getUsernameInput(), { target: { value: 'test' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('calls login service with correct credentials on submit', async () => {
    vi.mocked(authService.login).mockResolvedValueOnce({
      accessToken: 'token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: {
        id: 1,
        username: 'test',
        email: 'test@test.com',
        role: 'ADMIN',
        enabled: true,
        createdAt: '',
      },
    });

    renderWithRouter(<LoginPage />);

    fireEvent.change(getUsernameInput(), { target: { value: 'test' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith({
        usernameOrEmail: 'test',
        password: 'password',
      });
    });
  });

  it('shows loading state while submitting', async () => {
    // Mock a slow login so we can observe the loading state
    vi.mocked(authService.login).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 500))
    );

    renderWithRouter(<LoginPage />);

    fireEvent.change(getUsernameInput(), { target: { value: 'test' } });
    fireEvent.change(getPasswordInput(), { target: { value: 'password' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    // Button should be disabled and show "Signing in..." during load
    await waitFor(() => {
      expect(screen.getByText(/Signing in.../i)).toBeInTheDocument();
    });
  });
});
