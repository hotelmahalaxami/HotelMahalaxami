import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import PublicLayout from '../../../layouts/PublicLayout';
import HomePage from '../HomePage';
import AboutPage from '../AboutPage';
import ContactPage from '../ContactPage';
import MenuPlaceholderPage from '../MenuPlaceholderPage';
import ProtectedRoute from '../../../components/ProtectedRoute';
import * as AuthContext from '../../../features/auth/AuthContext';

describe('Public Website Foundation (Phase 2)', () => {
  it('renders Public HomePage on root path without authentication', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Verify restaurant title & Kolhapur heritage are visible
    expect(screen.getAllByText(/Hotel Mahalaxmi/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Authentic Kolhapuri Heritage/i)).toBeInTheDocument();
    expect(screen.getByText(/Taste the True Essence of/i)).toBeInTheDocument();

    // Verify authentic dishes from database seed appear on page
    expect(screen.getByText('Special Mahalaxmi Thali')).toBeInTheDocument();
    expect(screen.getByText('Special Mutton Thali')).toBeInTheDocument();
    expect(screen.getByText('Special Veg Thali')).toBeInTheDocument();

    // Verify CTA buttons
    expect(screen.getByRole('link', { name: /Explore Full Menu/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Get Directions/i })).toBeInTheDocument();
  });

  it('renders discreet Admin/Staff login link in header and footer pointing to /login', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Check staff login links
    const loginLinks = screen.getAllByRole('link', { name: /Staff|Admin/i });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);

    const hasLoginHref = loginLinks.some((link) => link.getAttribute('href') === '/login');
    expect(hasLoginHref).toBe(true);
  });

  it('renders navigation links and toggles mobile drawer', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    // Desktop nav items
    expect(screen.getAllByRole('link', { name: /^Home$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Menu$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Our Story$/i })[0]).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /^Contact & Location$/i })[0]).toBeInTheDocument();

    // Mobile menu button
    const toggleButton = screen.getByLabelText(/Toggle navigation menu/i);
    expect(toggleButton).toBeInTheDocument();
    fireEvent.click(toggleButton);

    // Mobile drawer should be opened
    expect(screen.getByText(/Staff & Management Portal/i)).toBeInTheDocument();
  });

  it('renders About Page with Kolhapuri tradition and Tambda-Pandhra rassa details', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/about" element={<AboutPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/The Story of Hotel Mahalaxmi/i)).toBeInTheDocument();
    expect(screen.getByText(/Rooted in the Soil of Karveer & Ispurli/i)).toBeInTheDocument();
    expect(screen.getByText(/The Legend of Tambda & Pandhra Rassa/i)).toBeInTheDocument();
  });

  it('renders Contact Page with address, operating hours, and Google Maps link', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/contact" element={<ContactPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Contact & Location/i })).toBeInTheDocument();
    expect(screen.getByText(/Opening Hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Restaurant Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Telephone & Desk/i)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Google Maps/i })[0]).toBeInTheDocument();
  });

  it('renders Menu preview page for /menu in Phase 2', () => {
    render(
      <MemoryRouter initialEntries={['/menu']}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/menu" element={<MenuPlaceholderPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Our Restaurant Menu/i })).toBeInTheDocument();
    expect(screen.getByText(/Authentic Thali Feasts/i)).toBeInTheDocument();
    expect(screen.getByText(/Chicken Specialties/i)).toBeInTheDocument();
    expect(screen.getByText(/Mutton Specialties/i)).toBeInTheDocument();
  });

  it('verifies that protected routes like /dashboard still redirect to /login when unauthenticated', () => {
    vi.spyOn(AuthContext, 'useAuth').mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/login" element={<div>Login Page Target</div>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Protected Secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Login Page Target')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Protected Secret')).not.toBeInTheDocument();
  });
});
