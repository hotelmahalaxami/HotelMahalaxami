import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { authService } from '../services/authService';
import type { ApiException } from '../types/api';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [slowNotice, setSlowNotice] = useState(false);

  // Pre-warm backend and database connection in the background as soon as login page loads
  useEffect(() => {
    authService.warmup();
  }, []);

  // Show helpful hint if server takes more than 4 seconds to respond
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isSubmitting) {
      timer = setTimeout(() => {
        setSlowNotice(true);
      }, 4000);
    } else {
      setSlowNotice(false);
    }
    return () => clearTimeout(timer);
  }, [isSubmitting]);

  if (isAuthenticated && !authLoading) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!formData.usernameOrEmail.trim()) errors.usernameOrEmail = 'Username or email is required';
    if (!formData.password) errors.password = 'Password is required';
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSlowNotice(false);
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const apiErr = err as ApiException;
      setError(apiErr.apiError?.message ?? 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setSlowNotice(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-ivory p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl border border-pos-border bg-white shadow-card">
        {/* Left Brand Panel */}
        <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-forest-900 p-10 text-white relative overflow-hidden">
          {/* Subtle geometric pattern accent */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                  <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
          </div>

          <div className="relative z-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-terracotta text-white font-bold text-xl shadow-md">
              M
            </div>
            <h1 className="mt-6 text-2xl font-bold tracking-tight text-white">Hotel Mahalaxmi</h1>
            <p className="text-xs font-medium uppercase tracking-wider text-forest-300 mt-1">
              Point of Sale & Restaurant Management
            </p>
            <p className="mt-4 text-xs leading-relaxed text-forest-200/90 max-w-sm">
              Streamlined tableside ticketing, kitchen orders, billing, and real-time revenue analytics built for daily service.
            </p>
          </div>

          <div className="relative z-10 border-t border-forest-800 pt-6">
            <div className="flex items-center gap-2 text-xs text-forest-300">
              <svg className="h-4 w-4 text-terracotta" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Ispurli, Kolhapur, Maharashtra</span>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex w-full md:w-1/2 flex-col justify-center p-8 sm:p-10">
          <div className="mb-6">
            <div className="flex items-center gap-2 md:hidden mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-terracotta text-white font-bold text-base shadow-sm">
                M
              </div>
              <div>
                <h2 className="text-base font-bold text-pos-text leading-tight">Hotel Mahalaxmi</h2>
                <p className="text-[11px] font-medium uppercase tracking-wider text-pos-muted">POS Terminal</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-pos-text">Sign in to POS</h2>
            <p className="mt-1 text-xs text-pos-muted">
              Enter your credentials to access your terminal session
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3.5 text-xs text-red-800"
              role="alert"
            >
              <svg className="h-4 w-4 flex-shrink-0 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username/Email */}
            <div>
              <label htmlFor="usernameOrEmail" className="block text-xs font-semibold text-pos-text mb-1.5">
                Username or Email
              </label>
              <input
                id="usernameOrEmail"
                name="usernameOrEmail"
                type="text"
                autoComplete="username"
                value={formData.usernameOrEmail}
                onChange={handleChange}
                placeholder="Enter your username or email"
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-pos-text placeholder:text-pos-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 ${
                  fieldErrors.usernameOrEmail
                    ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-red-200'
                    : 'border-pos-border hover:border-forest-300'
                }`}
              />
              {fieldErrors.usernameOrEmail && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.usernameOrEmail}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-pos-text mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-pos-text placeholder:text-pos-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-forest-700/20 focus:border-forest-700 ${
                    fieldErrors.password
                      ? 'border-red-400 bg-red-50/20 text-red-900 focus:border-red-500 focus:ring-red-200'
                      : 'border-pos-border hover:border-forest-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-text transition-colors p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-600 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-lg bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-terracotta-600 active:bg-terracotta-700 focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign in'
              )}
            </button>

            {slowNotice && (
              <p className="text-center text-xs text-terracotta-700 bg-terracotta-50 border border-terracotta-200 rounded p-2 animate-pulse">
                Server is waking up and connecting to database, please wait a few seconds...
              </p>
            )}
          </form>

          <p className="mt-8 text-center text-[11px] text-pos-muted">
            Hotel Mahalaxmi &copy; {new Date().getFullYear()} &bull; Authorized POS Staff Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
