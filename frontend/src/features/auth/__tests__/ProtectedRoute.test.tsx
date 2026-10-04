import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../../../components/ProtectedRoute';
import * as AuthContext from '../AuthContext';

const renderWithRouter = (isAuthenticated: boolean, isLoading: boolean) => {
  vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
    isAuthenticated,
    isLoading,
    user: null,
    token: null,
    login: vi.fn(),
    logout: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/protected" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('redirects unauthenticated user to /login', () => {
    renderWithRouter(false, false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when user is authenticated', () => {
    renderWithRouter(true, false);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading spinner while auth is loading', () => {
    renderWithRouter(false, true);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });
});
